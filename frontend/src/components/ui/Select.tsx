import type { SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className = '', id, children, ...rest }: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={selectId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={`min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/25 ${error ? 'border-red-400' : 'border-stone-300/90'} ${className}`}
        {...rest}
      >
        {children}
      </select>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}