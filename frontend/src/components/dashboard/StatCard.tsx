'use client';

export interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-700">
        {label}
      </p>
      <p className="mt-1.5 font-display text-2xl font-bold tracking-tight text-forest-900">
        {value}
      </p>
    </div>
  );
}