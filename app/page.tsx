import Image from 'next/image';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';

import Reveal from '@/components/home/Reveal';

const space = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const heroStats = [
  { label: 'Hat verimliligi', value: '%98' },
  { label: 'Kurulum suresi', value: '7-12 gun' },
  { label: 'Servis noktasi', value: '24' },
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
    <div className={`${space.className} space-y-16`}>
      <Reveal
        as="section"
        className="relative overflow-hidden rounded-[44px] bg-slate-950 px-6 py-14 text-white shadow-2xl sm:px-10 lg:px-14"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(251,191,36,0.25),_transparent_55%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(0deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:140px_140px]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/70">
              Guohong Laser
            </div>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Uretim hatlarina
              <span className="block text-amber-400">yeni nesil lazer gucu</span>
            </h1>
            <p className="max-w-2xl text-base text-white/70">
              Lazer makineleri, yedek parca tedarigi ve teknik destek tek merkezde.
              Daha hizli kesim, daha az durus, daha yuksek kalite.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/40 transition hover:-translate-y-0.5 hover:bg-orange-400"
              >
                Makineleri gor
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
              >
                Teklif al
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-lg font-semibold text-white">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative min-h-[340px] overflow-hidden rounded-[36px] border border-white/10 bg-white/5">
              <Image
                src="/images/about-showcase.jpg"
                alt="Guohong lazer hat"
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
              <div className="absolute bottom-6 left-6 right-6 grid gap-3 rounded-2xl bg-white/10 px-4 py-4 text-white backdrop-blur">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/70">
                  <span>Anlik performans</span>
                  <span>%98</span>
                </div>
                <div className="text-sm font-semibold">Gunluk kesim raporu + uzaktan izleme</div>
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-orange-500/40 blur-[80px]" />
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-4 rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5 md:grid-cols-3">
        {commerceTiles.map((tile) => (
          <Link
            key={tile.title}
            href={tile.href}
            className="group rounded-[24px] border border-slate-200/70 bg-white/80 px-5 py-5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <h3 className="text-lg font-semibold text-slate-900">{tile.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{tile.description}</p>
            <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
              Incele
              <span className="ml-2 transition group-hover:translate-x-1">-&gt;</span>
            </span>
          </Link>
        ))}
      </Reveal>

      <Reveal as="section" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-600">Urun spotlight</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">{spotlight.title}</h2>
          <p className="mt-3 text-sm text-slate-600">{spotlight.description}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {spotlight.specs.map((spec) => (
              <div key={spec.label} className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{spec.label}</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{spec.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white"
            >
              Detaylari gor
            </Link>
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600"
            >
              Teklif iste
            </Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/90 shadow-xl">
          <Image src={spotlight.image} alt={spotlight.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-transparent to-transparent" />
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-600">Destek merkezi</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">E-ticaret + teknik destek tek sayfada</h2>
          </div>
          <Link
            href="/contact"
            className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
          >
            Destek al
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {supportGrid.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                Ac
                <span className="ml-2 transition group-hover:translate-x-1">-&gt;</span>
              </span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-600">Is akisi</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">4 adimda devreye alma</h2>
          <div className="mt-6 space-y-4">
            {process.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[32px] border border-slate-200/70 bg-slate-950 p-6 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Uyumluluk ve guven</p>
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
            className="mt-6 inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900"
          >
            Yedek parca arat
          </Link>
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-5 lg:grid-cols-2">
        {testimonials.map((item) => (
          <div key={item.name} className="rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-full bg-white/10">
                <Image src={item.image} alt={item.name} width={48} height={48} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.role}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">"{item.quote}"</p>
          </div>
        ))}
      </Reveal>

      <Reveal as="section" className="rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-600">SSS</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Karar surecini hizlandiran cevaplar</h2>
          </div>
          <Link
            href="/contact"
            className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600"
          >
            Sorunuz mu var?
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faq.map((item) => (
            <div key={item.q} className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">{item.q}</p>
              <p className="mt-2 text-sm text-slate-600">{item.a}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal
        as="section"
        className="grid gap-6 rounded-[36px] border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-8 text-white"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Hadi baslayalim</p>
            <h2 className="mt-2 text-2xl font-semibold">Makine ve yedek parca ihtiyacin icin plan hazirlayalim</h2>
            <p className="mt-2 text-sm text-white/70">Teklifini hizli hazirlayalim, kurulum takvimini netlestirelim.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white"
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
      </Reveal>
    </div>
  );
}

