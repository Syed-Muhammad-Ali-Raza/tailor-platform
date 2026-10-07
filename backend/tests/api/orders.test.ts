import request from 'supertest';
import { makeApp, TestApp } from '../helpers/app';
import { bearer, CUSTOMER, TAILOR, tailorRow } from '../helpers/auth';

const designWithExtras = {
  id: 'design-1',
  tailorId: tailorRow.id,
  name: 'Classic Kameez',
  audience: 'MEN',
  category: 'SHALWAR_KAMEEZ',
  basePrice: 2800,
  active: true,
  fabrics: [{ id: 'fab-1', name: 'Cotton', extraCharge: 300, pricePerMeter: 1000, image: null }],
  options: [{ id: 'opt-1', type: 'COLLAR', name: 'Ban Collar', extraPrice: 150 }],
};

function placedOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'o1',
    orderNumber: 'TP-ABCD2345',
    customerId: CUSTOMER.sub,
    tailorId: tailorRow.id,
    status: 'PLACED',
    totalPrice: 6500,
    finalPrice: null,
    deliveryType: 'DELIVERY',
    dueDate: null,
    notes: null,
    referencePhotoUrl: null,
    quotedAt: null,
    cancelReason: null,
    createdAt: new Date(),
    items: [
      {
        id: 'oi1',
        designId: 'design-1',
        designName: 'Classic Kameez',
        fabricName: 'Cotton',
        quantity: 2,
        price: 6500,
        measurementId: null,
        selectedOptions: [{ name: 'Ban Collar', extraPrice: 150 }],
      },
    ],
    customer: { name: 'Sara', phone: '03001234567' },
    tailor: { shopName: 'Rafiq Tailors', whatsapp: '+923001234567' },
    payment: { method: 'COD', amount: 6500, status: 'PENDING' },
    statusEvents: [{ id: 'ev1', from: null, to: 'PLACED', note: null, createdAt: new Date() }],
    ...overrides,
  };
}

const createBody = {
  designId: 'design-1',
  fabricId: 'fab-1',
  optionIds: ['opt-1'],
  quantity: 2,
  deliveryType: 'DELIVERY',
  paymentMethod: 'COD',
  notes: 'Please finish before Eid',
};

