import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-stone-200/80 bg-white shadow-card ${className}`}
      {...rest}
    />
  );
}