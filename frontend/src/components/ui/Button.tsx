import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-forest-800 text-white shadow-card hover:bg-forest-900',
  accent: 'bg-gold-500 text-gold-950 shadow-card hover:bg-gold-400',
  secondary:
    'border border-stone-300 bg-white text-ink hover:border-forest-300 hover:bg-forest-50',
  ghost: 'text-ink hover:bg-forest-50 hover:text-forest-800',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-4 text-xs',
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-12 px-7 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
}