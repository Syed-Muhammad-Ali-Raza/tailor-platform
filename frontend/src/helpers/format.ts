import type { OrderStatus } from '@/types';

export function formatPkr(value: number | null | undefined): string {
  const amount =
    typeof value === 'number' && Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
  return `Rs ${formatted}`;
}

export function formatDate(iso: string | null | undefined, locale = 'en'): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale === 'ur' ? 'ur-PK' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function statusKey(status: OrderStatus): string {
  return `status_${status.toLowerCase()}`;
}

export function formatStatus(
  status: OrderStatus,
  t: (key: string) => string,
): string {
  return t(statusKey(status));
}

export function audienceKey(audience: string): string {
  return `aud_${audience.toLowerCase()}`;
}

export function categoryKey(category: string): string {
  return `cat_${category.toLowerCase()}`;
}

export function garmentKey(garmentType: string): string {
  return `gt_${garmentType.toLowerCase()}`;
}
