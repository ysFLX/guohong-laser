import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { machineProducts } from '@/lib/machineCatalog';

export const dynamicParams = false;

const WHATSAPP_NUMBER = '905368316787';

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');

const truncate = (value: string, max = 160) => (value.length > max ? `${value.slice(0, max - 3)}...` : value);

const faqItems = [
  {
    q: 'Teslimat süresi nedir?',
    a: 'Stok durumuna göre değişir. Detaylı plan için teklif isteyebilirsiniz.',
  },
  {
    q: 'Kurulum ve eğitim sağlıyor musunuz?',
    a: 'Yerinde kurulum, operatör eğitimi ve uzaktan destek süreçleri sunuyoruz.',
  },
  {
    q: 'Hangi güç ve tablaya ihtiyacım var?',
    a: 'Kesilecek malzeme türü, kalınlık ve üretim hedeflerinize göre uygun konfigürasyon önerilir.',
  },
];

function buildWhatsAppHref(productName: string, productUrl: string) {
  const message = `Merhaba, ${productName} hakkında bilgi almak istiyorum.\nLink: ${productUrl}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function generateStaticParams() {
  return machineProducts.map((product) => ({ id: String(product.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  const product = machineProducts.find((item) => item.id === numericId);

  if (!product) {
    return {
      title: 'Ürün bulunamadı',
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/products/${product.id}`;
  const title = `${product.name} | Guohong Lazer`;
  const description = truncate(product.description || `${product.name} ürün detayları.`);
  const imageUrl = `${baseUrl}${product.image.startsWith('/') ? product.image : `/${product.image}`}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const product = machineProducts.find((item) => item.id === numericId);
  if (!product) notFound();

  const baseUrl = getBaseUrl();
  const productUrl = `${baseUrl}/products/${product.id}`;
  const whatsAppHref = buildWhatsAppHref(product.name, productUrl);
  const quoteHref = `/quote?product=${encodeURIComponent(product.name)}`;
  const related = machineProducts.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    category: product.category,
    image: [`${baseUrl}${product.image.startsWith('/') ? product.image : `/${product.image}`}`],
    brand: {
      '@type': 'Organization',
      name: 'Guohong Lazer',
    },
    url: productUrl,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Güç', value: product.power },
      { '@type': 'PropertyValue', name: 'Çalışma Alanı', value: product.workArea },
      { '@type': 'PropertyValue', name: 'Otomasyon', value: product.automation },
      { '@type': 'PropertyValue', name: 'Stok', value: product.stockLabel },
      { '@type': 'PropertyValue', name: 'Teslim', value: product.deliveryLabel },
    ],
  };

  return (
    <div className="space-y-14 pb-16 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#15148c] px-6 py-12 text-white shadow-[0_40px_120px_-60px_rgba(5,0,92,0.95)] sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,106,13,0.24),_transparent_32%),linear-gradient(120deg,_rgba(5,0,92,0.2),_rgba(5,0,92,0.92))]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="space-y-5">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              <Link href="/" className="hover:text-white">Ana sayfa</Link>
              <span className="mx-2 text-white/40">/</span>
              <Link href="/products" className="hover:text-white">Ürünler</Link>
              <span className="mx-2 text-white/40">/</span>
              <span className="text-white">{product.category}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2">{product.category}</span>
              <span className={`rounded-full px-4 py-2 ${product.stockLabel === 'Stokta' ? 'bg-[#ff6a0d] text-[#15148c]' : 'bg-white/90 text-[#15148c]'}`}>
                {product.stockLabel}
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2">{product.deliveryLabel}</span>
            </div>

            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{product.name}</h1>
            <p className="max-w-2xl text-base leading-8 text-white/75">{product.description}</p>

            <div className="flex flex-wrap gap-3">
              <Link href={quoteHref} className="inline-flex items-center justify-center rounded-full bg-[#ff6a0d] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#15148c] transition hover:brightness-105">
                Teklif al
              </Link>
              <a href={whatsAppHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/8 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 transition hover:bg-white/12">
                WhatsApp ile sor
              </a>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-transparent px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/10 hover:text-white">
                Bize ulaşın
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-[#ff6a0d]/20 blur-[70px]" aria-hidden />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/6 shadow-[0_25px_70px_rgba(15,23,42,0.55)]">
              <div className="relative aspect-[4/3] w-full">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" priority />
              </div>
              <div className="grid gap-3 border-t border-white/10 px-6 py-5 text-sm">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { label: 'Güç', value: product.power },
                    { label: 'Tabla', value: product.workArea },
                    { label: 'Otomasyon', value: product.automation },
                    { label: 'Teslim', value: product.deliveryLabel },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-white/6 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">{item.label}</div>
                      <div className="mt-1 text-sm font-semibold text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/6 px-5 py-4 text-xs text-white/70">
                  Doğru konfigürasyon için üretim hedeflerini yaz, ekibimiz netleştirsin.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff6a0d]">Öne çıkanlar</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Teknik ve üretim avantajları</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {product.features.map((feature) => (
              <div key={feature} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/6 px-5 py-4 shadow-sm">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6a0d] text-[#15148c]">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.2 7.2a1 1 0 01-1.414 0l-3.2-3.2a1 1 0 011.414-1.414l2.493 2.493 6.493-6.493a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="text-sm font-semibold text-white">{feature}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/6 px-5 py-4 text-sm text-white/72">
            Fiyat ve konfigürasyon için en hızlı yol: <span className="font-semibold text-white">teklif talebi</span>. Ä°stersen WhatsApp&apos;tan üretim detaylarını yazıp netleştirebiliriz.
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Hızlı işlemler</p>
            <div className="mt-4 grid gap-2">
              <Link href={quoteHref} className="inline-flex items-center justify-center rounded-2xl bg-[#ff6a0d] px-5 py-3 text-sm font-semibold text-[#15148c] transition hover:brightness-105">
                Teklif al
              </Link>
              <a href={whatsAppHref} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                WhatsApp ile sor
              </a>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Teknik destek
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Özet</p>
            <div className="mt-4 space-y-3 text-sm text-white/72">
              {[
                { label: 'Güç', value: product.power },
                { label: 'Çalışma', value: product.workArea },
                { label: 'Otomasyon', value: product.automation },
                { label: 'Stok', value: product.stockLabel },
                { label: 'Teslim', value: product.deliveryLabel },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/45">{item.label}</span>
                  <span className="font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {related.length > 0 ? (
        <section className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff6a0d]">Benzer modeller</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{product.category} kategorisinde alternatifler</h2>
            </div>
            <Link href="/products" className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/82 transition hover:bg-white/10">
              Tüm makineler
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/6 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white/10">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white line-clamp-1">{item.name}</div>
                  <div className="mt-1 text-xs text-white/55">{item.power} â€¢ {item.automation}</div>
                </div>
                <span className="ml-auto text-[#ff6a0d] transition group-hover:translate-x-1">â†’</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-white/10 bg-white/6 p-6 shadow-[0_30px_90px_-70px_rgba(5,0,92,0.95)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#ff6a0d]">SSS</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Sık sorulan sorular</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <div key={item.q} className="rounded-2xl border border-white/10 bg-white/6 p-5 shadow-sm">
              <div className="text-sm font-semibold text-white">{item.q}</div>
              <div className="mt-2 text-sm text-white/72">{item.a}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

