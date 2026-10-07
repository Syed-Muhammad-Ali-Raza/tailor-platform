import request from 'supertest';
import { makeApp, TestApp } from '../helpers/app';
import { bearer, TAILOR, tailorRow } from '../helpers/auth';

const designRow = {
  id: 'design-1',
  tailorId: tailorRow.id,
  name: 'Classic Kameez',
  audience: 'MEN',
  category: 'SHALWAR_KAMEEZ',
  basePrice: 2800,
  images: ['/img1.jpg'],
  description: 'Cotton kameez',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  tailor: {
    id: tailorRow.id,
    shopName: 'Rafiq Tailors',
    whatsapp: '+923001234567',
    city: 'Lahore',
    rating: 4.5,
  },
  fabrics: [],
  options: [],
};

describe('catalog API', () => {
  let ctx: TestApp;

  beforeEach(() => {
    ctx = makeApp();
  });

  it('lists active designs with pagination', async () => {
    ctx.prisma.design.findMany.mockResolvedValue([designRow]);
    ctx.prisma.design.count.mockResolvedValue(1);

    const res = await request(ctx.app).get('/api/v1/designs');

    expect(res.status).toBe(200);
    expect(res.body.data.designs).toHaveLength(1);
    expect(res.body.data.designs[0].basePrice).toBe(2800);
    expect(res.body.data.designs[0].tailorName).toBe('Rafiq Tailors');
    expect(res.body.data).toMatchObject({ page: 1, limit: 20, total: 1 });
    expect(ctx.prisma.design.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
  });

  it('rejects an invalid audience filter', async () => {
    const res = await request(ctx.app).get('/api/v1/designs?audience=ALIEN');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns a design detail', async () => {
    ctx.prisma.design.findUnique.mockResolvedValue(designRow);

    const res = await request(ctx.app).get('/api/v1/designs/design-1');

    expect(res.status).toBe(200);
    expect(res.body.data.design.id).toBe('design-1');
    expect(res.body.data.design.fabrics).toEqual([]);
    expect(res.body.data.design.styleOptions).toEqual([]);
  });

  it('404s for a missing or inactive design', async () => {
    ctx.prisma.design.findUnique.mockResolvedValue(null);
    const missing = await request(ctx.app).get('/api/v1/designs/nope');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('NOT_FOUND');

    ctx.prisma.design.findUnique.mockResolvedValue({ ...designRow, active: false });
    const inactive = await request(ctx.app).get('/api/v1/designs/design-1');
    expect(inactive.status).toBe(404);
  });

  it('lists tailors', async () => {
    ctx.prisma.tailor.findMany.mockResolvedValue([tailorRow]);

    const res = await request(ctx.app).get('/api/v1/tailors?city=Lahore');

    expect(res.status).toBe(200);
    expect(res.body.data.tailors[0].shopName).toBe('Rafiq Tailors');
    expect(ctx.prisma.tailor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 }),
    );
  });

  it('returns a tailor detail and 404s when missing', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    const found = await request(ctx.app).get('/api/v1/tailors/tailor-1');
    expect(found.status).toBe(200);
    expect(found.body.data.tailor.id).toBe('tailor-1');

    ctx.prisma.tailor.findUnique.mockResolvedValue(null);
    const missing = await request(ctx.app).get('/api/v1/tailors/nope');
    expect(missing.status).toBe(404);
  });

  it('requires auth for tailor design management', async () => {
    const res = await request(ctx.app).post('/api/v1/tailor/designs').send({});
    expect(res.status).toBe(401);
  });

  it('lets a tailor create a design', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.design.create.mockResolvedValue({ ...designRow, createdAt: undefined });

    const res = await request(ctx.app)
      .post('/api/v1/tailor/designs')
      .set(bearer(TAILOR))
      .send({
        name: 'Classic Kameez',
        audience: 'MEN',
        category: 'SHALWAR_KAMEEZ',
        basePrice: 2800,
        images: ['/img1.jpg'],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.design.name).toBe('Classic Kameez');
    expect(res.body.data.design.basePrice).toBe(2800);
    expect(ctx.prisma.design.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tailorId: tailorRow.id, active: true }),
      }),
    );
  });

  it('rejects a negative base price', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/tailor/designs')
      .set(bearer(TAILOR))
      .send({ name: 'Cheap', audience: 'MEN', category: 'KURTA', basePrice: -5 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('404s when updating a design the tailor does not own', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.design.findFirst.mockResolvedValue(null);

    const res = await request(ctx.app)
      .put('/api/v1/tailor/designs/design-2')
      .set(bearer(TAILOR))
      .send({ name: 'Renamed' });

    expect(res.status).toBe(404);
  });

  it('updates an owned design', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.design.findFirst.mockResolvedValue(designRow);
    ctx.prisma.design.update.mockResolvedValue({ ...designRow, name: 'Renamed Kameez' });

    const res = await request(ctx.app)
      .put('/api/v1/tailor/designs/design-1')
      .set(bearer(TAILOR))
      .send({ name: 'Renamed Kameez' });

    expect(res.status).toBe(200);
    expect(res.body.data.design.name).toBe('Renamed Kameez');
  });

  it('deletes an owned design with 204', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.design.findFirst.mockResolvedValue(designRow);
    ctx.prisma.design.delete.mockResolvedValue(designRow);

    const res = await request(ctx.app)
      .delete('/api/v1/tailor/designs/design-1')
      .set(bearer(TAILOR));

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });

  it('creates a fabric under an owned design', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.design.findFirst.mockResolvedValue(designRow);
    ctx.prisma.fabric.create.mockResolvedValue({
      id: 'fab-1',
      designId: 'design-1',
      tailorId: tailorRow.id,
      name: 'Lawn',
      pricePerMeter: 1200,
      extraCharge: 250,
      image: null,
    });

    const res = await request(ctx.app)
      .post('/api/v1/tailor/designs/design-1/fabrics')
      .set(bearer(TAILOR))
      .send({ name: 'Lawn', pricePerMeter: 1200, extraCharge: 250 });

    expect(res.status).toBe(201);
    expect(res.body.data.fabric.extraCharge).toBe(250);
  });

  it('deletes a fabric with 204', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.fabric.findFirst.mockResolvedValue({ id: 'fab-1', tailorId: tailorRow.id });
    ctx.prisma.fabric.delete.mockResolvedValue({});

    const res = await request(ctx.app)
      .delete('/api/v1/tailor/fabrics/fab-1')
      .set(bearer(TAILOR));

    expect(res.status).toBe(204);
  });

  it('404s when deleting a fabric owned by someone else', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.fabric.findFirst.mockResolvedValue(null);

    const res = await request(ctx.app)
      .delete('/api/v1/tailor/fabrics/fab-x')
      .set(bearer(TAILOR));

    expect(res.status).toBe(404);
  });

  it('lists the tailor own designs', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.design.findMany.mockResolvedValue([designRow]);

    const res = await request(ctx.app)
      .get('/api/v1/tailor/designs')
      .set(bearer(TAILOR));

    expect(res.status).toBe(200);
    expect(res.body.data.designs).toHaveLength(1);
    expect(res.body.data.designs[0].id).toBe('design-1');
  });
});
