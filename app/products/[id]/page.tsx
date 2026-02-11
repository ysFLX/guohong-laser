import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { machineProducts } from '@/lib/machineCatalog';

export const dynamicParams = false;

const WHATSAPP_NUMBER = '905368316787';

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');

const truncate = (value: string, max = 160) =>
  value.length > max ? `${value.slice(0, max - 3)}...` : value;

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
    <div className="min-h-screen space-y-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-12 text-white shadow-2xl sm:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.45),_transparent_58%)] opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(15,23,42,0.92),_rgba(15,23,42,0.2))]" />

        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-5">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              <Link href="/" className="hover:text-white">
                Ana sayfa
              </Link>
              <span className="mx-2 text-white/40">/</span>
              <Link href="/products" className="hover:text-white">
                Makineler
              </Link>
              <span className="mx-2 text-white/40">/</span>
              <span className="text-white/90">{product.category}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">{product.category}</span>
              <span
                className={`rounded-full px-4 py-2 ${
                  product.stockLabel === 'Stokta' ? 'bg-indigo-500/90 text-white' : 'bg-amber-300/90 text-slate-950'
                }`}
              >
                {product.stockLabel}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">{product.deliveryLabel}</span>
            </div>

            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{product.name}</h1>
            <p className="max-w-2xl text-base text-white/75">{product.description}</p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={quoteHref}
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-white/90"
              >
                Teklif al
              </Link>
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 transition hover:border-white/35 hover:bg-white/15"
              >
                WhatsApp ile sor
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-transparent px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:border-white/35 hover:text-white"
              >
                İletişim
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-indigo-500/20 blur-[70px]" aria-hidden />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_25px_70px_rgba(15,23,42,0.55)]">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="grid gap-3 border-t border-white/10 px-6 py-5 text-sm">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">Güç</div>
                    <div className="mt-1 text-sm font-semibold text-white">{product.power}</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">Tabla</div>
                    <div className="mt-1 text-sm font-semibold text-white">{product.workArea}</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">Otomasyon</div>
                    <div className="mt-1 text-sm font-semibold text-white">{product.automation}</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 px-4 py-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">Teslim</div>
                    <div className="mt-1 text-sm font-semibold text-white">{product.deliveryLabel}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-xs text-white/70">
                  Doğru konfigürasyon için üretim hedeflerini yaz, ekibimiz netleştirsin.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-200">
            Öne çıkanlar
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Teknik ve üretim avantajları</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {product.features.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-5 py-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/40"
              >
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.414l-7.2 7.2a1 1 0 01-1.414 0l-3.2-3.2a1 1 0 011.414-1.414l2.493 2.493 6.493-6.493a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{feature}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200/70 bg-slate-50 px-5 py-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            Fiyat ve konfigürasyon için en hızlı yol: <span className="font-semibold">teklif talebi</span>.
            İstersen WhatsApp’tan üretim detaylarını yazıp netleştirebiliriz.
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Hızlı işlemler</p>
            <div className="mt-4 grid gap-2">
              <Link
                href={quoteHref}
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Teklif al
              </Link>
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
              >
                WhatsApp ile sor
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900/60"
              >
                Teknik destek
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Özet</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Güç</span>
                <span className="font-semibold text-slate-900 dark:text-white">{product.power}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Çalışma</span>
                <span className="font-semibold text-slate-900 dark:text-white">{product.workArea}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Otomasyon</span>
                <span className="font-semibold text-slate-900 dark:text-white">{product.automation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Stok</span>
                <span className="font-semibold text-slate-900 dark:text-white">{product.stockLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Teslim</span>
                <span className="font-semibold text-slate-900 dark:text-white">{product.deliveryLabel}</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-200">
                Benzer modeller
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                {product.category} kategorisinde alternatifler
              </h2>
            </div>
            <Link
              href="/products"
              className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900/60"
            >
              Tüm makineler
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-950/40 dark:hover:bg-slate-900/50"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{item.name}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {item.power} • {item.automation}
                  </div>
                </div>
                <span className="ml-auto text-indigo-600 dark:text-indigo-200 transition group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-white/5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-200">SSS</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Sık sorulan sorular</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/40"
            >
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{item.q}</div>
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

