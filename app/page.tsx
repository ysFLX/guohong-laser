export default function Home() {
  return (
    <div className={`${manrope.className} min-h-screen bg-slate-950 text-white`}>
      {/* Sayfa arka plan efektlerini istersen burada global tut */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0ea5a4,_transparent_45%)] opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.92))]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-[140px]" />
        <div className="absolute bottom-0 right-16 h-80 w-80 rounded-full bg-emerald-400/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.04)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[size:52px_52px] opacity-30" />
      </div>

      {/* Page shell */}
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 3 kolon: Sol / Orta / Sağ */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
          
          {/* SOL SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Hızlı Menü
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <Link className="block text-white/80 hover:text-white" href="#hizmetler">Hizmetler</Link>
                  <Link className="block text-white/80 hover:text-white" href="#surec">Süreç</Link>
                  <Link className="block text-white/80 hover:text-white" href="#referanslar">Referanslar</Link>
                  <Link className="block text-white/80 hover:text-white" href="/gallery">Galeri</Link>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Öne Çıkan
                </p>
                <p className="mt-3 text-sm text-white/80">
                  Sac / Boru / Demir kesim hatları için doğru konfigürasyonu seçelim.
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

          {/* ORTA: ANA KART */}
          <main>
            <div className="overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/60 shadow-2xl backdrop-blur">
              
              {/* ÜST “hero-like” küçük bant (opsiyonel) */}
              <div className="border-b border-white/10 px-6 py-5 sm:px-10">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Guohong Laser
                </div>
                <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
                  Lazer kesimde <span className="text-emerald-200">yeni bir kalite standardı</span>
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-200">
                  Üretim hattınızı hızlandıran, fire oranını düşüren ve performansı sürekli artıran lazer teknolojileri.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/spare-parts"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-400"
                  >
                    Ürünleri Keşfet
                  </Link>
                  <Link
                    href="/quote"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white/90 transition hover:border-white/60 hover:text-white"
                  >
                    Ücretsiz Teklif Al
                  </Link>
                </div>
              </div>

              {/* ORTA İÇERİK: Senin section’ları buraya taşınacak */}
              <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
                
                {/* Örn: Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.name}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                    >
                      <p className="text-2xl font-semibold text-white">{stat.value}</p>
                      <p className="text-xs uppercase tracking-widest text-white/60">
                        {stat.name}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Örn: Video Galerisi */}
                <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                        Video Galerisi
                      </p>
                      <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                        Üretim hatlarını yakından inceleyin
                      </h2>
                    </div>
                    <Link
                      href="/gallery"
                      className="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white hover:text-white"
                    >
                      Galeriye Git
                    </Link>
                  </div>
                  <VideoSlider items={heroVideos} />
                </section>

                {/* Hizmetler */}
                <section id="hizmetler" className="space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                      Hizmetler
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Uçtan uca lazer çözümleri
                    </h2>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {services.map((service) => (
                      <Link
                        key={service.name}
                        href={service.href}
                        className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-emerald-300"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">
                            {service.name}
                          </h3>
                          <span className="text-emerald-200">›</span>
                        </div>
                        <p className="mt-3 text-sm text-slate-300">
                          {service.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* Süreç */}
                <section id="surec" className="space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                      Süreç
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Şeffaf ve kontrollü proje yönetimi
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {process.map((step, index) => (
                      <div
                        key={step.title}
                        className="rounded-2xl border border-white/10 bg-white/5 p-5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-white">
                              {step.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-300">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Referanslar */}
                <section id="referanslar" className="space-y-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                      Referanslar
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      İş ortaklarımızın deneyimleri
                    </h2>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {testimonials.map((t) => (
                      <div
                        key={t.name}
                        className="rounded-2xl border border-white/10 bg-white/5 p-6"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 overflow-hidden rounded-full bg-white/10">
                            <Image
                              src={t.avatar}
                              alt={t.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{t.name}</p>
                            <p className="text-xs text-slate-300">
                              {t.role} · {t.company}
                            </p>
                          </div>
                        </div>
                        <p className="mt-4 text-sm text-slate-200">“{t.content}”</p>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            </div>
          </main>

          {/* SAĞ SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  İletişim
                </p>
                <p className="mt-3 text-sm text-white/80">
                  24 saat içinde geri dönüş hedefi.
                </p>
                <div className="mt-4 space-y-2 text-sm text-white/80">
                  <p>📞 +90 ...</p>
                  <p>✉️ info@...</p>
                  <p>📍 İstanbul</p>
                </div>
                <Link
                  href="/contact"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 transition hover:border-white/60 hover:text-white"
                >
                  İletişime Geç
                </Link>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Katalog / Doküman
                </p>
                <p className="mt-3 text-sm text-white/80">
                  Teknik detayları tek dosyada topla.
                </p>
                <Link
                  href="/downloads"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5"
                >
                  Dokümanlar
                </Link>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
