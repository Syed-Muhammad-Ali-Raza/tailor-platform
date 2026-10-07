import request from 'supertest';
import { makeApp, TestApp } from '../helpers/app';
import { bearer, CUSTOMER } from '../helpers/auth';

function deliveredOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'o1',
    orderNumber: 'TP-ABCD9999',
    customerId: CUSTOMER.sub,
    tailorId: 'tailor-1',
    status: 'DELIVERED',
    totalPrice: 6500,
    ...overrides,
  };
}

function reviewRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'r1',
    orderId: 'o1',
    rating: 5,
    comment: 'Beautiful stitching',
    createdAt: new Date(),
    ...overrides,
  };
}

describe('reviews API', () => {
  let ctx: TestApp;

  beforeEach(() => {
    ctx = makeApp();
  });

  it('creates a review on a delivered order', async () => {
    ctx.prisma.order.findFirst.mockResolvedValue(deliveredOrder());
    ctx.prisma.review.findUnique.mockResolvedValue(null);
    ctx.prisma.review.create.mockResolvedValue(reviewRow());

    const res = await request(ctx.app)
      .post('/api/v1/orders/o1/review')
      .set(bearer(CUSTOMER))
      .send({ rating: 5, comment: 'Beautiful stitching' });

    expect(res.status).toBe(201);
    expect(res.body.data.review.rating).toBe(5);
    expect(res.body.data.review.comment).toBe('Beautiful stitching');
    expect(ctx.prisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ orderId: 'o1', rating: 5 }),
      }),
    );
  });

  it('rejects a review before delivery', async () => {
    ctx.prisma.order.findFirst.mockResolvedValue(deliveredOrder({ status: 'PLACED' }));

    const res = await request(ctx.app)
      .post('/api/v1/orders/o1/review')
      .set(bearer(CUSTOMER))
      .send({ rating: 5 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
    expect(ctx.prisma.review.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate review', async () => {
    ctx.prisma.order.findFirst.mockResolvedValue(deliveredOrder());
    ctx.prisma.review.findUnique.mockResolvedValue(reviewRow());

    const res = await request(ctx.app)
      .post('/api/v1/orders/o1/review')
      .set(bearer(CUSTOMER))
      .send({ rating: 4 });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('404s when the order is not owned by the customer', async () => {
    ctx.prisma.order.findFirst.mockResolvedValue(null);

    const res = await request(ctx.app)
      .post('/api/v1/orders/o1/review')
      .set(bearer(CUSTOMER))
      .send({ rating: 5 });

    expect(res.status).toBe(404);
  });

  it('requires authentication', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/orders/o1/review')
      .send({ rating: 5 });

    expect(res.status).toBe(401);
  });

  it('rejects an out-of-range rating', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/orders/o1/review')
      .set(bearer(CUSTOMER))
      .send({ rating: 6 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('updates an own review', async () => {
    ctx.prisma.review.findFirst.mockResolvedValue(reviewRow({ rating: 4 }));
    ctx.prisma.review.update.mockResolvedValue(reviewRow({ rating: 2 }));

    const res = await request(ctx.app)
      .put('/api/v1/orders/o1/review')
      .set(bearer(CUSTOMER))
      .send({ rating: 2 });

    expect(res.status).toBe(200);
    expect(res.body.data.review.rating).toBe(2);
    expect(ctx.prisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'r1' }, data: { rating: 2 } }),
    );
  });

  it('rejects an empty update', async () => {
    const res = await request(ctx.app)
      .put('/api/v1/orders/o1/review')
      .set(bearer(CUSTOMER))
      .send({});

    expect(res.status).toBe(400);
  });

  it('404s updating a missing review', async () => {
    ctx.prisma.review.findFirst.mockResolvedValue(null);

    const res = await request(ctx.app)
      .put('/api/v1/orders/o1/review')
      .set(bearer(CUSTOMER))
      .send({ rating: 3 });

    expect(res.status).toBe(404);
  });

  it('lists reviews for a design with the average rating', async () => {
    ctx.prisma.design.findUnique.mockResolvedValue({ id: 'design-1', active: true });
    ctx.prisma.review.findMany.mockResolvedValue([
      reviewRow({
        order: {
          customer: { name: 'Sara' },
          items: [{ designName: 'Classic Kameez' }],
        },
      }),
    ]);
    ctx.prisma.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: 2 });

    const res = await request(ctx.app).get('/api/v1/designs/design-1/reviews');

    expect(res.status).toBe(200);
    expect(res.body.data.reviews).toHaveLength(1);
    expect(res.body.data.reviews[0].customerName).toBe('Sara');
    expect(res.body.data.reviews[0].designName).toBe('Classic Kameez');
    expect(res.body.data.averageRating).toBe(4.5);
    expect(res.body.data.total).toBe(2);
    expect(ctx.prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { order: { items: { some: { designId: 'design-1' } } } },
      }),
    );
  });

  it('404s listing reviews for a missing design', async () => {
    ctx.prisma.design.findUnique.mockResolvedValue(null);

    const res = await request(ctx.app).get('/api/v1/designs/missing/reviews');

    expect(res.status).toBe(404);
  });
});