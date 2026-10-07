import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...rest }: TextareaProps) {
  const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={textareaId} className="block text-sm font-medium text-ink">
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        className={`min-h-24 w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/25 ${error ? 'border-red-400' : 'border-stone-300/90'} ${className}`}
        {...rest}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}