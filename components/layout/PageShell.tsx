import React from 'react';

type PageShellProps = {
  children: React.ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative z-0 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_45%)] opacity-20 dark:opacity-35" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(248,250,252,0.95),_rgba(226,232,240,0.7))] dark:bg-[linear-gradient(135deg,_rgba(2,6,23,0.95),_rgba(15,23,42,0.9))]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal-400/20 blur-[160px] dark:bg-teal-400/20" />
        <div className="absolute bottom-0 right-16 h-80 w-80 rounded-full bg-teal-400/15 blur-[180px] dark:bg-teal-400/12" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(15,23,42,0.04)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(15,23,42,0.04)_1px,_transparent_1px)] bg-[size:80px_80px] opacity-15 dark:bg-[linear-gradient(90deg,_rgba(255,255,255,0.05)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(255,255,255,0.05)_1px,_transparent_1px)] dark:opacity-20" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-3 py-8 sm:px-6 lg:px-4">
        {children}
      </div>
    </div>
  );
}


