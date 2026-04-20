import React from 'react';

type PageShellProps = {
  children: React.ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="premium-palette relative z-0 overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(21,50,127,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(21,50,127,0.06),_transparent_22%),linear-gradient(180deg,_rgba(21,50,127,0.02),_rgba(21,50,127,0.05))]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[rgba(21,50,127,0.08)] blur-[160px]" />
        <div className="absolute bottom-0 right-16 h-80 w-80 rounded-full bg-[rgba(21,50,127,0.06)] blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(21,50,127,0.03)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(21,50,127,0.03)_1px,_transparent_1px)] bg-[size:88px_88px] opacity-40" />
      </div>

      <div className="relative mx-auto w-full max-w-none px-4 py-6 sm:px-6 sm:py-8 lg:px-4 lg:py-8">
        {children}
      </div>
    </div>
  );
}
