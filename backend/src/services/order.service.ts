import { calculateItemPrice } from '../utils/price';
import { assertTransition, isOrderStatus, OrderStatus } from '../utils/status';
import { AppError, badRequest, forbidden, notFound } from '../utils/errors';
import * as orderModel from '../models/order.model';
import * as measurementService from './measurement.service';
import * as authService from './auth.service';
import { PrismaLike, Db } from '../types/deps';
import { notifyOrderUpdate } from '../proxy/notification.proxy';

export interface CreateOrderInput {
  designId: string;
  fabricId?: string;
  optionIds: string[];
  measurementId?: string;
  quantity: number;
  deliveryType: string;
  paymentMethod: string;
  notes?: string;
  referencePhotoUrl?: string;
  dueDate?: string;
  offeredPrice?: number;
}

const MAX_QUANTITY = 20;

export function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `TP-${out}`;
}

export function serializeOrderSummary(order: {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: unknown;
  finalPrice?: unknown;
  offeredPrice?: unknown;
  deliveryType: string;
  dueDate?: Date | null;
  createdAt: Date;
  items?: unknown[];
  customer?: { name: string } | null;
  tailor?: { shopName: string; whatsapp?: string } | null;
}) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    totalPrice: Number(order.totalPrice),
    finalPrice: order.finalPrice === null || order.finalPrice === undefined ? null : Number(order.finalPrice),
    offeredPrice: order.offeredPrice === null || order.offeredPrice === undefined ? null : Number(order.offeredPrice),
    deliveryType: order.deliveryType,
    dueDate: order.dueDate ?? null,
    createdAt: order.createdAt,
    itemCount: order.items?.length ?? 0,
    customerName: order.customer?.name ?? null,
    tailorShopName: order.tailor?.shopName ?? null,
  };
}

export function serializeOrderDetail(order: any) {
  return {
    ...serializeOrderSummary(order),
    notes: order.notes ?? null,
    referencePhotoUrl: order.referencePhotoUrl ?? null,
    quotedAt: order.quotedAt ?? null,
    cancelReason: order.cancelReason ?? null,
    tailorWhatsapp: order.tailor?.whatsapp ?? null,
    review: order.review
      ? {
          id: order.review.id,
          rating: order.review.rating,
          comment: order.review.comment ?? null,
          createdAt: order.review.createdAt,
        }
      : null,
    items: (order.items ?? []).map((item: any) => ({
      id: item.id,
      designId: item.designId,
      designName: item.designName,
      fabricName: item.fabricName,
      quantity: item.quantity,
      price: Number(item.price),
      measurementId: item.measurementId,
      selectedOptions: Array.isArray(item.selectedOptions)
        ? item.selectedOptions.map((o: any) => ({
            name: o.name,
            extraPrice: Number(o.extraPrice ?? 0),
          }))
        : [],
    })),
    payment: order.payment
      ? {
          method: order.payment.method,
          amount: Number(order.payment.amount),
          status: order.payment.status,
        }
      : null,
    statusEvents: (order.statusEvents ?? []).map((event: any) => ({
      id: event.id,
      from: event.from,
      to: event.to,
      note: event.note,
      createdAt: event.createdAt,
    })),
  };
}

export async function createOrder(prisma: PrismaLike, customerId: string, input: CreateOrderInput) {
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > MAX_QUANTITY) {
    throw badRequest(`Quantity must be between 1 and ${MAX_QUANTITY}`);
  }
  if (
    input.offeredPrice !== undefined &&
    (!Number.isFinite(input.offeredPrice) || input.offeredPrice <= 0 || input.offeredPrice > 1000000)
  ) {
    throw badRequest('offeredPrice must be a positive number up to 1000000');
  }

  const design = await prisma.design.findUnique({
    where: { id: input.designId },
    include: { fabrics: true, options: true },
  });
  if (!design || !design.active) throw notFound('Design not found');

  let fabricExtraCharge = 0;
  let fabricName: string | null = null;
  if (input.fabricId) {
    const fabric = design.fabrics.find((f) => f.id === input.fabricId);
    if (!fabric) throw notFound('Fabric not found for this design');
    fabricExtraCharge = Number(fabric.extraCharge);
    fabricName = fabric.name;
  }

  const selectedOptions = input.optionIds.map((optionId) => {
    const option = design.options.find((o) => o.id === optionId);
    if (!option) throw notFound('Style option not found for this design');
    return { name: option.name, extraPrice: Number(option.extraPrice) };
  });

  if (input.measurementId) {
    await measurementService.assertOwnedMeasurement(prisma, input.measurementId, customerId);
  }

  const price = calculateItemPrice({
    basePrice: Number(design.basePrice),
    fabricExtraCharge,
    optionExtraPrices: selectedOptions.map((o) => o.extraPrice),
    quantity: input.quantity,
  });

  const order = await prisma.$transaction(async (tx: Db) => {
    const created = await orderModel.createOrderWithItems(tx, {
      orderNumber: generateOrderNumber(),
      customerId,
      tailorId: design.tailorId,
      deliveryType: input.deliveryType,
      totalPrice: price,
      offeredPrice:
        input.offeredPrice === undefined || input.offeredPrice === null
          ? undefined
          : Math.round(input.offeredPrice * 100) / 100,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      notes: input.notes,
      referencePhotoUrl: input.referencePhotoUrl,
      items: [
        {
          designId: design.id,
          fabricId: input.fabricId ?? null,
          measurementId: input.measurementId ?? null,
          designName: design.name,
          fabricName,
          quantity: input.quantity,
          price,
          selectedOptions,
        },
      ],
    });
    await orderModel.setPaymentMethod(tx, created.id, input.paymentMethod);
    return orderModel.findOrderById(tx, created.id) as any;
  });

  notifyOrderUpdate({
    orderNumber: order.orderNumber,
    status: order.status,
    totalPrice: Number(order.totalPrice),
    shopName: order.tailor?.shopName ?? '',
    customerName: order.customer?.name ?? '',
  });

  return { order: serializeOrderDetail(order) };
}

