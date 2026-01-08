import Image from 'next/image';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';

import Reveal from '@/components/home/Reveal';
import VideoSlider from '@/components/home/VideoSlider';

const space = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const heroStats = [
  { label: 'Hat verimliligi', value: '%98' },
  { label: 'Kurulum suresi', value: '7-12 gun' },
  { label: 'Servis noktasi', value: '24' },
];

const heroVideos = [
  {
    src: 'https://res.cloudinary.com/dar9ughwx/video/upload/v1766584816/sackesim_m6icrx.mp4',
    title: 'Lazer Sac Kesimi',
  },
  {
    src: 'https://res.cloudinary.com/dar9ughwx/video/upload/v1766584806/borukesim_dd8a5f.mp4',
    title: 'Lazer Boru Kesimi',
  },
  {
    src: 'https://res.cloudinary.com/dar9ughwx/video/upload/v1766584837/demirkesim_kbwzy2.mp4',
    title: 'Lazer Demir Kesimi',
  },
];

const commerceTiles = [
  {
    title: 'Lazer makineleri',
    description: 'Sac, boru ve kombine hatlar icin profesyonel cozumler.',
    href: '/products',
  },
  {
    title: 'Yedek parca',
    description: 'Stoklu sarf ve kritik parca tedariki.',
    href: '/spare-parts',
  },
  {
    title: 'Teknik destek',
    description: 'Bakim planlama, ariza ve uzaktan destek sureci.',
    href: '/contact?subject=Teknik+Destek',
  },
];

const spotlight = {
  title: 'Guohong GL-3015',
  description:
    'Yuksek guc secenekleri, otomatik tabla ve stabil kesim kalitesiyle uretim hattinizi hizlandirir.',
  image: '/images/1.jpg',
  specs: [
    { label: 'Guc', value: '6-12 kW' },
    { label: 'Tabla', value: '1500x3000' },
    { label: 'Otomasyon', value: 'Cift tabla' },
    { label: 'Teslim', value: '3-5 hafta' },
  ],
};

const supportGrid = [
  {
    title: 'Destek kaydi ac',
    description: 'Ariza, performans dususu veya kurulum talebi icin.',
    href: '/contact?subject=Destek+Kaydi',
  },
  {
    title: 'Bakim planla',
    description: 'Periyodik bakim ile durus riskini azalt.',
    href: '/quote?type=Bakim',
  },
  {
    title: 'Uyumluluk sor',
    description: 'Model - parca uyumu icin hizli kontrol.',
    href: '/contact?subject=Uyumluluk',
  },
  {
    title: 'Uzaktan destek',
    description: 'Teknik ekip ile uzaktan baglanti ve teshis.',
    href: '/contact?subject=Uzaktan+Destek',
  },
];

const quickShowcase = [
  {
    title: 'FSCUT',
    description: 'Kesim hattiniz icin kontrol yazilimi. Hizli kurulum.',
    price: '₺1.900,90',
    tag: 'Yazilim',
    href: '/spare-parts',
    image: '/images/1.jpg',
  },
  {
    title: 'Seramik Conta (Halka)',
    description: 'Yuksek dayanimli yedek parca. Stoktan teslim.',
    price: '₺199,99',
    tag: 'Conta',
    href: '/spare-parts',
    image: '/images/2.jpg',
  },
  {
    title: 'WSX NC30E',
    description: 'Lazer kafa parcalari icin hizli tedarik.',
    price: '₺1.199,99',
    tag: 'Lazer Kafasi',
    href: '/spare-parts',
    image: '/images/3.jpg',
  },
];

const process = [
  {
    title: 'Kesif ve analiz',
    description: 'Saha ihtiyaclari ve kapasite hedefleri netlesir.',
  },
  {
    title: 'Teknik teklif',
    description: 'Uygun makine konfigurasyonu ve plan paylasilir.',
  },
  {
    title: 'Kurulum ve egitim',
    description: 'Kurulum, test, operator ve bakim egitimi tamamlanir.',
  },
  {
    title: 'Surekli destek',
    description: 'Raporlama, uzaktan takip ve servis sureci devrede olur.',
  },
];

const testimonials = [
  {
    name: 'Ahmet Yilmaz',
    role: 'Uretim muduru',
    quote:
      'Kurulum sureci net planlandi, kesim kalitesi ve servis hizi beklentimizin ustunde.',
    image: '/images/avatar1.jpg',
  },
  {
    name: 'Ayse Kaya',
    role: 'Isletme sahibi',
    quote:
      'Yedek parca hizi sayesinde durus sureleri ciddi sekilde azaldi.',
    image: '/images/avatar2.jpg',
  },
];

