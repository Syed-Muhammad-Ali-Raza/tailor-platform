import { AppError } from './errors';

export const ORDER_STATUSES = [
  'PLACED',
  'ACCEPTED',
  'MEASUREMENTS_CONFIRMED',
  'STITCHING',
  'QUALITY_CHECK',
  'READY',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['MEASUREMENTS_CONFIRMED', 'CANCELLED'],
  MEASUREMENTS_CONFIRMED: ['STITCHING', 'CANCELLED'],
  STITCHING: ['QUALITY_CHECK', 'CANCELLED'],
  QUALITY_CHECK: ['READY', 'CANCELLED'],
  READY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new AppError('CONFLICT', `Cannot move order from ${from} to ${to}`);
  }
}

export function allowedNext(from: OrderStatus): OrderStatus[] {
  return TRANSITIONS[from];
}
