import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = '', id, ...rest }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/25 ${error ? 'border-red-400' : 'border-stone-300/90'} ${className}`}
        {...rest}
      />
      {hint && !error ? <p className="text-xs text-ink-soft">{hint}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}