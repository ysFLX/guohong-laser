import React from 'react';

type PageShellProps = {
  children: React.ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="premium-palette relative z-0 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_45%)] opacity-25" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(7,7,7,0.98),_rgba(17,17,17,0.94))]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-amber-400/18 blur-[160px]" />
        <div className="absolute bottom-0 right-16 h-80 w-80 rounded-full bg-amber-300/14 blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(15,23,42,0.04)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(15,23,42,0.04)_1px,_transparent_1px)] bg-[size:80px_80px] opacity-15 dark:bg-[linear-gradient(90deg,_rgba(255,255,255,0.05)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(255,255,255,0.05)_1px,_transparent_1px)] dark:opacity-20" />
      </div>

      <div className="relative mx-auto w-full max-w-none px-3 py-8 sm:px-6 lg:px-4">
        {children}
      </div>
    </div>
  );
}



