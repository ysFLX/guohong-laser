import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type Tone = 'slate' | 'emerald' | 'amber' | 'rose' | 'indigo';
type Variant = 'solid' | 'outline' | 'ghost';

type BaseProps = {
  children: ReactNode;
  className?: string;
};

type ButtonProps = BaseProps & {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  disabled?: boolean;
  tone?: Tone;
  variant?: Variant;
};

type BadgeProps = BaseProps & {
  tone?: Tone;
};

type RadioCardProps = BaseProps & {
  active?: boolean;
  onClick?: () => void;
};

const toneStyles: Record<Tone, { solid: string; outline: string; ghost: string; badge: string }> = {
  slate: {
    solid: 'bg-[var(--admin-accent)] text-[var(--admin-accent-contrast)] hover:opacity-90',
    outline:
      'border border-[var(--admin-border)] text-[var(--admin-text)] hover:bg-[var(--admin-surface-muted)]',
    ghost: 'text-[var(--admin-muted)] hover:text-[var(--admin-text)]',
    badge: 'bg-indigo-500/10 text-indigo-700 ring-1 ring-indigo-500/30',
  },
  emerald: {
    solid: 'bg-emerald-600 text-white hover:bg-emerald-500',
    outline: 'border border-emerald-200 text-emerald-700 hover:border-emerald-300',
    ghost: 'text-emerald-600 hover:text-emerald-700',
    badge: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/30',
  },
  amber: {
    solid: 'bg-amber-500 text-white hover:bg-amber-400',
    outline: 'border border-amber-200 text-amber-700 hover:border-amber-300',
    ghost: 'text-amber-600 hover:text-amber-700',
    badge: 'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30',
  },
  rose: {
    solid: 'bg-rose-500 text-white hover:bg-rose-400',
    outline: 'border border-rose-200 text-rose-600 hover:border-rose-300',
    ghost: 'text-rose-500 hover:text-rose-600',
    badge: 'bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/30',
  },
  indigo: {
    solid: 'bg-indigo-600 text-white hover:bg-indigo-500',
    outline: 'border border-indigo-200 text-indigo-700 hover:border-indigo-300',
    ghost: 'text-indigo-600 hover:text-indigo-700',
    badge: 'bg-indigo-500/10 text-indigo-700 ring-1 ring-indigo-500/30',
  },
};

export function AdminButton({
  children,
  className,
  type = 'button',
  onClick,
  disabled,
  tone = 'slate',
  variant = 'solid',
}: ButtonProps) {
  const styles = toneStyles[tone][variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition disabled:opacity-60 shadow-[0_12px_30px_rgba(15,23,42,0.2)]',
        styles,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AdminBadge({ children, className, tone = 'slate' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]',
        toneStyles[tone].badge,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function AdminRadioCard({ children, className, active, onClick }: RadioCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'rounded-2xl border px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] transition',
        active
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900',
        className,
      )}
    >
      {children}
    </button>
  );
}
