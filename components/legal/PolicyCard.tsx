import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type PolicyCardProps = {
  title: string;
  children?: ReactNode;
  className?: string;
};

export default function PolicyCard({ title, children, className }: PolicyCardProps) {
  return (
    <div className={clsx('card-surface p-6', className)}>
      <div className="text-sm font-semibold text-[var(--foreground)]">{title}</div>
      {children ? <div className="mt-3 text-sm text-[var(--gray-500)]">{children}</div> : null}
    </div>
  );
}

