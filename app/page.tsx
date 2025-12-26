import Image from "next/image";
import Link from "next/link";
import { Manrope } from "next/font/google";

import VideoSlider from "@/components/home/VideoSlider";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

const heroVideos = [
  {
    src: "https://res.cloudinary.com/dar9ughwx/video/upload/v1766584806/borukesim_dd8a5f.mp4",
    poster: "/images/about-showcase.jpg",
    title: "Lazer Boru Kesimi",
  },
  {
    src: "https://res.cloudinary.com/dar9ughwx/video/upload/v1766584816/sackesim_m6icrx.mp4",
    poster: "/images/1.jpg",
    title: "Lazer Sac Kesimi",
  },
  {
    src: "https://res.cloudinary.com/dar9ughwx/video/upload/v1766584837/demirkesim_kbwzy2.mp4",
    poster: "/images/2.jpg",
    title: "Lazer Demir Kesimi",
  },
];

const stats = [
  { name: "Yıllık Deneyim", value: "10+" },
  { name: "Mutlu Müşteri", value: "500+" },
  { name: "Tamamlanan Proje", value: "1000+" },
  { name: "Aktif Servis Noktası", value: "24" },
];

const services = [
  {
    name: "Lazer Kesim Makineleri",
    description: "Sac, boru ve demir kesim hatlarında yüksek performans.",
    href: "/products?category=Sac+Kesim",
  },
  {
    name: "Teknik Servis",
    description: "Bakım, arıza ve performans iyileştirme çözümleri.",
    href: "/contact?subject=Teknik+Servis",
  },
  {
    name: "Yedek Parça",
    description: "Orijinal yedek parça ve hızlı temin ağı.",
    href: "/products?category=Yedek+Par%C3%A7a",
  },
  {
    name: "Danışmanlık",
    description: "Üretim hattınıza özel planlama ve teknoloji danışmanlığı.",
    href: "/contact?subject=Dan%C4%B1%C5%9Fmanl%C4%B1k",
  },
];

const process = [
  {
    title: "Keşif ve analiz",
    description: "Üretim ihtiyaçlarınızı ve hedef kapasiteyi netleştiriyoruz.",
  },
  {
    title: "Teknik teklif",
    description: "Sahaya uygun makine konfigürasyonu ve yatırım planı.",
  },
  {
    title: "Kurulum ve eğitim",
    description: "Kurulum, test ve operatör eğitimini uçtan uca sağlıyoruz.",
  },
  {
    title: "Sürekli destek",
    description: "Bakım, yedek parça ve performans geliştirme takibi.",
  },
];

const testimonials = [
  {
    name: "Ahmet Yılmaz",
    role: "Üretim Müdürü",
    company: "ABC Metal Sanayi",
    content:
      "Makine kalitesi kadar sonrası destek süreçleri de kusursuz. Duruş süreleri azaldı.",
    avatar: "/images/avatar1.jpg",
  },
  {
    name: "Ayşe Kaya",
    role: "İşletme Sahibi",
    company: "Kaya Metal",
    content:
      "Yedek parça hızı ve teknik ekip erişimi bizi ciddi anlamda rahatlatıyor.",
    avatar: "/images/avatar2.jpg",
  },
  {
    name: "Mehmet Demir",
    role: "Teknik Müdür",
    company: "Demir Çelik A.Ş.",
    content:
      "Kurulum süreci planlandığı gibi ilerledi, performans hedeflerimizi yakaladık.",
    avatar: "/images/avatar3.jpg",
  },
];

export default function Home() {
  return (
    <div className={`${manrope.className} relative z-0 min-h-screen bg-slate-50 text-slate-900`}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0ea5a4,_transparent_45%)] opacity-25" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(2,6,23,0.85),_rgba(15,23,42,0.85))]" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-[160px]" />
        <div className="absolute bottom-0 right-16 h-80 w-80 rounded-full bg-emerald-400/10 blur-[180px]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.04)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[size:64px_64px] opacity-20" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Hızlı Menü
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <Link className="block text-white/80 hover:text-white" href="#hero">
                    Genel Bakış
                  </Link>
                  <Link className="block text-white/80 hover:text-white" href="#video">
                    Video Galerisi
                  </Link>
                  <Link className="block text-white/80 hover:text-white" href="#hizmetler">
                    Hizmetler
                  </Link>
                  <Link className="block text-white/80 hover:text-white" href="#surec">
                    Süreç
                  </Link>
                  <Link className="block text-white/80 hover:text-white" href="#referanslar">
                    Referanslar
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Öncelikli Destek
                </p>
                <p className="mt-3 text-sm text-white/80">
                  Sac, boru ve demir kesim hatları için en doğru konfigürasyonu seçelim.
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

          <main>
            <div className="overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/60 shadow-2xl backdrop-blur">
              <section id="hero" className="border-b border-white/10 px-6 py-6 sm:px-10 sm:py-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Guohong Laser
                </div>
                <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
                  Lazer kesimde <span className="text-emerald-200">yeni bir kalite standardı</span>
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-200">
                  Üretim hattınızı hızlandıran, fire oranını düşüren ve performansı sürekli artıran
                  lazer teknolojileri. Guohong Laser ile üretiminizi geleceğe taşıyın.
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
              </section>

              <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
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

                <section id="video" className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
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

                <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                      Sahadan Notlar
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-white">
                      Akıllı üretim hattı entegrasyonu
                    </h3>
                    <p className="mt-3 text-sm text-slate-300">
                      Sensör destekli hat yönetimi, gerçek zamanlı performans takibi ve enerji
                      optimizasyonu ile süreçleri ölçülebilir hale getiriyoruz.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        "Anlık performans raporu",
                        "Fire oranı analizi",
                        "Otomatik bakım takvimi",
                        "Enerji tüketimi kontrolü",
                      ].map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                    <Image
                      src="/images/about-showcase.jpg"
                      alt="Guohong Laser üretim sahası"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-slate-950/70 p-4">
                      <p className="text-sm font-semibold">Üretimde kesintisiz performans</p>
                      <p className="text-xs text-slate-300">
                        Kurulum, eğitim ve destek süreçlerini tek ekiple yönetiyoruz.
                      </p>
                    </div>
                  </div>
                </section>

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

                <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 p-6">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">
                        Hemen Başlayın
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-white">
                        Üretiminizi güçlendirecek doğru çözümü birlikte seçelim
                      </h2>
                      <p className="mt-2 text-sm text-emerald-100">
                        Uzman ekibimiz ihtiyacınıza uygun yapılandırmayı hızla hazırlasın.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link
                        href="/quote"
                        className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-emerald-700 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5"
                      >
                        Hemen Teklif Al
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center rounded-full border border-white/50 px-7 py-3 text-sm font-semibold text-white transition hover:border-white"
                      >
                        İletişime Geçin
                      </Link>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>

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
                  <p>?? +90 536 831 67 87</p>
                  <p>?? info@guohonglaser.com</p>
                  <p>?? İstanbul</p>
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
                  Teknik detayları tek dosyada toparlayın.
                </p>
                <Link
                  href="/downloads"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5"
                >
                  Dokümanlar
                </Link>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Referans Portföy
                </p>
                <p className="mt-3 text-sm text-white/80">
                  Son kurulumlarımız ve başarı hikayeleri için galeriye göz atın.
                </p>
                <Link
                  href="/gallery"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 transition hover:border-white/60 hover:text-white"
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



