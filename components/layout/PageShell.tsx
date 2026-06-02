import React from 'react';

type PageShellProps = {
  children: React.ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="premium-palette relative z-0 overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[image:var(--shell-wash)]" />
        <div className="absolute inset-0 bg-[image:var(--shell-grid)] bg-[size:96px_96px] opacity-45" />
      </div>

      <div className="relative mx-auto w-full max-w-none px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </div>
    </div>
  );
}
