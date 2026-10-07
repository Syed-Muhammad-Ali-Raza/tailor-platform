import request from 'supertest';
import { makeApp, TestApp } from '../helpers/app';
import { bearer, CUSTOMER } from '../helpers/auth';

const validValues = {
  length: 40,
  chest: 40,
  waist: 38,
  shoulder: 18,
  sleeve: 23,
  neck: 15,
  daman: 24,
  shalwarLength: 42,
  shalwarWaist: 32,
  bottomWidth: 14,
};

describe('measurements API', () => {
  let ctx: TestApp;

  beforeEach(() => {
    ctx = makeApp();
  });

  it('creates a measurement with valid values', async () => {
    ctx.prisma.measurement.create.mockResolvedValue({
      id: 'm1',
      customerId: CUSTOMER.sub,
      label: 'My suit',
      garmentType: 'MEN_SHALWAR_KAMEEZ',
      values: validValues,
    });

    const res = await request(ctx.app)
      .post('/api/v1/measurements')
      .set(bearer(CUSTOMER))
      .send({ label: 'My suit', garmentType: 'MEN_SHALWAR_KAMEEZ', values: validValues });

    expect(res.status).toBe(201);
    expect(res.body.data.measurement.id).toBe('m1');
    expect(ctx.prisma.measurement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ customerId: CUSTOMER.sub }),
      }),
    );
  });

  it('rejects missing measurement fields with field details', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/measurements')
      .set(bearer(CUSTOMER))
      .send({ label: 'Incomplete', garmentType: 'MEN_SHALWAR_KAMEEZ', values: { length: 40 } });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThan(1);
    expect(ctx.prisma.measurement.create).not.toHaveBeenCalled();
  });

  it('rejects an unknown garment type', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/measurements')
      .set(bearer(CUSTOMER))
      .send({ label: 'Alien', garmentType: 'ALIEN_SUIT', values: {} });

    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await request(ctx.app).get('/api/v1/measurements');
    expect(res.status).toBe(401);
  });

  it('lists a customer measurements', async () => {
    ctx.prisma.measurement.findMany.mockResolvedValue([
      { id: 'm1', label: 'My suit', garmentType: 'MEN_SHALWAR_KAMEEZ', values: validValues },
    ]);

    const res = await request(ctx.app)
      .get('/api/v1/measurements')
      .set(bearer(CUSTOMER));

    expect(res.status).toBe(200);
    expect(res.body.data.measurements).toHaveLength(1);
    expect(ctx.prisma.measurement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { customerId: CUSTOMER.sub } }),
    );
  });

  it('updates an owned measurement', async () => {
    ctx.prisma.measurement.findFirst.mockResolvedValue({
      id: 'm1',
      garmentType: 'MEN_SHALWAR_KAMEEZ',
    });
    ctx.prisma.measurement.update.mockResolvedValue({
      id: 'm1',
      label: 'Renamed',
      garmentType: 'MEN_SHALWAR_KAMEEZ',
      values: validValues,
    });

    const res = await request(ctx.app)
      .put('/api/v1/measurements/m1')
      .set(bearer(CUSTOMER))
      .send({ label: 'Renamed' });

    expect(res.status).toBe(200);
    expect(res.body.data.measurement.label).toBe('Renamed');
  });

  it('404s when updating someone else measurement', async () => {
    ctx.prisma.measurement.findFirst.mockResolvedValue(null);

    const res = await request(ctx.app)
      .put('/api/v1/measurements/other')
      .set(bearer(CUSTOMER))
      .send({ label: 'Nope' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('validates values on update too', async () => {
    ctx.prisma.measurement.findFirst.mockResolvedValue({
      id: 'm1',
      garmentType: 'MEN_SHALWAR_KAMEEZ',
    });

    const res = await request(ctx.app)
      .put('/api/v1/measurements/m1')
      .set(bearer(CUSTOMER))
      .send({ values: { ...validValues, chest: 999 } });

    expect(res.status).toBe(400);
    expect(ctx.prisma.measurement.update).not.toHaveBeenCalled();
  });

  it('deletes an owned measurement with 204', async () => {
    ctx.prisma.measurement.findFirst.mockResolvedValue({ id: 'm1', garmentType: 'MEN_KURTA' });
    ctx.prisma.measurement.delete.mockResolvedValue({});

    const res = await request(ctx.app)
      .delete('/api/v1/measurements/m1')
      .set(bearer(CUSTOMER));

    expect(res.status).toBe(204);
  });
});
