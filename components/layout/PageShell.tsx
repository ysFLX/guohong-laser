import React from 'react';

type PageShellProps = {
  children: React.ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="premium-palette relative z-0 overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(255,255,255,0.86),_rgba(245,247,250,0.98))]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(17,24,39,0.035)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(17,24,39,0.035)_1px,_transparent_1px)] bg-[size:96px_96px] opacity-45" />
      </div>

      <div className="relative mx-auto w-full max-w-none px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {children}
      </div>
    </div>
  );
}
