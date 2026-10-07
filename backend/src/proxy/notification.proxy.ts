import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface OrderMessageInput {
  orderNumber: string;
  status: string;
  totalPrice: number;
  shopName: string;
  customerName: string;
}

export interface WebhookPayload extends OrderMessageInput {
  event: string;
}

export function buildOrderWhatsAppMessage(input: OrderMessageInput): string {
  return [
    `Assalam-o-Alaikum ${input.shopName}!`,
    `Order ${input.orderNumber} for ${input.customerName}.`,
    `Status: ${input.status}.`,
    `Estimated total: Rs ${input.totalPrice.toFixed(2)}.`,
    'Please update me, thank you.',
  ].join(' ');
}

export function buildWaLink(rawNumber: string, text: string): string {
  const digits = rawNumber.replace(/\D/g, '');
  let normalized = digits;
  if (digits.startsWith('0')) normalized = `92${digits.slice(1)}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

async function deliverWebhook(input: WebhookPayload): Promise<void> {
  if (!env.NOTIFY_WEBHOOK_URL) return;
  const res = await fetch(env.NOTIFY_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: input.event,
      orderNumber: input.orderNumber,
      shopName: input.shopName,
      customerName: input.customerName,
      status: input.status,
      totalPrice: input.totalPrice,
    }),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`notification webhook responded with ${res.status}`);
}

export async function sendOrderNotification(input: OrderMessageInput): Promise<void> {
  const message = buildOrderWhatsAppMessage(input);
  try {
    await deliverWebhook({ event: 'order_status', ...input });
  } catch (error) {
    logger.warn('Order notification delivery failed', {
      orderNumber: input.orderNumber,
      status: input.status,
      reason: error instanceof Error ? error.message : 'unknown',
    });
  }
  logger.info('Order notification prepared', {
    orderNumber: input.orderNumber,
    status: input.status,
    whatsappMessage: message,
  });
}

export function notifyOrderUpdate(input: OrderMessageInput): void {
  void sendOrderNotification(input);
}