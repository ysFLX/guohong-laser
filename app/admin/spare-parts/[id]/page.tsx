import { getServerSession } from 'next-auth';
import Image from 'next/image';

import { authOptions } from '@/auth';
import AdminSparePartEditForm from '@/components/spare-parts/AdminSparePartEditForm';
import AdminImageUpload from '@/components/spare-parts/AdminImageUpload';
import { prisma } from '@/lib/prisma';

type SparePartResult = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  priceCents: number;
  imageUrl: string | null;
  stockOnHand: number;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  category: { name: string };
  images: Array<{ id: string; url: string }>;
} | null;

type CategoryResult = Array<{ id: string; name: string }>;

const prismaSpareParts = prisma as unknown as {
  sparePart: {
    findUnique: (args: unknown) => Promise<SparePartResult>;
  };
  sparePartCategory: {
    findMany: (args: unknown) => Promise<CategoryResult>;
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

export default async function AdminSparePartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return null;
  }

  const { id } = await params;

  const categories = await prismaSpareParts.sparePartCategory.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  const part = await prismaSpareParts.sparePart.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });

  if (!part) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
        Urun bulunamadi.
      </div>
    );
  }

  const previewUrl = part.images[0]?.url || part.imageUrl || '/images/1.jpg';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
        <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-900">
          <Image
            src={previewUrl}
            alt={part.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="p-5">
          <div className="text-lg font-bold text-gray-900 dark:text-white">{part.name}</div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Kategori: {part.category.name}</div>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">Fiyat: {formatPriceTry(part.priceCents)}</div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Stok: {part.stockOnHand}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
        <div className="text-lg font-bold text-gray-900 dark:text-white">Yonetim</div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Buradan gorselleri guncelleyebilir ve urun alanlarini duzenleyebilirsin.
        </div>

        <AdminImageUpload sparePartId={part.id} images={part.images} />
      </div>

      <div className="lg:col-span-2">
        <AdminSparePartEditForm
          initial={{
            id: part.id,
            name: part.name,
            description: part.description,
            dimensions: part.dimensions,
            priceCents: part.priceCents,
            stockOnHand: part.stockOnHand,
            isFeatured: part.isFeatured,
            isActive: part.isActive,
            categoryId: part.categoryId,
          }}
          categories={categories}
        />
      </div>
    </div>
  );
}
