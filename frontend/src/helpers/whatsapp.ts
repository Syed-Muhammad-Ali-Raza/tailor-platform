import { formatPkr } from './format';

export function buildWaLink(rawNumber: string, text: string): string {
  const digits = String(rawNumber ?? '').replace(/\D/g, '');
  if (!digits) return 'https://wa.me/';

  let normalized = digits;
  if (normalized.startsWith('03')) {
    normalized = `92${normalized.slice(1)}`;
  }

  if (!/^92\d{7,}$/.test(normalized)) return 'https://wa.me/';

  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}

export interface OrderMessageInput {
  id: string;
  status: string;
  totalPrice: number;
  finalPrice?: number;
}

export function orderMessage(
  order: OrderMessageInput,
  shopName: string,
  statusLabel?: string,
): string {
  const total = order.finalPrice ?? order.totalPrice;
  const status = statusLabel ?? order.status;
  const shop = shopName || 'Tailor Platform';
  return [
    `${shop}`,
    `Order #${order.id}`,
    `Status: ${status}`,
    `Total: ${formatPkr(total)}`,
  ].join('\n');
}
