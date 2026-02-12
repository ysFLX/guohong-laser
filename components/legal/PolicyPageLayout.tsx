import type { ReactNode } from 'react';

type PolicyPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  tags?: string[];
  children: ReactNode;
  sidebar?: ReactNode;
};

export default function PolicyPageLayout({
  eyebrow,
  title,
  description,
  tags = [],
  children,
  sidebar,
}: PolicyPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-900/10 bg-slate-950 px-6 py-10 text-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.35),_transparent_60%)] opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.9),_rgba(15,23,42,0.25))]" />
          <div className="relative space-y-4">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
            <p className="max-w-2xl text-base text-white/70">{description}</p>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-3 text-xs text-white/70">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/20 px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-4">{children}</section>
          {sidebar ? <aside className="space-y-4">{sidebar}</aside> : null}
        </div>
      </div>
    </div>
  );
}

