import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../../src/config/env';
import { makeApp, TestApp } from '../helpers/app';
import { bearer, CUSTOMER } from '../helpers/auth';

const activeDesign = {
  id: 'design-1',
  tailorId: 'tailor-1',
  name: 'Classic Kameez',
  audience: 'MEN',
  category: 'SHALWAR_KAMEEZ',
  basePrice: 2800,
  active: true,
  fabrics: [],
  options: [],
};

describe('style preview (tryon) API', () => {
  let ctx: TestApp;

  beforeEach(() => {
    ctx = makeApp();
  });

  afterEach(() => {
    env.TRYON_ENABLED = false;
  });

  it('stubs with 501 while disabled', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/tryon/preview')
      .set(bearer(CUSTOMER))
      .send({ designId: 'design-1' });

    expect(res.status).toBe(501);
    expect(res.body.error.code).toBe('FEATURE_DISABLED');
    expect(res.body.error.message).toContain('Style Preview');
    expect(ctx.prisma.tryOnRequest.create).not.toHaveBeenCalled();
  });

  it('requires authentication', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/tryon/preview')
      .send({ designId: 'design-1' });
    expect(res.status).toBe(401);
  });

  it('generates a preview when enabled', async () => {
    env.TRYON_ENABLED = true;
    ctx.prisma.design.findUnique.mockResolvedValue(activeDesign);
    ctx.prisma.tryOnRequest.count.mockResolvedValue(0);
    ctx.prisma.tryOnRequest.create.mockResolvedValue({ id: 'tr1', createdAt: new Date() });

    const res = await request(ctx.app)
      .post('/api/v1/tryon/preview')
      .set(bearer(CUSTOMER))
      .send({ designId: 'design-1' });

    expect(res.status).toBe(201);
    expect(res.body.data.preview.label).toBe('Style Preview');
    expect(res.body.data.preview.imageUrl).toBe('/uploads/preview.svg');
    expect(ctx.tryOnProvider.generatePreview).toHaveBeenCalledTimes(1);
    expect(ctx.prisma.tryOnRequest.create).toHaveBeenCalledTimes(1);
  });

  it('enforces the daily quota', async () => {
    env.TRYON_ENABLED = true;
    ctx.prisma.design.findUnique.mockResolvedValue(activeDesign);
    ctx.prisma.tryOnRequest.count.mockResolvedValue(env.TRYON_FREE_DAILY_LIMIT);

    const res = await request(ctx.app)
      .post('/api/v1/tryon/preview')
      .set(bearer(CUSTOMER))
      .send({ designId: 'design-1' });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMITED');
    expect(ctx.tryOnProvider.generatePreview).not.toHaveBeenCalled();
  });

  it('404s for a missing design when enabled', async () => {
    env.TRYON_ENABLED = true;
    ctx.prisma.design.findUnique.mockResolvedValue(null);

    const res = await request(ctx.app)
      .post('/api/v1/tryon/preview')
      .set(bearer(CUSTOMER))
      .send({ designId: 'missing' });

    expect(res.status).toBe(404);
  });

  it('rejects a missing designId', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/tryon/preview')
      .set(bearer(CUSTOMER))
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('uploads API', () => {
  let ctx: TestApp;

  beforeEach(() => {
    ctx = makeApp();
  });

  function cleanup(url: string) {
    const file = path.join(process.cwd(), 'uploads', path.basename(url));
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }

  it('requires authentication', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/uploads')
      .attach('file', Buffer.from('x'), { filename: 'a.png', contentType: 'image/png' });
    expect(res.status).toBe(401);
  });

  it('accepts a png and returns a private upload path', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/uploads')
      .set(bearer(CUSTOMER))
      .attach('file', Buffer.from('fake-png'), { filename: 'photo.png', contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body.data.url).toMatch(/^\/uploads\/.+\.png$/);
    cleanup(res.body.data.url);
  });

  it('rejects a non-image file', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/uploads')
      .set(bearer(CUSTOMER))
      .attach('file', Buffer.from('plain'), { filename: 'notes.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a request without a file', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/uploads')
      .set(bearer(CUSTOMER));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
