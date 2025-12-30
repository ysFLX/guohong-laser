import Image from "next/image";
import Link from "next/link";
import { Manrope } from "next/font/google";

import Reveal from "@/components/home/Reveal";
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
  { name: "Yillik deneyim", value: "10+", hint: "Saha tecrubesi" },
  { name: "Mutlu musteri", value: "500+", hint: "Kurulum referansi" },
  { name: "Tamamlanan proje", value: "1000+", hint: "Uretim teslimi" },
  { name: "Servis noktasi", value: "24", hint: "Hizli destek" },
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

const industries = [
  {
    title: "Otomotiv ve yan sanayi",
    description: "Hassas sac kesim, prototipleme ve seri uretim hatlari.",
    image: "/images/1.jpg",
  },
  {
    title: "Makine imalat",
    description: "Yuksek dayanima uygun lazer kesim ve bilesen uretimi.",
    image: "/images/2.jpg",
  },
  {
    title: "Metal yapi",
    description: "Buyuk ebatli sac ve profil kesim ihtiyaclari.",
    image: "/images/about-showcase.jpg",
  },
];

const faqs = [
  {
    question: "Kurulum suresi ne kadar?",
    answer: "Proje kapsaminda 5-12 gun araliginda kurulumu tamamliyoruz.",
  },
  {
    question: "Teknik servis kim tarafindan veriliyor?",
    answer: "Guohong Laser ekipleri sahada kurulum ve surekli destek sagliyor.",
  },
  {
    question: "Yedek parca stoklari hazir mi?",
    answer: "Kritik parcalar icin hizli temin ve stoklu teslimat sunuyoruz.",
  },
  {
    question: "Uretim hattima uygun makine secimi nasil yapilir?",
    answer: "Ucretsiz kesif ve analiz ile ihtiyaca uygun konfigurasyon belirliyoruz.",
  },
];

const highlights = [
  {
    label: "Enerji verimliligi",
    value: "%22 tasarruf",
    description: "Akilli hat yonetimi ve optimizasyon",
  },
  {
    label: "Hizli devreye alma",
    value: "7-12 gun",
    description: "Planli kurulum, test ve egitim",
  },
  {
    label: "Saha kapsami",
    value: "24/7",
    description: "Teknik ekip ve uzaktan izleme",
  },
];

