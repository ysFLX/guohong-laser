import React from 'react';

type PageShellProps = {
  children: React.ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="premium-palette relative z-0 overflow-x-hidden bg-[#15148c] text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,106,13,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(255,106,13,0.14),_transparent_22%),linear-gradient(180deg,_rgba(5,0,92,0.12),_rgba(5,0,92,0.48))]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[rgba(255,106,13,0.14)] blur-[160px]" />
        <div className="absolute bottom-0 right-16 h-80 w-80 rounded-full bg-[rgba(255,106,13,0.1)] blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.035)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(255,255,255,0.035)_1px,_transparent_1px)] bg-[size:88px_88px] opacity-20" />
      </div>

      <div className="relative mx-auto w-full max-w-none px-3 py-8 sm:px-6 lg:px-4">
        {children}
      </div>
    </div>
  );
}
