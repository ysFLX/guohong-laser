import { clsx } from 'clsx';
import type { MouseEventHandler, ReactNode } from 'react';

type Tone = 'slate' | 'emerald' | 'amber' | 'rose' | 'indigo';
type Variant = 'solid' | 'outline' | 'ghost';

type BaseProps = {
  children: ReactNode;
  className?: string;
};

type ButtonProps = BaseProps & {
  type?: 'button' | 'submit' | 'reset';
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  tone?: Tone;
  variant?: Variant;
};

type BadgeProps = BaseProps & {
  tone?: Tone;
};

type RadioCardProps = BaseProps & {
  active?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const toneStyles: Record<Tone, { solid: string; outline: string; ghost: string; badge: string }> = {
  slate: {
    solid:
      'bg-[var(--admin-accent)] text-[var(--admin-accent-contrast)] shadow-[0_12px_35px_rgba(79,70,229,0.25)] hover:opacity-95',
    outline:
      'border border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--admin-text)] hover:bg-[var(--admin-card-muted)]',
    ghost:
      'bg-transparent text-[var(--admin-muted)] hover:bg-[var(--admin-card-muted)] hover:text-[var(--admin-text)]',
    badge: 'bg-indigo-500/10 text-indigo-700 ring-1 ring-indigo-500/25',
  },
  emerald: {
    solid: 'bg-emerald-600 text-white shadow-[0_12px_35px_rgba(16,185,129,0.25)] hover:bg-emerald-500',
    outline: 'border border-emerald-200 bg-[var(--admin-card)] text-emerald-700 hover:bg-emerald-50/60',
    ghost: 'bg-transparent text-emerald-700 hover:bg-emerald-50/60',
    badge: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/25',
  },
  amber: {
    solid: 'bg-amber-500 text-white shadow-[0_12px_35px_rgba(245,158,11,0.25)] hover:bg-amber-400',
    outline: 'border border-amber-200 bg-[var(--admin-card)] text-amber-700 hover:bg-amber-50/70',
    ghost: 'bg-transparent text-amber-700 hover:bg-amber-50/70',
    badge: 'bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/25',
  },
  rose: {
    solid: 'bg-rose-600 text-white shadow-[0_12px_35px_rgba(244,63,94,0.25)] hover:bg-rose-500',
    outline: 'border border-rose-200 bg-[var(--admin-card)] text-rose-700 hover:bg-rose-50/70',
    ghost: 'bg-transparent text-rose-700 hover:bg-rose-50/70',
    badge: 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/25',
  },
  indigo: {
    solid: 'bg-indigo-600 text-white shadow-[0_12px_35px_rgba(79,70,229,0.25)] hover:bg-indigo-500',
    outline: 'border border-indigo-200 bg-[var(--admin-card)] text-indigo-700 hover:bg-indigo-50/60',
    ghost: 'bg-transparent text-indigo-700 hover:bg-indigo-50/60',
    badge: 'bg-indigo-500/10 text-indigo-700 ring-1 ring-indigo-500/25',
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
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg)] disabled:cursor-not-allowed disabled:opacity-60',
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
        'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold',
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
        'rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg)]',
        active
          ? 'border-[var(--admin-accent)] bg-[var(--admin-sidebar-active)] text-[var(--admin-text)] shadow-[var(--admin-shadow)]'
          : 'border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--admin-muted)] hover:bg-[var(--admin-card-muted)] hover:text-[var(--admin-text)]',
        className,
      )}
    >
      {children}
    </button>
  );
}

