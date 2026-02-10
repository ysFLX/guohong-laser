import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  heading?: 'h1' | 'h2' | 'h3';
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export default function AdminPageHeader({ title, heading = 'h1', eyebrow, description, actions, className }: Props) {
  const Heading = heading;

  return (
    <section
      className={clsx(
        'rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/90 p-6 shadow-[var(--admin-shadow)] backdrop-blur',
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          {eyebrow ? (
            <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-muted)]">{eyebrow}</div>
          ) : null}
          <Heading className="text-2xl font-semibold tracking-tight text-[var(--admin-text)]">{title}</Heading>
          {description ? <p className="text-sm text-[var(--admin-muted)]">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
