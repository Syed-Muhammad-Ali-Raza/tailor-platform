import request from 'supertest';
import { makeApp, TestApp } from '../helpers/app';
import { bearer, CUSTOMER, TAILOR, tailorRow } from '../helpers/auth';

const orderSummaryRow = {
  id: 'o1',
  orderNumber: 'TP-ABCD2345',
  status: 'STITCHING',
  totalPrice: 6900,
  finalPrice: null,
  deliveryType: 'DELIVERY',
  dueDate: null,
  createdAt: new Date(),
  items: [{ id: 'oi1' }],
  customer: { name: 'Sara' },
  tailor: { shopName: 'Rafiq Tailors', whatsapp: '+923001234567' },
};

describe('dashboard API', () => {
  let ctx: TestApp;

  beforeEach(() => {
    ctx = makeApp();
  });

  it('requires authentication', async () => {
    const res = await request(ctx.app).get('/api/v1/dashboard/summary');
    expect(res.status).toBe(401);
  });

  it('rejects non-tailors', async () => {
    const res = await request(ctx.app)
      .get('/api/v1/dashboard/summary')
      .set(bearer(CUSTOMER));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('returns summary metrics for a tailor', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.order.groupBy.mockResolvedValue([
      { status: 'PLACED', _count: { _all: 5 } },
      { status: 'STITCHING', _count: { _all: 1 } },
    ]);
    ctx.prisma.order.count.mockResolvedValue(2);
    ctx.prisma.order.aggregate.mockResolvedValue({ _sum: { totalPrice: 15000 } });

    const res = await request(ctx.app)
      .get('/api/v1/dashboard/summary')
      .set(bearer(TAILOR));

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      newToday: 2,
      activeOrders: 2,
      readyOrders: 2,
      deliveredThisMonth: 2,
      expectedRevenue: 15000,
      ordersByStatus: { PLACED: 5, STITCHING: 1 },
    });
    expect(ctx.prisma.tailor.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: TAILOR.sub } }),
    );
  });

  it('lists tailor orders with pagination', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.order.findMany.mockResolvedValue([orderSummaryRow]);
    ctx.prisma.order.count.mockResolvedValue(3);

    const res = await request(ctx.app)
      .get('/api/v1/dashboard/orders?page=1&limit=10')
      .set(bearer(TAILOR));

    expect(res.status).toBe(200);
    expect(res.body.data.orders).toHaveLength(1);
    expect(res.body.data.orders[0].tailorShopName).toBe('Rafiq Tailors');
    expect(res.body.data).toMatchObject({ page: 1, limit: 10, total: 3 });
    expect(ctx.prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 }),
    );
  });

  it('applies a status filter for the tailor', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.order.findMany.mockResolvedValue([orderSummaryRow]);
    ctx.prisma.order.count.mockResolvedValue(1);

    const res = await request(ctx.app)
      .get('/api/v1/dashboard/orders?status=READY')
      .set(bearer(TAILOR));

    expect(res.status).toBe(200);
    expect(ctx.prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'READY' }) }),
    );
  });

  it('rejects an unknown status filter', async () => {
    const res = await request(ctx.app)
      .get('/api/v1/dashboard/orders?status=BOGUS')
      .set(bearer(TAILOR));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