export default function Home() {
  return (
    <div className={`${manrope.className} space-y-16`}>
      <Reveal as="section" className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_55%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.2))]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.05)_1px,_transparent_1px),_linear-gradient(0deg,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[size:80px_80px] opacity-20" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Guohong Laser
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                Lazer kesimde
                <span className="block text-emerald-300">yeni bir kalite standardi</span>
              </h1>
              <p className="max-w-2xl text-base text-white/70">
                Uretim hatlarinizi hizlandiran, fire oranini dusuren ve performansi surekli artiran
                lazer teknolojileri. Guohong Laser ile uretiminizi gelecege tasiyin.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/spare-parts"
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                Urunleri kesfet
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
              >
                Ucretsiz teklif al
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              <span className="float-soft rounded-full border border-white/15 bg-white/10 px-4 py-2">
                Yerinde kurulum
              </span>
              <span className="float-soft rounded-full border border-white/15 bg-white/10 px-4 py-2">
                Hizli servis
              </span>
              <span className="float-soft rounded-full border border-white/15 bg-white/10 px-4 py-2">
                Uretim optimizasyonu
              </span>
            </div>
          </div>
          <Reveal as="div" delay={150} className="relative">
            <div className="relative min-h-[320px] overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl">
              <Image
                src="/images/about-showcase.jpg"
                alt="Guohong Laser uretim sahasi"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-900/20 to-transparent" />
              <button
                type="button"
                className="pulse-ring absolute left-6 top-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg"
              >
                &gt;
              </button>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-white backdrop-blur">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Canli hat</p>
                  <p className="text-sm font-semibold">Gunluk performans takibi</p>
                </div>
                <span className="rounded-full border border-white/40 px-3 py-1 text-xs">98% verim</span>
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-emerald-400/30 blur-[70px]" />
          </Reveal>
        </div>
      </Reveal>

      <Reveal
        as="section"
        delay={120}
        className="grid gap-4 rounded-[28px] border border-slate-200/70 bg-white/90 px-6 py-6 shadow-xl dark:border-white/10 dark:bg-white/5 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <Reveal key={stat.name} as="div" delay={index * 90} className="space-y-2">
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-white/60">
              {stat.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-white/60">{stat.hint}</p>
          </Reveal>
        ))}
      </Reveal>

      <Reveal as="section" delay={200} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
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
        </div>
        <div className="space-y-4">
          {[
            "Kesim kalibrasyonu ve test", 
            "Operator egitim programi",
            "Uzaktan izleme raporu",
            "Enerji ve sarf optimizasyonu",
          ].map((item, index) => (
            <Reveal key={item} as="div" delay={120 + index * 80}>
              <div className="rounded-[24px] border border-slate-200/70 bg-white/90 px-5 py-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-white/60">
                  Her kurulum sonrasinda detayli rapor ve saha destegi sunuyoruz.
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" id="hizmetler" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal as="div" delay={80} className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">
            Hizmetler
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
            Uctan uca lazer cozumleri
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Her is akisi icin ozel planlama, kurulum ve destek paketleri sunuyoruz.
          </p>
          <div className="mt-6 space-y-3 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-white/60">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 dark:border-white/10 dark:bg-white/5">
              1 yil garanti
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 dark:border-white/10 dark:bg-white/5">
              Ozel konfigurasyon
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 dark:border-white/10 dark:bg-white/5">
              Yerinde servis
            </span>
          </div>
        </Reveal>
        <div className="space-y-3">
          {services.map((service, index) => (
            <Reveal key={service.name} as="div" delay={140 + index * 90}>
              <Link
                href={service.href}
                className="group flex items-start justify-between gap-6 rounded-[24px] border border-slate-200/70 bg-white/90 px-5 py-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
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
                  -&gt;
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">
              Kullanildigi alanlar
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Farkli sektorlerde guvenilir performans
            </h2>
          </div>
          <Link
            href="/products"
            className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/20 dark:text-white/80 dark:hover:border-white dark:hover:text-white"
          >
            Tum urunler
          </Link>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {industries.map((item, index) => (
            <Reveal key={item.title} as="div" delay={120 + index * 90}>
              <div className="group overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.05]"
                  />
                </div>
                <div className="space-y-3 p-5">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">
            Performans ozeti
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
            Uretim hattiniza net katki saglayan metrikler
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Uretim akisini hizlandiran, maliyetleri dusuren ve kaliteyi yukseltan
            olculebilir etkileri sunuyoruz.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {highlights.map((item, index) => (
              <Reveal
                key={item.label}
                as="div"
                delay={120 + index * 80}
                className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-white/60">
                  {item.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal as="div" delay={160} className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">
            Neden Guohong?
          </p>
          <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
            Uretimde sureklilik icin tasarlanmis hizmet modeli
          </h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              Tek ekip, tek plan: kurulumdan bakima kadar tek noktadan yonetim.
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              Gercek zamanli raporlama ve uzaktan izleme altyapisi.
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              Kritik parcalar icin hizli stok ve lojistik destegi.
            </div>
          </div>
        </Reveal>
      </Reveal>

      <Reveal as="section" id="surec" className="space-y-5">
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
            <Reveal key={step.title} as="div" delay={100 + index * 80}>
              <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
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
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" id="referanslar" className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">
            Referanslar
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Is ortaklarimizin deneyimleri
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((t, index) => (
            <Reveal key={t.name} as="div" delay={120 + index * 90}>
              <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
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
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">
            Sikca sorulan sorular
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Karar surecini hizlandiran net cevaplar
          </h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {faqs.map((item, index) => (
            <Reveal key={item.question} as="div" delay={120 + index * 80}>
              <div className="rounded-[24px] border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.question}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {item.answer}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="grid gap-6 rounded-[32px] border border-white/10 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 p-8 text-white lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">Hemen baslayin</p>
          <h2 className="mt-3 text-2xl font-semibold">
            Uretiminizi guclendirecek dogru cozumu birlikte secelim
          </h2>
          <p className="mt-2 text-sm text-emerald-100">
            Uzman ekibimiz ihtiyaciniza uygun yapilandirmayi hizla hazirlasin.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
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
      </Reveal>
    </div>
  );
}
