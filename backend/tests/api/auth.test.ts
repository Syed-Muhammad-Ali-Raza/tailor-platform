import request from 'supertest';
import bcrypt from 'bcryptjs';
import { makeApp, TestApp } from '../helpers/app';
import { bearer, CUSTOMER, TAILOR } from '../helpers/auth';

const SLOW_HASH = bcrypt.hashSync('password123', 4);

describe('auth API', () => {
  let ctx: TestApp;

  beforeEach(() => {
    ctx = makeApp();
  });

  it('registers a customer', async () => {
    ctx.prisma.user.findUnique.mockResolvedValue(null);
    ctx.prisma.user.create.mockResolvedValue({
      id: 'u1',
      name: 'Sara',
      phone: '03001234567',
      email: null,
      role: 'CUSTOMER',
    });

    const res = await request(ctx.app).post('/api/v1/auth/register').send({
      name: 'Sara',
      phone: '03001234567',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.user).toEqual({
      id: 'u1',
      name: 'Sara',
      phone: '03001234567',
      email: null,
      role: 'CUSTOMER',
    });
    expect(ctx.prisma.tailor.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate phone with 409', async () => {
    ctx.prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

    const res = await request(ctx.app).post('/api/v1/auth/register').send({
      name: 'Dup',
      phone: '03001234567',
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects an invalid phone with 400 VALIDATION_ERROR', async () => {
    const res = await request(ctx.app).post('/api/v1/auth/register').send({
      name: 'Bad',
      phone: '12345',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });

  it('creates a tailor profile for TAILOR role', async () => {
    ctx.prisma.user.findUnique.mockResolvedValue(null);
    ctx.prisma.user.create.mockResolvedValue({
      id: 'u2',
      name: 'Rafiq',
      phone: '03009876543',
      email: null,
      role: 'TAILOR',
    });
    ctx.prisma.tailor.create.mockResolvedValue({ id: 'tailor-1' });

    const res = await request(ctx.app).post('/api/v1/auth/register').send({
      name: 'Rafiq',
      phone: '03009876543',
      password: 'password123',
      role: 'TAILOR',
    });

    expect(res.status).toBe(201);
    expect(ctx.prisma.tailor.create).toHaveBeenCalledTimes(1);
    expect(res.body.data.user.role).toBe('TAILOR');
  });

  it('logs in with valid credentials', async () => {
    ctx.prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      name: 'Sara',
      phone: '03001234567',
      email: null,
      role: 'CUSTOMER',
      passwordHash: SLOW_HASH,
    });

    const res = await request(ctx.app)
      .post('/api/v1/auth/login')
      .send({ identifier: '03001234567', password: 'password123' });

    expect(res.status).toBe(200);
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.user.phone).toBe('03001234567');
  });

  it('rejects a wrong password with 401', async () => {
    ctx.prisma.user.findFirst.mockResolvedValue({
      id: 'u1',
      name: 'Sara',
      phone: '03001234567',
      email: null,
      role: 'CUSTOMER',
      passwordHash: SLOW_HASH,
    });

    const res = await request(ctx.app)
      .post('/api/v1/auth/login')
      .send({ identifier: '03001234567', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects an unknown identifier with 401', async () => {
    ctx.prisma.user.findFirst.mockResolvedValue(null);

    const res = await request(ctx.app)
      .post('/api/v1/auth/login')
      .send({ identifier: '03000000000', password: 'password123' });

    expect(res.status).toBe(401);
  });

  it('returns the current user', async () => {
    ctx.prisma.user.findUnique.mockResolvedValue({
      id: CUSTOMER.sub,
      name: 'Sara',
      phone: '03001234567',
      email: null,
      role: 'CUSTOMER',
    });

    const res = await request(ctx.app)
      .get('/api/v1/auth/me')
      .set(bearer(CUSTOMER));

    expect(res.status).toBe(200);
    expect(res.body.data.user.id).toBe(CUSTOMER.sub);
  });

  it('rejects requests without a token', async () => {
    const res = await request(ctx.app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects a garbage token', async () => {
    const res = await request(ctx.app)
      .get('/api/v1/auth/me')
      .set({ Authorization: 'Bearer not-a-jwt' });
    expect(res.status).toBe(401);
  });

  it('serves a health check', async () => {
    const res = await request(ctx.app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });

  it('requires TAILOR role for tailor-scoped routes', async () => {
    const res = await request(ctx.app)
      .get('/api/v1/tailor/designs')
      .set(bearer(CUSTOMER));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(TAILOR.role).toBe('TAILOR');
  });
});
