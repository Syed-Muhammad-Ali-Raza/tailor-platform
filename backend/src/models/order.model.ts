import { Db } from '../types/deps';
import { Pagination } from '../utils/pagination';

const orderInclude = {
  items: true,
  payment: true,
  review: true,
  statusEvents: { orderBy: { createdAt: 'asc' as const } },
  customer: { select: { name: true, phone: true } },
  tailor: { select: { shopName: true, whatsapp: true } },
};

export interface OrderCreateData {
  orderNumber: string;
  customerId: string;
  tailorId: string;
  deliveryType: string;
  totalPrice: number;
  offeredPrice?: number;
  dueDate?: Date;
  notes?: string;
  referencePhotoUrl?: string;
  items: {
    designId: string;
    fabricId?: string | null;
    measurementId?: string | null;
    designName: string;
    fabricName?: string | null;
    quantity: number;
    price: number;
    selectedOptions: { name: string; extraPrice: number }[];
  }[];
}

export async function createOrderWithItems(db: Db, data: OrderCreateData) {
  return db.order.create({
    data: {
      orderNumber: data.orderNumber,
      customerId: data.customerId,
      tailorId: data.tailorId,
      status: 'PLACED',
      totalPrice: data.totalPrice,
      offeredPrice: data.offeredPrice,
      deliveryType: data.deliveryType as never,
      dueDate: data.dueDate,
      notes: data.notes,
      referencePhotoUrl: data.referencePhotoUrl,
      items: { create: data.items },
      statusEvents: { create: { from: null, to: 'PLACED' } },
      payment: { create: { method: 'COD', amount: data.totalPrice, status: 'PENDING' } },
    },
    include: orderInclude,
  });
}

export function setPaymentMethod(db: Db, orderId: string, method: string) {
  return db.payment.update({ where: { orderId }, data: { method: method as never } });
}

export function listOrdersByCustomer(db: Db, customerId: string, status?: string) {
  return db.order.findMany({
    where: { customerId, ...(status ? { status: status as never } : {}) },
    include: { items: true, tailor: { select: { shopName: true, whatsapp: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export function listOrdersByTailor(
  db: Db,
  tailorId: string,
  status: string | undefined,
  pagination: Pagination,
) {
  const where = { tailorId, ...(status ? { status: status as never } : {}) };
  return db.order.findMany({
    where,
    include: {
      items: true,
      customer: { select: { name: true, phone: true } },
      tailor: { select: { shopName: true, whatsapp: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: pagination.skip,
    take: pagination.take,
  });
}

export function countOrders(db: Db, tailorId: string, status?: string) {
  return db.order.count({
    where: { tailorId, ...(status ? { status: status as never } : {}) },
  });
}

export function findOrderById(db: Db, id: string) {
  return db.order.findUnique({ where: { id }, include: orderInclude });
}

export function findOwnedOrder(db: Db, id: string, customerId: string) {
  return db.order.findFirst({ where: { id, customerId }, include: orderInclude });
}

export function findOrderByTailor(db: Db, id: string, tailorId: string) {
  return db.order.findFirst({ where: { id, tailorId }, include: orderInclude });
}

export function addStatusEvent(
  db: Db,
  data: { orderId: string; from: string | null; to: string; note?: string; actorUserId?: string },
) {
  return db.orderStatusEvent.create({
    data: {
      orderId: data.orderId,
      from: data.from as never,
      to: data.to as never,
      note: data.note,
      actorUserId: data.actorUserId,
    },
  });
}

export function updateOrderStatus(
  db: Db,
  id: string,
  status: string,
  extra: { cancelReason?: string } = {},
) {
  return db.order.update({ where: { id }, data: { status: status as never, ...extra } });
}

export function setOrderQuote(db: Db, id: string, finalPrice: number) {
  return db.order.update({
    where: { id },
    data: { finalPrice, quotedAt: new Date() },
  });
}

export function dashboardStatusCounts(db: Db, tailorId: string) {
  return db.order.groupBy({ by: ['status'], where: { tailorId }, _count: { _all: true } });
}

export function countOrdersSince(db: Db, tailorId: string, since: Date) {
  return db.order.count({ where: { tailorId, createdAt: { gte: since } } });
}

export function sumExpectedRevenue(db: Db, tailorId: string) {
  return db.order.aggregate({
    where: { tailorId, status: { not: 'CANCELLED' } },
    _sum: { totalPrice: true },
  });
}
