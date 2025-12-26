import Link from "next/link";
import React from "react";

type PageShellProps = {
  children: React.ReactNode;
};

const quickLinks = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Makineler", href: "/products" },
  { label: "Yedek Parçalar", href: "/spare-parts" },
  { label: "Galeri", href: "/gallery" },
  { label: "Hakkımızda", href: "/about" },
  { label: "İletişim", href: "/contact" },
];

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative z-0">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#10b981,_transparent_45%)] opacity-20 dark:opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(248,250,252,0.75),_rgba(226,232,240,0.4))] dark:bg-[linear-gradient(135deg,_rgba(2,6,23,0.85),_rgba(15,23,42,0.85))]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-[160px] dark:bg-emerald-400/20" />
        <div className="absolute bottom-0 right-16 h-80 w-80 rounded-full bg-emerald-400/10 blur-[180px] dark:bg-emerald-400/12" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(15,23,42,0.04)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(15,23,42,0.04)_1px,_transparent_1px)] bg-[size:64px_64px] opacity-20 dark:bg-[linear-gradient(90deg,_rgba(255,255,255,0.04)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(255,255,255,0.04)_1px,_transparent_1px)] dark:opacity-25" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-3 py-8 sm:px-6 lg:px-4">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr_280px]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-white/5 dark:text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">
                  Hızlı Menü
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      className="block text-slate-700 hover:text-slate-900 dark:text-white/80 dark:hover:text-white"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-white/5 dark:text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">
                  Öncelikli Destek
                </p>
                <p className="mt-3 text-sm text-slate-700 dark:text-white/80">
                  Sac, boru ve demir kesim hatları için en doğru konfigürasyonu
                  birlikte seçelim.
                </p>
                <Link
                  href="/quote"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-400"
                >
                  Teklif Al
                </Link>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="overflow-hidden rounded-[36px] border border-slate-200/70 bg-white/85 text-slate-900 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-950/60 dark:text-white">
              <div className="p-6 sm:p-10">{children}</div>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-white/5 dark:text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">
                  İletişim
                </p>
                <p className="mt-3 text-sm text-slate-700 dark:text-white/80">
                  24 saat içinde geri dönüş hedefi.
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-white/80">
                  <p>📞 +90 536 831 67 87</p>
                  <p>✉️ info@guohonglaser.com</p>
                  <p>📍 İstanbul</p>
                </div>
                <Link
                  href="/contact"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/20 dark:text-white/90 dark:hover:border-white/60 dark:hover:text-white"
                >
                  İletişime Geç
                </Link>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-white/5 dark:text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">
                  Katalog / Doküman
                </p>
                <p className="mt-3 text-sm text-slate-700 dark:text-white/80">
                  Teknik detayları tek dosyada toparlayın.
                </p>
                <Link
                  href="/downloads"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900"
                >
                  Dokümanlar
                </Link>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 text-slate-900 shadow-2xl dark:border-white/10 dark:bg-white/5 dark:text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/60">
                  Referans Portföy
                </p>
                <p className="mt-3 text-sm text-slate-700 dark:text-white/80">
                  Son kurulumlarımız ve başarı hikayeleri için galeriye göz atın.
                </p>
                <Link
                  href="/gallery"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/20 dark:text-white/90 dark:hover:border-white/60 dark:hover:text-white"
                >
                  Galeriye Git
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
