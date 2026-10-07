import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas ring-1 ring-stone-200">
        <svg
          className="h-6 w-6 text-ink-soft"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description ? <p className="max-w-sm text-sm text-ink-soft">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}