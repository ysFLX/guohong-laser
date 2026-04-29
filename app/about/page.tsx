'use client';

import Image from 'next/image';
import Link from 'next/link';

import Reveal from '@/components/home/Reveal';

const milestones = [
  { year: '2014', title: 'İlk saha kurulumları', text: 'Lazer makine entegrasyonları ve ilk teslim projeleri tamamlandı.' },
  { year: '2017', title: 'Servis ağının büyümesi', text: 'Kurulum, bakım ve sarf yönetimi tek yapıda toplandı.' },
  { year: '2020', title: 'Akıllı üretim yaklaşımı', text: 'Saha verisi, performans raporu ve izleme çözümleri genişledi.' },
  { year: '2024', title: 'Küresel tedarik ağı', text: 'Kritik bileşen erişimi ve hızlı parça tedariği daha da güçlendirildi.' },
];

const values = [
  'Lazer teknolojilerinde güvenilir kalite',
  'Kurulumdan satış sonrasına eksiksiz teknik çözüm',
  'Hızlı servis, net iletişim ve uzun dönemli iş ortaklığı',
];

export default function AboutPage() {
  return (
    <div className="space-y-14 pb-16 text-white">
      <Reveal as="section" className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#15148c] shadow-[0_40px_120px_-60px_rgba(5,0,92,0.95)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,106,13,0.24),_transparent_30%),linear-gradient(120deg,_rgba(5,0,92,0.2),_rgba(5,0,92,0.92))]" />
        <div className="relative grid gap-8 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[#ff6a0d]">Hakkımızda</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Profesyonel üretim ve hizmet sağlayıcıları
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/76">
              Guohong Laser Group; Ar-Ge, üretim ve satış süreçlerini birleştiren metal lazer kesim makinesi
              üreticisidir. Sac, boru, kombine ve kaynak çözümlerini sahaya hazır hale getirir.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-[#ff6a0d] px-7 py-3 text-sm font-semibold text-[#15148c]">
                Daha Fazlasını Gör
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white">
                Bize Ulaşın
              </Link>
            </div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden rounded-[30px] border border-white/10">
            <Image src="/images/about-showcase.jpg" alt="Guohong Lazer üretim alanı" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(5,0,92,0.12),_rgba(5,0,92,0.58))]" />
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="grid gap-8 rounded-[34px] border border-white/10 bg-[#15148c] px-6 py-8 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)] lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">Toplam çözüm</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Tasarım, üretim ve satış sonrası hizmeti aynı çatı altında topluyoruz</h2>
          <p className="mt-4 text-base leading-8 text-white/74">
            Ürün tasarımı, montaj, ürün eğitimi, bakım planı ve yedek parça erişimi dahil olmak üzere müşterilerimize
            teknolojik olarak gelişmiş, güvenilir kaliteli ürünler sunuyoruz.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { value: '4', label: 'Üretim tesisi' },
            { value: '10+', label: 'Yıl deneyim' },
            { value: '120000 m²', label: 'Fabrika alanı' },
          ].map((item) => (
            <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <div className="text-3xl font-semibold text-[#ff6a0d]">{item.value}</div>
              <div className="mt-2 text-sm text-[#ff6a0d]">{item.label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[34px] border border-white/10 bg-[#15148c] px-6 py-8 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">Yölçüluk</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Büyüme adımlarımız</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {milestones.map((item) => (
            <div key={item.year} className="rounded-[24px] border border-white/10 bg-white/6 p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff6a0d]">{item.year}</div>
              <div className="mt-3 text-xl font-semibold text-white">{item.title}</div>
              <div className="mt-3 text-sm leading-7 text-white/72">{item.text}</div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="rounded-[34px] border border-white/10 bg-[#15148c] px-6 py-8 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
        <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#ff6a0d]">Yaklaşım</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Guohong değerleri</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {values.map((item) => (
            <div key={item} className="rounded-[24px] border border-white/10 bg-white/6 p-5 text-sm leading-7 text-white/76">
              {item}
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}


