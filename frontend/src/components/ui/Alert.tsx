import type { ReactNode } from 'react';

export type AlertTone = 'error' | 'success' | 'info';

export interface AlertProps {
  tone?: AlertTone;
  children: ReactNode;
}

const toneClasses: Record<AlertTone, string> = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-forest-200 bg-forest-50 text-forest-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
};

export function Alert({ tone = 'error', children }: AlertProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-xl border px-4 py-3 text-sm ${toneClasses[tone]}`}
    >
      {children}
    </div>
  );
}