import Image from "next/image";
import Link from "next/link";

import VideoSlider from "@/components/home/VideoSlider";

const highlights = [
  {
    title: "Mikron seviyesinde hassasiyet",
    description: "Sürekli kalite kontrol ile tekrarlanabilir, pürüzsüz kesimler.",
    icon: "M5 13l4 4L19 7",
  },
  {
    title: "Saha tecrübesi ve hızlı kurulum",
    description: "Kurulumdan eğitime kadar tek ekip, tek sorumluluk.",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    title: "Satış sonrası güçlü destek",
    description: "7/24 teknik destek ve yaygın yedek parça stoğu.",
    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  },
];

const services = [
  {
    name: "Lazer Kesim Makineleri",
    description: "Sac, boru ve demir kesim hatlarında yüksek hassasiyet.",
    icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z",
    href: "/products?category=Sac+Kesim",
  },
  {
    name: "Teknik Servis",
    description: "Bakım, arıza ve performans iyileştirme çözümleri.",
    icon: "M11 4a2 2 0 114 0v1h1.5a.5.5 0 01.5.5v2.6l-1.2 1.2a.5.5 0 01-.7 0l-1.2-1.2V4zM4.5 5.5a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-1zm13 0a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-1z",
    href: "/contact?subject=Teknik+Servis",
  },
  {
    name: "Yedek Parça",
    description: "Orijinal yedek parça ve hızlı temin ağı.",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    href: "/products?category=Yedek+Par%C3%A7a",
  },
  {
    name: "Danışmanlık",
    description: "Üretim hattınıza uygun teknik planlama ve proje danışmanlığı.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    href: "/contact?subject=Dan%C4%B1%C5%9Fmanl%C4%B1k",
  },
];

const stats = [
  { name: "Yıllık Deneyim", value: "10+" },
  { name: "Mutlu Müşteri", value: "500+" },
  { name: "Tamamlanan Proje", value: "1000+" },
  { name: "Aktif Saha Ekibi", value: "50+" },
];

const process = [
  {
    title: "Keşif ve ihtiyaç analizi",
    description: "Üretim hedeflerinizi ve kapasitenizi netleştiriyoruz.",
  },
  {
    title: "Teknik teklif ve planlama",
    description: "Sahaya özel konfigürasyon ve yatırım planı çıkarıyoruz.",
  },
  {
    title: "Kurulum ve eğitim",
    description: "Kurulumdan operatör eğitimine kadar uçtan uca teslim.",
  },
  {
    title: "Sürekli destek",
    description: "Bakım, yedek parça ve optimizasyon desteği sağlıyoruz.",
  },
];

const testimonials = [
  {
    name: "Ahmet Yılmaz",
    role: "Üretim Müdürü",
    company: "ABC Metal Sanayi",
    content:
      "Makine kalitesi kadar, sonrası destek süreci de çok güçlü. Duruş süreleri minimuma indi.",
    avatar: "/images/avatar1.jpg",
  },
  {
    name: "Ayşe Kaya",
    role: "İşletme Sahibi",
    company: "Kaya Metal",
    content:
      "Yedek parça temini hızlı, teknik ekip her zaman ulaşılabilir. Güven veren bir iş ortağı.",
    avatar: "/images/avatar2.jpg",
  },
  {
    name: "Mehmet Demir",
    role: "Teknik Müdür",
    company: "Demir Çelik A.Ş.",
    content:
      "Proje yönetimi profesyonel, kurulum süreci planlandığı gibi tamamlandı. Tavsiye ederim.",
    avatar: "/images/avatar3.jpg",
  },
];

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

export default function Home() {
  return (
    <div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1d4ed8,_transparent_55%)] opacity-40" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.95),_rgba(15,23,42,0.6))]" />
        </div>
        <div className="absolute -left-16 top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-28 lg:pt-28">
          <div>
            <span className="inline-flex items-center rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Guohong Laser
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Üretimde hız,{" "}
              <span className="text-blue-400">kesimde mutlak hassasiyet</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-200">
              Lazer kesim hatlarınızı üst seviyeye taşıyan makine çözümleri,
              hızlı servis ve sürdürülebilir performans. Üretim süreçlerinizi
              birlikte büyütelim.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/spare-parts"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:bg-blue-500"
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
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
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
          </div>

          <div className="relative hidden min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl lg:block">
            <Image
              src="/images/about-showcase.jpg"
              alt="Guohong Laser üretim sahası"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-slate-950/70 p-4">
              <p className="text-sm font-semibold">Akıllı üretim hattı</p>
              <p className="text-xs text-slate-300">
                Kurulumdan destek süreçlerine kadar uçtan uca çözüm.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-10 bg-white pb-16 dark:bg-slate-950 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="mb-8 flex items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                  Video Galerisi
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
                  Üretim hatlarını yakından inceleyin
                </h2>
              </div>
              <Link
                href="/gallery"
                className="hidden rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400 sm:inline-flex"
              >
                Galeriye Git
              </Link>
            </div>
            <VideoSlider items={heroVideos} />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 dark:bg-slate-900 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                Neden Guohong?
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
                Üretiminiz için güvenilir teknoloji ortağı
              </h2>
              <p className="mt-5 text-lg text-slate-600 dark:text-slate-300">
                İhtiyaçlarınıza özel konfigürasyon, yüksek verim ve hızlı servis
                yapımızla yatırımınızı güvence altına alıyoruz.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white bg-white p-5 shadow-lg shadow-slate-200/40 transition hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 dark:bg-slate-950 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
              Hizmetler
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              Uçtan uca lazer çözümleri
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Ürün ve servislerimizle üretim hattınızın tüm ihtiyaçlarını tek çatı
              altında karşılıyoruz.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <Link
                key={service.name}
                href={service.href}
                className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/40 transition hover:-translate-y-1 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/20 dark:text-blue-300 dark:group-hover:bg-blue-500">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={service.icon}
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                  {service.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {service.description}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Detayları Gör
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 dark:bg-slate-900 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                Süreç
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
                Şeffaf ve kontrollü proje yönetimi
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Teklif aşamasından satış sonrası desteğe kadar tüm adımları planlı
                ve ölçümlenebilir şekilde yönetiyoruz.
              </p>
            </div>
            <div className="space-y-6">
              {process.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 dark:bg-slate-950 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
              Referanslar
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              İş ortaklarımızın deneyimleri
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Güven veren iş birlikleri ile her yıl daha fazla üretim hattı
              güçlendiriyoruz.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {testimonial.role} · {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                  “{testimonial.content}”
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-100">
              Hemen Başlayın
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Üretim hattınız için doğru çözümü birlikte seçelim
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-blue-100">
              Formu doldurun, uzman ekibimiz ihtiyaçlarınıza uygun çözüm ile hızlı
              bir teklif hazırlasın.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row lg:mt-0">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5"
            >
              Hemen Teklif Al
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              İletişime Geçin
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