const faq = [
  {
    q: 'Makine seciminde nasil ilerliyorsunuz?',
    a: 'Ucretsiz kesif ve hat analizi ile uygun konfigurasyon belirliyoruz.',
  },
  {
    q: 'Servis sureci ne kadar hizli?',
    a: 'Uzaktan destekle hizli teshis, gerekirse saha ekibi yonlendirme saglaniyor.',
  },
  {
    q: 'Yedek parca stoklari hazir mi?',
    a: 'Kritik parcalar stoklu, digerleri icin hizli tedarik hatti mevcut.',
  },
  {
    q: 'Egitim veriliyor mu?',
    a: 'Kurulum sonrasi operator ve bakim ekibine kapsamli egitim verilir.',
  },
];

export default function Home() {
  return (
    <div className={`${space.className} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-amber-200/60 blur-[120px] dark:bg-teal-500/15 glow-drift"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-teal-200/50 blur-[140px] dark:bg-sky-500/15 glow-drift"
          style={{ animationDelay: '200ms' }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(120deg,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:140px_140px] dark:opacity-20 dark:[background-image:linear-gradient(120deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(0deg,rgba(148,163,184,0.12)_1px,transparent_1px)]" />

        <Reveal as="section" className="relative mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[11px] uppercase tracking-[0.4em] text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300">
                Guohong Lazer
              </div>
              <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
                Lazer uretiminde
                <span className="block text-teal-600 dark:text-teal-300">yeni standart seti</span>
              </h1>
              <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
                Makine, yedek parca ve teknik destek tek sistemde. Hat verimliligi, servis hizi ve kaliteyi
                ayni anda yukselten tam entegre operasyon.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-teal-400 dark:text-slate-900 dark:hover:bg-teal-300"
                >
                  Makineleri gor
                </Link>
                <Link
                  href="/quote"
                  className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-white/30 pulse-ring"
                >
                  Teklif al
                </Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {heroStats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/80 float-soft"
                    style={{ animationDelay: `${index * 140}ms` }}
                  >
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative min-h-[360px] overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900/60 float-soft">
                <Image src="/images/about-showcase.jpg" alt="Guohong lazer hat" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/40 via-transparent to-white/20 dark:to-slate-900/20" />
                <div className="absolute left-6 top-6 rounded-full border border-white/60 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200">
                  Canli izleme
                </div>
                <div className="absolute bottom-6 left-6 right-6 grid gap-3 rounded-2xl border border-white/60 bg-white/90 px-4 py-4 text-slate-900 shadow-lg dark:border-white/10 dark:bg-slate-900/80 dark:text-white">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    <span>Anlik performans</span>
                    <span>%98</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Gunluk kesim raporu + uzaktan izleme
                  </div>
                </div>
              </div>
              <div
                className="absolute -bottom-6 -left-6 hidden rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-xl lg:block dark:border-white/10 dark:bg-slate-900/80 float-soft"
                style={{ animationDelay: '320ms' }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">Guclu veri</p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">7/24 izleme + servis skoru</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal as="section" className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-teal-100/80 bg-white/95 p-6 shadow-xl dark:border-slate-800/70 dark:bg-slate-900/70">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-600 dark:text-teal-300">Video galerisi</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                Sac, boru ve demir kesim hatlari
              </h2>
            </div>
            <Link
              href="/gallery"
              className="rounded-full border border-teal-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 hover:border-teal-300 dark:border-teal-500/40 dark:text-teal-200"
            >
              Galeriye git
            </Link>
          </div>
          <VideoSlider items={heroVideos} />
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-[36px] border border-teal-100/80 bg-gradient-to-br from-white via-white to-amber-50/60 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)] md:grid-cols-3 dark:border-slate-800/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          {commerceTiles.map((tile) => (
            <Link
              key={tile.title}
              href={tile.href}
              className="group relative overflow-hidden rounded-[26px] border border-teal-100/70 bg-white/90 px-5 py-6 transition hover:-translate-y-1 hover:border-teal-200 hover:bg-white hover:shadow-xl dark:border-slate-800/70 dark:bg-slate-900/70 dark:hover:border-teal-400/60"
            >
              <div className="absolute right-4 top-4 h-10 w-10 rounded-full bg-amber-100/80 dark:bg-teal-500/20" />
              <div className="mb-4 h-1 w-10 rounded-full bg-teal-500/70" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{tile.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tile.description}</p>
              <span className="mt-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
                Incele
                <span className="ml-2 transition group-hover:translate-x-1">-&gt;</span>
              </span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-teal-100/80 bg-white/95 p-6 shadow-xl dark:border-slate-800/70 dark:bg-slate-900/70">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-teal-600 dark:text-teal-300">Kisa urun vitrini</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                  Hemen teslim yedek parcalar
                </h2>
              </div>
              <Link
                href="/spare-parts"
                className="rounded-full border border-teal-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 hover:border-teal-300 dark:border-teal-500/40 dark:text-teal-200"
              >
                Tumunu gor
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {quickShowcase.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group relative overflow-hidden rounded-2xl border border-teal-100/70 bg-white px-4 pb-4 pt-3 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/80 dark:hover:border-teal-400/60"
                >
                  <div className="relative h-32 w-full overflow-hidden rounded-xl">
                    <Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                      {item.tag}
                    </span>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-teal-600 dark:text-teal-300">{item.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-900 via-teal-900/60 to-slate-900 p-6 text-white shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Hizli teklif</p>
            <h3 className="mt-3 text-2xl font-semibold">Teklifini 30 dakika icinde olusturalim</h3>
            <p className="mt-3 text-sm text-white/70">
              Uretim hedefini, parca modelini ve teslim aciliyetini ilet. Net fiyat ve plan ayni gun geri donsun.
            </p>
            <div className="mt-5 space-y-3 text-sm text-white/80">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">1. Model / parca bilgisi</div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">2. Adet ve teslim tarihi</div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">3. Iletisim e-posta adresi</div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900"
              >
                Teklif al
              </Link>
              <Link
                href="/contact?subject=Hizli+Teklif"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80"
              >
                E-posta gonder
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-teal-100/80 bg-white/95 p-6 shadow-xl dark:border-slate-800/70 dark:bg-slate-900/70">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-600 dark:text-teal-300">Urun spotlight</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{spotlight.title}</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{spotlight.description}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {spotlight.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-2xl border border-teal-100/70 bg-white px-4 py-3 dark:border-slate-800/70 dark:bg-slate-900/80"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {spec.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{spec.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 dark:bg-teal-400 dark:text-slate-900 dark:hover:bg-teal-300"
              >
                Detaylari gor
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full border border-teal-200 px-6 py-2.5 text-sm font-semibold text-teal-700 hover:border-teal-300 dark:border-teal-500/40 dark:text-teal-200"
              >
                Teklif iste
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[32px] border border-teal-100/70 bg-white shadow-xl dark:border-slate-800/70 dark:bg-slate-900/80">
            <Image src={spotlight.image} alt={spotlight.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/40 via-transparent to-transparent" />
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-teal-100/80 bg-gradient-to-br from-white via-white to-teal-50/50 p-6 shadow-xl dark:border-slate-800/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-600 dark:text-teal-300">Destek merkezi</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                E-ticaret + teknik destek tek sayfada
              </h2>
            </div>
            <Link
              href="/contact"
              className="rounded-full border border-teal-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 hover:border-teal-300 dark:border-teal-500/40 dark:text-teal-200"
            >
              Destek al
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {supportGrid.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-teal-100/70 bg-white px-4 py-4 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/80 dark:hover:border-teal-400/60"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
                  Ac
                  <span className="ml-2 transition group-hover:translate-x-1">-&gt;</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="rounded-[32px] border border-teal-100/80 bg-white/95 p-6 shadow-xl dark:border-slate-800/70 dark:bg-slate-900/70">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-600 dark:text-teal-300">Is akisi</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">4 adimda devreye alma</h2>
          <div className="mt-6 space-y-4">
            {process.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-teal-100/70 bg-white px-4 py-4 dark:border-slate-800/70 dark:bg-slate-900/80"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.title}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-900 via-teal-900/60 to-slate-900 p-6 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Uyumluluk ve guven</p>
          <h2 className="mt-2 text-2xl font-semibold">Model - parca uyumu tek ekranda</h2>
          <p className="mt-3 text-sm text-white/70">
            Makine modeline gore uyumlu yedek parcalari aninda goster, stok ve teslim bilgisiyle karar ver.
          </p>
          <div className="mt-6 grid gap-3">
            {['Model secimi', 'Uyumlu parca listesi', 'Hizli teslim bilgisi', 'Teknik onay'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm">
                {item}
              </div>
            ))}
          </div>
          <Link
            href="/spare-parts"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-teal-400 px-6 py-2.5 text-sm font-semibold text-slate-900"
          >
            Yedek parca arat
          </Link>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {testimonials.map((item) => (
          <div key={item.name} className="rounded-[32px] border border-teal-100/80 bg-white/95 p-6 shadow-xl dark:border-slate-800/70 dark:bg-slate-900/70">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <Image src={item.image} alt={item.name} width={48} height={48} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">"{item.quote}"</p>
          </div>
        ))}
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-teal-100/80 bg-white/95 p-6 shadow-xl dark:border-slate-800/70 dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-600 dark:text-teal-300">SSS</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                Karar surecini hizlandiran cevaplar
              </h2>
            </div>
            <Link
              href="/contact"
              className="rounded-full border border-teal-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 hover:border-teal-300 dark:border-teal-500/40 dark:text-teal-200"
            >
              Sorunuz mu var?
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faq.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-teal-100/70 bg-white px-4 py-4 dark:border-slate-800/70 dark:bg-slate-900/80"
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.q}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="mx-auto mt-16 max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-[36px] border border-white/10 bg-gradient-to-r from-slate-900 via-teal-900/60 to-slate-900 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Hadi baslayalim</p>
              <h2 className="mt-2 text-2xl font-semibold">Makine ve yedek parca ihtiyacin icin plan hazirlayalim</h2>
              <p className="mt-2 text-sm text-white/70">Teklifini hizli hazirlayalim, kurulum takvimini netlestirelim.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900"
              >
                Hemen teklif al
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80"
              >
                Iletisime gec
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

