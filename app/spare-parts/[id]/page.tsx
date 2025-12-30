import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';

import AddToCartButton from '@/components/cart/AddToCartButton';
import SparePartImageSlider from '@/components/spare-parts/SparePartImageSlider';

type SparePartDetail = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  images: Array<{ id: string; url: string }>;
  stockOnHand: number;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
};

type SparePartFindUniqueResult = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  images: Array<{ id: string; url: string }>;
  stockOnHand: number;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string };
} | null;

type RelatedPart = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  category: { name: string };
};

type SparePartFindManyResult = RelatedPart[];

const prismaSpareParts = prisma as unknown as {
  sparePart: {
    findUnique: (args: unknown) => Promise<SparePartFindUniqueResult>;
    findMany: (args: unknown) => Promise<SparePartFindManyResult>;
  };
};

const compatibilityByCategory: Record<string, string[]> = {
  'Sac Kesim': ['GL-3015', 'GL-6020', 'GL-9025'],
  'Boru Kesim': ['GT-6020', 'GT-12030'],
  'Kombine Kesim': ['GL-Comb 1500', 'GL-Comb 3000'],
  'Ozel Kesim': ['GL-9000'],
};

function formatPriceTry(priceCents: number) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} TL`;
  }
}

export default async function SparePartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const part = await prismaSpareParts.sparePart.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });

  if (!part) notFound();

  const p: SparePartDetail = {
    id: part.id,
    name: part.name,
    description: part.description,
    dimensions: part.dimensions,
    priceCents: part.priceCents,
    currency: part.currency,
    imageUrl: part.imageUrl,
    images: part.images,
    stockOnHand: part.stockOnHand,
    isFeatured: part.isFeatured,
    category: {
      id: part.category.id,
      name: part.category.name,
      slug: part.category.slug,
    },
  };

  const related = await prismaSpareParts.sparePart.findMany({
    where: {
      category: { id: part.category.id },
      NOT: { id },
    },
    take: 3,
    select: {
      id: true,
      name: true,
      priceCents: true,
      imageUrl: true,
      category: { select: { name: true } },
    },
  });

  const compatibility = compatibilityByCategory[p.category.name] ?? [];
  const inStock = p.stockOnHand > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/spare-parts" className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:underline">
            Yedek parcalara don
          </Link>
          {p.isFeatured && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-900 text-white">
              Vitrin
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <SparePartImageSlider
              images={p.images}
              fallbackUrl={p.imageUrl || '/images/1.jpg'}
              name={p.name}
            />
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-900 border border-gray-100 dark:border-gray-700">
              {p.category.name}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {p.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPriceTry(p.priceCents)}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {inStock ? 'Stokta' : 'Siparisle'}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                {inStock ? '2-3 gun teslim' : '7-10 gun teslim'}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div>
                Stok: <span className="font-semibold">{p.stockOnHand}</span>
              </div>
              <div>
                Olcu: <span className="font-semibold">{p.dimensions || '-'}</span>
              </div>
            </div>

            <p className="mt-6 text-gray-700 dark:text-gray-200 leading-relaxed">{p.description}</p>

            <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-4 text-sm text-emerald-900">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Uyumluluk</p>
              <p className="mt-2">
                {compatibility.length > 0
                  ? `Uyumlu modeller: ${compatibility.join(', ')}`
                  : 'Uyumluluk icin teknik ekiple iletisime gec.'}
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <AddToCartButton
                id={p.id}
                name={p.name}
                priceCents={p.priceCents}
                imageUrl={p.imageUrl}
                className={
                  inStock
                    ? 'inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-gray-200 text-gray-500 cursor-not-allowed'
                }
                quantity={1}
              />
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
              >
                Urun hakkinda sor
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12 rounded-[28px] border border-gray-100 bg-white/90 p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Satin alanlar bunlari da aldi</p>
                <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">Tamamlayici parcalar</h2>
              </div>
              <Link
                href="/spare-parts"
                className="rounded-full border border-gray-200 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
              >
                Tum yedek parcalar
              </Link>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/spare-parts/${item.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-white">
                    <Image src={item.imageUrl || '/images/1.jpg'} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.category.name}</p>
                  </div>
                  <span className="ml-auto text-emerald-600 transition group-hover:translate-x-1">-&gt;</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