export async function listOrders(prisma: PrismaLike, user: { sub: string; role: string }, status?: string) {
  if (user.role === 'TAILOR' || user.role === 'ADMIN') {
    const tailor = await authService.requireTailorRow(prisma, user.sub);
    const list = await prisma.order.findMany({
      where: { tailorId: tailor.id, ...(status ? { status: status as never } : {}) },
      include: { items: true, customer: { select: { name: true } }, tailor: { select: { shopName: true, whatsapp: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { orders: list.map(serializeOrderSummary) };
  }
  const orders = await orderModel.listOrdersByCustomer(prisma, user.sub, status);
  return { orders: orders.map(serializeOrderSummary) };
}

export async function getOrder(prisma: PrismaLike, id: string, user: { sub: string; role: string }) {
  let order: any;
  if (user.role === 'TAILOR') {
    const tailor = await authService.requireTailorRow(prisma, user.sub);
    order = await orderModel.findOrderByTailor(prisma, id, tailor.id);
  } else {
    order = await orderModel.findOwnedOrder(prisma, id, user.sub);
  }
  if (!order) throw notFound('Order not found');
  return { order: serializeOrderDetail(order) };
}

export async function cancelOrder(
  prisma: PrismaLike,
  id: string,
  user: { sub: string; role: string },
  reason?: string,
) {
  const { order } = await getOrder(prisma, id, user);
  if (order.status === 'DELIVERED') throw new AppError('CONFLICT', 'Delivered orders cannot be cancelled');
  if (order.status === 'CANCELLED') throw new AppError('CONFLICT', 'Order is already cancelled');
  assertTransition(order.status as OrderStatus, 'CANCELLED');

  await prisma.$transaction(async (tx: Db) => {
    await orderModel.updateOrderStatus(tx, id, 'CANCELLED', { cancelReason: reason });
    await orderModel.addStatusEvent(tx, { orderId: id, from: order.status, to: 'CANCELLED', note: reason, actorUserId: user.sub });
  });

  const updated: any = await orderModel.findOrderById(prisma, id);
  notifyOrderUpdate({
    orderNumber: updated.orderNumber,
    status: updated.status,
    totalPrice: Number(updated.totalPrice),
    shopName: updated.tailor?.shopName ?? '',
    customerName: updated.customer?.name ?? '',
  });
  return { order: serializeOrderDetail(updated) };
}

export async function advanceStatus(
  prisma: PrismaLike,
  id: string,
  user: { sub: string; role: string },
  nextStatus: string,
  note?: string,
) {
  if (!isOrderStatus(nextStatus)) throw badRequest(`Unknown status: ${nextStatus}`);
  if (nextStatus === 'CANCELLED') throw badRequest('Use the cancel endpoint to cancel an order');

  const tailor = await authService.requireTailorRow(prisma, user.sub);
  const current = await prisma.order.findFirst({ where: { id, tailorId: tailor.id } });
  if (!current) throw notFound('Order not found');

  assertTransition(current.status, nextStatus);

  await prisma.$transaction(async (tx: Db) => {
    await orderModel.updateOrderStatus(tx, id, nextStatus);
    await orderModel.addStatusEvent(tx, {
      orderId: id,
      from: current.status,
      to: nextStatus,
      note,
      actorUserId: user.sub,
    });
  });

  const updated: any = await orderModel.findOrderById(prisma, id);
  notifyOrderUpdate({
    orderNumber: updated.orderNumber,
    status: updated.status,
    totalPrice: Number(updated.totalPrice),
    shopName: updated.tailor?.shopName ?? '',
    customerName: updated.customer?.name ?? '',
  });
  return { order: serializeOrderDetail(updated) };
}

export async function quoteOrder(
  prisma: PrismaLike,
  id: string,
  user: { sub: string; role: string },
  finalPrice: number,
) {
  if (!Number.isFinite(finalPrice) || finalPrice < 0) throw badRequest('finalPrice must be a positive number');
  const tailor = await authService.requireTailorRow(prisma, user.sub);
  const current = await prisma.order.findFirst({ where: { id, tailorId: tailor.id } });
  if (!current) throw notFound('Order not found');

  await orderModel.setOrderQuote(prisma, id, Math.round(finalPrice * 100) / 100);
  const updated = await orderModel.findOrderById(prisma, id);
  return { order: serializeOrderDetail(updated) };
}

export function forbiddenUnlessOwner(order: { customerId: string }, userSub: string): void {
  if (order.customerId !== userSub) throw forbidden();
}
