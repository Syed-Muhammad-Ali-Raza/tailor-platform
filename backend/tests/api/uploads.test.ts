import fs from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { makeApp, TestApp } from '../helpers/app';
import { bearer, CUSTOMER, TAILOR, tailorRow } from '../helpers/auth';
import { PRIVATE_UPLOADS_DIR } from '../../src/controllers/uploads.controller';

const PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01,
]);

function orderWithPhoto(overrides: Record<string, unknown> = {}) {
  return {
    id: 'o1',
    orderNumber: 'TP-ABCD9999',
    customerId: CUSTOMER.sub,
    tailorId: 'tailor-1',
    status: 'PLACED',
    referencePhotoUrl: '/uploads/secret-photo.png',
    ...overrides,
  };
}

describe('uploads API', () => {
  let ctx: TestApp;

  beforeEach(() => {
    ctx = makeApp();
  });

  afterAll(() => {
    fs.rmSync(PRIVATE_UPLOADS_DIR, { recursive: true, force: true });
  });

  it('404s a reference photo without a token', async () => {
    const res = await request(ctx.app).get('/api/v1/uploads/secret-photo.png');
    expect(res.status).toBe(401);
    expect(ctx.prisma.order.findFirst).not.toHaveBeenCalled();
  });

  it('serves a reference photo to its owner', async () => {
    fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true });
    fs.writeFileSync(path.join(PRIVATE_UPLOADS_DIR, 'secret-photo.png'), PNG_BYTES);
    ctx.prisma.order.findFirst.mockResolvedValue(orderWithPhoto());

    const res = await request(ctx.app)
      .get('/api/v1/uploads/secret-photo.png')
      .set(bearer(CUSTOMER));

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/png');
    expect(res.body).toEqual(PNG_BYTES);
    expect(ctx.prisma.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          referencePhotoUrl: { endsWith: '/uploads/secret-photo.png' },
        }),
      }),
    );
  });

  it('serves a reference photo to the owning tailor', async () => {
    fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true });
    fs.writeFileSync(path.join(PRIVATE_UPLOADS_DIR, 'secret-photo.png'), PNG_BYTES);
    ctx.prisma.order.findFirst.mockResolvedValue(orderWithPhoto());
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);

    const res = await request(ctx.app)
      .get('/api/v1/uploads/secret-photo.png')
      .set(bearer(TAILOR));

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/png');
  });

  it('hides a reference photo from an unrelated customer', async () => {
    ctx.prisma.order.findFirst.mockResolvedValue(
      orderWithPhoto({ customerId: 'someone-else' }),
    );

    const res = await request(ctx.app)
      .get('/api/v1/uploads/secret-photo.png')
      .set(bearer(CUSTOMER));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('404s an unknown or non-image upload name', async () => {
    ctx.prisma.order.findFirst.mockResolvedValue(null);

    const res = await request(ctx.app)
      .get('/api/v1/uploads/nope.txt')
      .set(bearer(CUSTOMER));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('stores an upload in the private dir and returns an API url', async () => {
    const name = `test-${Date.now()}.png`;
    const before = fs.existsSync(PRIVATE_UPLOADS_DIR)
      ? fs.readdirSync(PRIVATE_UPLOADS_DIR).length
      : 0;

    const res = await request(ctx.app)
      .post('/api/v1/uploads')
      .set(bearer(CUSTOMER))
      .attach('file', PNG_BYTES, { filename: name, contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body.data.url).toMatch(/^\/uploads\/[0-9a-f-]+\.png$/);

    const files = fs.readdirSync(PRIVATE_UPLOADS_DIR);
    expect(files.length).toBe(before + 1);
    const stored = files.find((file) => !file.startsWith('test-'));
    if (stored) {
      fs.rmSync(path.join(PRIVATE_UPLOADS_DIR, stored), { force: true });
    }
  });
});