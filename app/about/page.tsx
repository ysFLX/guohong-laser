'use client';

import Image from 'next/image';
import Link from 'next/link';

import Reveal from '@/components/home/Reveal';

const teamMembers = [
  {
    name: 'Fatih Turgut Polat',
    role: 'Satis Muduru',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    name: 'Arafat Uygur',
    role: 'Satis Muduru',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    name: 'Yusuf Can Gordebil',
    role: 'Satis Pazarlama',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    name: 'Yusuf Kucuktongarlak',
    role: 'Sosyal Medya Yoneticisi',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
];

const values = [
  {
    title: 'Vizyon',
    description:
      'Lazer teknolojilerinde dunya capinda bilinen, yenilikci ve surekli gelisen bir marka olmak.',
  },
  {
    title: 'Misyon',
    description:
      'Musterilerimize yuksek performansli lazer makineleri ve kesintisiz servis destegi saglamak.',
  },
  {
    title: 'Yaklasim',
    description:
      'Uretim sahasinda olculen verilerle karar alan, sonucu takip eden bir ekip olmak.',
  },
];

const stats = [
  { label: 'Yillik deneyim', value: '10+' },
  { label: 'Kurulum projesi', value: '1000+' },
  { label: 'Mutlu musteri', value: '500+' },
  { label: 'Servis noktasi', value: '24' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen space-y-16">
      <Reveal as="section" className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.4),_transparent_55%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.8),_rgba(15,23,42,0.2))]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80">
              Guohong Lazer
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Lazer teknolojisinde
              <span className="block text-emerald-300">guclu deneyim, net cozum</span>
            </h1>
            <p className="text-base text-white/70">
              10+ yillik saha deneyimimizle uretim hatlarinin ihtiyacina uygun lazer cozumleri sunuyoruz.
              Kurulum, egitim ve servis sureclerini tek ekip ile yonetiyoruz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300"
              >
                Teklif al
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
              >
                Iletisime gec
              </Link>
            </div>
          </div>
          <Reveal as="div" delay={120} className="relative">
            <div className="relative min-h-[320px] overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Guohong Lazer saha"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-900/20 to-transparent" />
            </div>
          </Reveal>
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">Biz kimiz</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
            Uretim hattina uygun cozum tasarlayan ekip
          </h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Guohong Lazer olarak lazer kesim makineleri, yedek parca tedarigi ve sahada kurulum
            hizmetlerini bir arada sunuyoruz. Amacimiz, uretimde surekliligi korumak ve verimliligi artirmak.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {stats.map((stat, index) => (
              <Reveal key={stat.label} as="div" delay={120 + index * 80}>
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <p className="text-xl font-semibold">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-white/60">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal as="div" delay={150} className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">Degerler</p>
          <div className="mt-4 space-y-4">
            {values.map((item, index) => (
              <Reveal key={item.title} as="div" delay={120 + index * 80}>
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </Reveal>

      <Reveal as="section" className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-200">Ekip</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            Sahada birlikte calisan uzman kadro
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
          {teamMembers.map((member, index) => (
            <Reveal key={member.name} as="div" delay={120 + index * 90}>
              <div className="group overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
                <div className="relative h-52 w-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.05]"
                  />
                </div>
                <div className="p-4 text-center">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">{member.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-200">
                    {member.role}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-6 rounded-[32px] border border-white/10 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 p-8 text-white lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">Birlikte calisalim</p>
          <h2 className="mt-3 text-2xl font-semibold">Uretiminizi guclendirecek cozumleri birlikte planlayalim</h2>
          <p className="mt-2 text-sm text-emerald-100">
            Kurulum ve servis sureclerini hizli planlamak icin bizimle iletisime gecin.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <Link
            href="/quote"
            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5"
          >
            Teklif iste
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-white"
          >
            Iletisim
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
