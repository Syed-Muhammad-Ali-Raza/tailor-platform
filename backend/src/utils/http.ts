import { Response } from 'express';
import { toMoney } from './price';

export function ok<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data });
}

export function noContent(res: Response): void {
  res.status(204).end();
}

const MONEY_KEYS = new Set([
  'basePrice',
  'totalPrice',
  'finalPrice',
  'price',
  'amount',
  'extraPrice',
  'extraCharge',
  'pricePerMeter',
]);

export function serializeMoney<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(serializeMoney) as unknown as T;
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      out[key] = MONEY_KEYS.has(key) ? toMoney(val) : serializeMoney(val);
    }
    return out as unknown as T;
  }
  return value;
}
