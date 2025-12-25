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

const prismaSpareParts = prisma as unknown as {
  sparePart: {
    findUnique: (args: unknown) => Promise<SparePartFindUniqueResult>;
  };
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/spare-parts" className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:underline">
            ← Yedek Parçalara Dön
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
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Stok: <span className="font-semibold">{p.stockOnHand}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Ölçü: <span className="font-semibold">{p.dimensions || '-'}</span>
              </div>
            </div>

            <p className="mt-6 text-gray-700 dark:text-gray-200 leading-relaxed">{p.description}</p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <AddToCartButton
                id={p.id}
                name={p.name}
                priceCents={p.priceCents}
                imageUrl={p.imageUrl}
                className={
                  p.stockOnHand > 0
                    ? 'inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700'
                    : 'inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-gray-200 text-gray-500 cursor-not-allowed'
                }
                quantity={1}
              />
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
              >
                Ürün Hakkında Sor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
