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
  { name: "Yillik deneyim", value: "10+" },
  { name: "Mutlu musteri", value: "500+" },
  { name: "Tamamlanan proje", value: "1000+" },
  { name: "Servis noktasi", value: "24" },
];

const services = [
  {
    name: "Lazer kesim makineleri",
    description: "Sac, boru ve demir kesim hatlarinda yuksek performans.",
    href: "/products?category=Sac+Kesim",
  },
  {
    name: "Teknik servis",
    description: "Bakim, ariza ve performans iyilestirme cozumleri.",
    href: "/contact?subject=Teknik+Servis",
  },
  {
    name: "Yedek parca",
    description: "Orijinal yedek parca ve hizli temin akisi.",
    href: "/products?category=Yedek+Par%C3%A7a",
  },
  {
    name: "Danismanlik",
    description: "Uretim hatlariniza ozel planlama ve teknoloji danismanligi.",
    href: "/contact?subject=Dan%C4%B1%C5%9Fmanl%C4%B1k",
  },
];

const process = [
  {
    title: "Kesif ve analiz",
    description: "Uretim ihtiyacinizi ve hedef kapasiteyi netlestiriyoruz.",
  },
  {
    title: "Teknik teklif",
    description: "Sahaya uygun makine konfigurasyonu ve yatirim plani.",
  },
  {
    title: "Kurulum ve egitim",
    description: "Kurulum, test ve operator egitimini uctan uca yapiyoruz.",
  },
  {
    title: "Surekli destek",
    description: "Bakim, yedek parca ve performans gelistirme takibi.",
  },
];

const testimonials = [
  {
    name: "Ahmet Yilmaz",
    role: "Uretim muduru",
    company: "ABC Metal Sanayi",
    content:
      "Makine kalitesi kadar sonrasindaki destek surecleri de kusursuz. Durus sureleri azaldi.",
    avatar: "/images/avatar1.jpg",
  },
  {
    name: "Ayse Kaya",
    role: "Isletme sahibi",
    company: "Kaya Metal",
    content:
      "Yedek parca hizi ve teknik ekip erisimi bizi ciddi anlamda rahatlatiyor.",
    avatar: "/images/avatar2.jpg",
  },
  {
    name: "Mehmet Demir",
    role: "Teknik mudur",
    company: "Demir Celik A.S.",
    content:
      "Kurulum sureci planlandigi gibi ilerledi, performans hedeflerimizi yakaladik.",
    avatar: "/images/avatar3.jpg",
  },
];

export default function Home() {
  return (
    <div className={`${manrope.className} space-y-10`}>
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6 reveal">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.4em] text-slate-600 dark:border-white/15 dark:bg-white/5 dark:text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-300" />
            Guohong Laser
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-4xl">
              Lazer kesimde
              <span className="block text-emerald-600 dark:text-emerald-200">
                yeni bir kalite standardi
              </span>
            </h1>
            <p className="max-w-2xl text-base text-slate-600 dark:text-slate-200">
              Uretim hatlarinizi hizlandiran, fire oranini dusuren ve performansi surekli artiran
              lazer teknolojileri. Guohong Laser ile uretiminizi gelecege tasiyin.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/spare-parts"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              Urunleri kesfet
            </Link>
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/20 dark:text-white/90 dark:hover:border-white/60 dark:hover:text-white"
            >
              Ucretsiz teklif al
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-white/70">
            <span className="rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 dark:border-white/15 dark:bg-white/5">
              Yerinde kurulum
            </span>
            <span className="rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 dark:border-white/15 dark:bg-white/5">
              Hizli servis
            </span>
            <span className="rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 dark:border-white/15 dark:bg-white/5">
              Uretim optimizasyonu
            </span>
          </div>
        </div>
        <div className="reveal reveal-delay-1">
          <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-xl dark:border-white/10 dark:bg-white/5">
            <Image
              src="/images/about-showcase.jpg"
              alt="Guohong Laser uretim sahasi"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/75 via-slate-900/10 to-transparent" />
            <button
              type="button"
              className="pulse-ring absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg"
            >
              ▶
            </button>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl bg-slate-950/70 px-4 py-3 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Canli hat</p>
                <p className="text-sm font-semibold">Gunluk performans takibi</p>
              </div>
              <span className="rounded-full border border-white/40 px-3 py-1 text-xs">98% verim</span>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal reveal-delay-1 rounded-3xl border border-slate-200/70 bg-white/80 px-6 py-5 text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {stats.map((stat, index) => (
            <div key={stat.name} className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-white/60">
                  {stat.name}
                </p>
              </div>
              {index < stats.length - 1 && (
                <span className="hidden h-8 w-px bg-slate-200/80 dark:bg-white/15 sm:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section
        id="video"
        className="reveal reveal-delay-2 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-xl dark:border-white/10 dark:bg-white/5"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">
              Video Galerisi
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
              Uretim hatlarini yakindan inceleyin
            </h2>
          </div>
          <Link
            href="/gallery"
            className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/20 dark:text-white/80 dark:hover:border-white dark:hover:text-white"
          >
            Galeriye git
          </Link>
        </div>
        <VideoSlider items={heroVideos} />
      </section>

      <section id="hizmetler" className="reveal space-y-5">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">
              Hizmetler
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Uctan uca lazer cozumleri
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Her is akisi icin ozel planlama, kurulum ve destek paketleri sunuyoruz.
            </p>
          </div>
          <div className="space-y-3">
            {services.map((service) => (
              <Link
                key={service.name}
                href={service.href}
                className="group flex items-start justify-between gap-6 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
              >
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {service.description}
                  </p>
                </div>
                <span className="text-emerald-600 transition group-hover:translate-x-1 dark:text-emerald-200">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="reveal grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 dark:border-white/10 dark:bg-white/5">
          <Image
            src="/images/about-showcase.jpg"
            alt="Guohong Laser uretim sahasi"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/75 via-slate-900/10 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-slate-950/70 p-4">
            <p className="text-sm font-semibold text-white">Uretimde kesintisiz performans</p>
            <p className="text-xs text-slate-300">
              Kurulum, egitim ve destek sureclerini tek ekiple yonetiyoruz.
            </p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">
            Sahadan notlar
          </p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
            Akilli uretim hatti entegrasyonu
          </h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Sensor destekli hat yonetimi, gercek zamanli performans takibi ve enerji
            optimizasyonu ile surecleri olculebilir hale getiriyoruz.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Anlik performans raporu",
              "Fire orani analizi",
              "Otomatik bakim takvimi",
              "Enerji tuketimi kontrolu",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="surec" className="reveal space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">
            Surec
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Seffaf ve kontrollu proje yonetimi
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {process.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
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
      </section>

      <section id="referanslar" className="reveal space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">
            Referanslar
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Is ortaklarimizin deneyimleri
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex flex-wrap items-center gap-4">
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
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {t.role} - {t.company}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-200">"{t.content}"</p>
            </div>
          ))}
        </div>
      </section>

      <section className="reveal rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 p-6 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">Hemen baslayin</p>
            <h2 className="mt-3 text-2xl font-semibold">
              Uretiminizi guclendirecek dogru cozumu birlikte secelim
            </h2>
            <p className="mt-2 text-sm text-emerald-100">
              Uzman ekibimiz ihtiyaciniza uygun yapilandirmayi hizla hazirlasin.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5"
            >
              Hemen teklif al
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white"
            >
              Iletisime gecin
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