describe('orders API', () => {
  let ctx: TestApp;

  beforeEach(() => {
    ctx = makeApp();
  });

  it('creates an order with server-side price calculation', async () => {
    ctx.prisma.design.findUnique.mockResolvedValue(designWithExtras);
    ctx.prisma.order.create.mockResolvedValue({ id: 'o1' });
    ctx.prisma.payment.update.mockResolvedValue({});
    ctx.prisma.order.findUnique.mockResolvedValue(placedOrder());

    const res = await request(ctx.app)
      .post('/api/v1/orders')
      .set(bearer(CUSTOMER))
      .send(createBody);

    expect(res.status).toBe(201);
    expect(res.body.data.order.totalPrice).toBe(6500);
    expect(res.body.data.order.orderNumber).toMatch(/^TP-[A-Z0-9]{8}$/);
    expect(res.body.data.order.status).toBe('PLACED');
    expect(res.body.data.order.items[0].price).toBe(6500);
    expect(res.body.data.order.items[0].selectedOptions).toHaveLength(1);

    const createArgs = ctx.prisma.order.create.mock.calls[0][0];
    expect(createArgs.data.totalPrice).toBe(6500);
    expect(createArgs.data.items.create[0].quantity).toBe(2);
    expect(ctx.prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { method: 'COD' } }),
    );
  });

  it('stores a customer price offer on create', async () => {
    ctx.prisma.design.findUnique.mockResolvedValue(designWithExtras);
    ctx.prisma.order.create.mockResolvedValue({ id: 'o1' });
    ctx.prisma.payment.update.mockResolvedValue({});
    ctx.prisma.order.findUnique.mockResolvedValue(placedOrder({ offeredPrice: 6000 }));

    const res = await request(ctx.app)
      .post('/api/v1/orders')
      .set(bearer(CUSTOMER))
      .send({ ...createBody, offeredPrice: 6000 });

    expect(res.status).toBe(201);
    expect(res.body.data.order.offeredPrice).toBe(6000);
    expect(ctx.prisma.order.create.mock.calls[0][0].data.offeredPrice).toBe(6000);
  });

  it('rejects a negative price offer', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/orders')
      .set(bearer(CUSTOMER))
      .send({ ...createBody, offeredPrice: -5 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(ctx.prisma.order.create).not.toHaveBeenCalled();
  });

  it('404s when the design does not exist', async () => {
    ctx.prisma.design.findUnique.mockResolvedValue(null);

    const res = await request(ctx.app)
      .post('/api/v1/orders')
      .set(bearer(CUSTOMER))
      .send(createBody);

    expect(res.status).toBe(404);
    expect(ctx.prisma.order.create).not.toHaveBeenCalled();
  });

  it('404s when the fabric is not part of the design', async () => {
    ctx.prisma.design.findUnique.mockResolvedValue(designWithExtras);

    const res = await request(ctx.app)
      .post('/api/v1/orders')
      .set(bearer(CUSTOMER))
      .send({ ...createBody, fabricId: 'fab-x' });

    expect(res.status).toBe(404);
  });

  it('404s when a style option is not part of the design', async () => {
    ctx.prisma.design.findUnique.mockResolvedValue(designWithExtras);

    const res = await request(ctx.app)
      .post('/api/v1/orders')
      .set(bearer(CUSTOMER))
      .send({ ...createBody, optionIds: ['opt-x'] });

    expect(res.status).toBe(404);
  });

  it('404s when the measurement is not owned by the customer', async () => {
    ctx.prisma.design.findUnique.mockResolvedValue(designWithExtras);
    ctx.prisma.measurement.findFirst.mockResolvedValue(null);

    const res = await request(ctx.app)
      .post('/api/v1/orders')
      .set(bearer(CUSTOMER))
      .send({ ...createBody, measurementId: 'm-x' });

    expect(res.status).toBe(404);
    expect(ctx.prisma.order.create).not.toHaveBeenCalled();
  });

  it('rejects quantity 0 via validation', async () => {
    const res = await request(ctx.app)
      .post('/api/v1/orders')
      .set(bearer(CUSTOMER))
      .send({ ...createBody, quantity: 0 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('lists a customer orders', async () => {
    ctx.prisma.order.findMany.mockResolvedValue([placedOrder()]);

    const res = await request(ctx.app)
      .get('/api/v1/orders')
      .set(bearer(CUSTOMER));

    expect(res.status).toBe(200);
    expect(res.body.data.orders).toHaveLength(1);
    expect(res.body.data.orders[0].orderNumber).toBe('TP-ABCD2345');
    expect(ctx.prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { customerId: CUSTOMER.sub } }),
    );
  });

  it('filters a customer orders by status', async () => {
    ctx.prisma.order.findMany.mockResolvedValue([placedOrder({ status: 'STITCHING' })]);

    const res = await request(ctx.app)
      .get('/api/v1/orders?status=STITCHING')
      .set(bearer(CUSTOMER));

    expect(res.status).toBe(200);
    expect(ctx.prisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { customerId: CUSTOMER.sub, status: 'STITCHING' } }),
    );
  });

  it('returns an order detail to its owner', async () => {
    ctx.prisma.order.findFirst.mockResolvedValue(placedOrder());

    const res = await request(ctx.app)
      .get('/api/v1/orders/o1')
      .set(bearer(CUSTOMER));

    expect(res.status).toBe(200);
    expect(res.body.data.order.items).toHaveLength(1);
    expect(res.body.data.order.payment.method).toBe('COD');
    expect(res.body.data.order.tailorWhatsapp).toBe('+923001234567');
  });

  it('404s for an order the customer does not own', async () => {
    ctx.prisma.order.findFirst.mockResolvedValue(null);

    const res = await request(ctx.app)
      .get('/api/v1/orders/other')
      .set(bearer(CUSTOMER));

    expect(res.status).toBe(404);
  });

  it('cancels a placed order', async () => {
    ctx.prisma.order.findFirst.mockResolvedValue(placedOrder());
    ctx.prisma.order.update.mockResolvedValue({});
    ctx.prisma.orderStatusEvent.create.mockResolvedValue({});
    ctx.prisma.order.findUnique.mockResolvedValue(
      placedOrder({ status: 'CANCELLED', cancelReason: 'Changed my mind' }),
    );

    const res = await request(ctx.app)
      .post('/api/v1/orders/o1/cancel')
      .set(bearer(CUSTOMER))
      .send({ reason: 'Changed my mind' });

    expect(res.status).toBe(200);
    expect(res.body.data.order.status).toBe('CANCELLED');
    expect(ctx.prisma.orderStatusEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ from: 'PLACED', to: 'CANCELLED' }),
      }),
    );
  });

  it('409s when cancelling a delivered order', async () => {
    ctx.prisma.order.findFirst.mockResolvedValue(placedOrder({ status: 'DELIVERED' }));

    const res = await request(ctx.app)
      .post('/api/v1/orders/o1/cancel')
      .set(bearer(CUSTOMER))
      .send({ reason: 'too late' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('blocks customers from advancing status', async () => {
    const res = await request(ctx.app)
      .patch('/api/v1/orders/o1/status')
      .set(bearer(CUSTOMER))
      .send({ status: 'ACCEPTED' });

    expect(res.status).toBe(403);
  });

  it('rejects skipping a status', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.order.findFirst.mockResolvedValue(placedOrder());

    const res = await request(ctx.app)
      .patch('/api/v1/orders/o1/status')
      .set(bearer(TAILOR))
      .send({ status: 'STITCHING' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
    expect(ctx.prisma.order.update).not.toHaveBeenCalled();
  });

  it('rejects CANCELLED through the status endpoint', async () => {
    const res = await request(ctx.app)
      .patch('/api/v1/orders/o1/status')
      .set(bearer(TAILOR))
      .send({ status: 'CANCELLED' });

    expect(res.status).toBe(400);
  });

  it('advances an order through the happy path', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.order.findFirst.mockResolvedValue(placedOrder());
    ctx.prisma.order.update.mockResolvedValue({});
    ctx.prisma.orderStatusEvent.create.mockResolvedValue({});
    ctx.prisma.order.findUnique.mockResolvedValue(placedOrder({ status: 'ACCEPTED' }));

    const res = await request(ctx.app)
      .patch('/api/v1/orders/o1/status')
      .set(bearer(TAILOR))
      .send({ status: 'ACCEPTED', note: 'Looks good' });

    expect(res.status).toBe(200);
    expect(res.body.data.order.status).toBe('ACCEPTED');
    expect(ctx.prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'ACCEPTED' } }),
    );
    expect(ctx.prisma.orderStatusEvent.create).toHaveBeenCalledTimes(1);
  });

  it('404s when a tailor tries to advance an order they do not own', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.order.findFirst.mockResolvedValue(null);

    const res = await request(ctx.app)
      .patch('/api/v1/orders/o1/status')
      .set(bearer(TAILOR))
      .send({ status: 'ACCEPTED' });

    expect(res.status).toBe(404);
  });

  it('quotes an order as the tailor', async () => {
    ctx.prisma.tailor.findUnique.mockResolvedValue(tailorRow);
    ctx.prisma.order.findFirst.mockResolvedValue(placedOrder());
    ctx.prisma.order.update.mockResolvedValue({});
    ctx.prisma.order.findUnique.mockResolvedValue(
      placedOrder({ finalPrice: 7500, quotedAt: new Date() }),
    );

    const res = await request(ctx.app)
      .patch('/api/v1/orders/o1/quote')
      .set(bearer(TAILOR))
      .send({ finalPrice: 7500 });

    expect(res.status).toBe(200);
    expect(res.body.data.order.finalPrice).toBe(7500);
    expect(ctx.prisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ finalPrice: 7500 }),
      }),
    );
  });

  it('rejects an invalid quote amount', async () => {
    const res = await request(ctx.app)
      .patch('/api/v1/orders/o1/quote')
      .set(bearer(TAILOR))
      .send({ finalPrice: -10 });

    expect(res.status).toBe(400);
  });
});
