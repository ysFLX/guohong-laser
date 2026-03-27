import React from 'react';

type PageShellProps = {
  children: React.ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="premium-palette relative z-0 overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(254,156,121,0.14),_transparent_46%)] opacity-30 dark:opacity-25" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(253,249,246,0.98),_rgba(247,241,238,0.94))] dark:bg-[linear-gradient(135deg,_rgba(20,40,98,0.98),_rgba(15,31,79,0.94))]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-amber-400/12 blur-[160px] dark:bg-amber-400/18" />
        <div className="absolute bottom-0 right-16 h-80 w-80 rounded-full bg-amber-300/10 blur-[180px] dark:bg-amber-300/14" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(20,40,98,0.05)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(20,40,98,0.05)_1px,_transparent_1px)] bg-[size:80px_80px] opacity-10 dark:bg-[linear-gradient(90deg,_rgba(253,249,246,0.05)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(253,249,246,0.05)_1px,_transparent_1px)] dark:opacity-20" />
      </div>

      <div className="relative mx-auto w-full max-w-none px-3 py-8 sm:px-6 lg:px-4">
        {children}
      </div>
    </div>
  );
}


