import type { HTMLAttributes } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-stone-100 text-stone-700 ring-stone-300/60',
  success: 'bg-forest-100 text-forest-800 ring-forest-200',
  warning: 'bg-gold-100 text-gold-800 ring-gold-200',
  danger: 'bg-red-100 text-red-700 ring-red-200',
  info: 'bg-sky-100 text-sky-800 ring-sky-200',
};

export function Badge({ tone = 'neutral', className = '', ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]} ${className}`}
      {...rest}
    />
  );
}