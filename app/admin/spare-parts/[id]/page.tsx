import { getServerSession } from 'next-auth';
import Image from 'next/image';

import { authOptions } from '@/auth';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminSparePartEditForm from '@/components/spare-parts/AdminSparePartEditForm';
import AdminImageUpload from '@/components/spare-parts/AdminImageUpload';
import { prisma } from '@/lib/prisma';
import { getUsdTryExchangeRate } from '@/lib/exchangeRates';
import { AdminBadge } from '@/components/admin/AdminUi';
import { buildSparePartSizeOptionEntries } from '@/lib/sparePartSizeOptions';
import SparePartVisibilityToggle from '@/components/spare-parts/SparePartVisibilityToggle';

type SparePartResult = {
  id: string;
  name: string;
  description: string;
  dimensions: string | null;
  hasSizeOptions: boolean;
  sizeOptions: string[];
  sizeOptionPrices: Record<string, unknown>;
  sizeOptionImages: Record<string, unknown>;
  priceCents: number;
  currency: string;
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

function formatPrice(priceCents: number, currency: string) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} ${currency}`;
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
  const usdTryExchangeRate = await getUsdTryExchangeRate();

  const part = await prismaSpareParts.sparePart.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });

  if (!part) {
    return (
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 text-sm text-[var(--admin-muted)] shadow-sm">
        Ürün bulunamadı.
      </div>
    );
  }

  const previewUrl = part.images[0]?.url || part.imageUrl || '/images/1.jpg';
  const sizeOptionEntries = buildSparePartSizeOptionEntries(
    part.sizeOptions,
    part.sizeOptionPrices,
    part.sizeOptionImages,
    part.priceCents,
    part.currency,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ürün düzenle"
        title={part.name}
        description={`Kategori: ${part.category.name}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {part.isFeatured ? <AdminBadge tone="slate">Vitrin</AdminBadge> : null}
            <AdminBadge tone={part.isActive ? 'emerald' : 'slate'}>{part.isActive ? 'Görünür' : 'Gizli'}</AdminBadge>
            <SparePartVisibilityToggle sparePartId={part.id} isActive={part.isActive} compact />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[var(--admin-shadow)]">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-3xl bg-[var(--admin-surface-muted)]">
            <Image
              src={previewUrl}
              alt={part.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Fiyat</div>
              <div className="mt-2 text-lg font-semibold text-[var(--admin-text)]">{formatPrice(part.priceCents, part.currency || 'TRY')}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Stok</div>
              <div className="mt-2 text-lg font-semibold text-[var(--admin-text)]">{part.stockOnHand}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Durum</div>
              <div className="mt-2">
                {part.isActive ? (
                  <AdminBadge tone="emerald">Aktif</AdminBadge>
                ) : (
                  <AdminBadge tone="slate">Pasif</AdminBadge>
                )}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Boyut</div>
              <div className="mt-2 text-sm text-[var(--admin-muted)]">{part.dimensions || '-'}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Olcu secenekleri</div>
              <div className="mt-2 text-sm text-[var(--admin-muted)]">
                {part.hasSizeOptions && sizeOptionEntries.length > 0
                  ? sizeOptionEntries
                      .map((entry) => `${entry.value} (${formatPrice(entry.priceCents, entry.priceCurrency || part.currency || 'TRY')})`)
                      .join(', ')
                  : '-'}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
          <div className="text-sm font-semibold text-[var(--admin-text)]">Görseller</div>
          <p className="mt-2 text-sm text-[var(--admin-muted)]">
            Ürün galerisi ve vitrin görselini buradan güncelleyebilirsin.
          </p>
          <div className="mt-4">
            <AdminImageUpload sparePartId={part.id} images={part.images} sizeOptionEntries={sizeOptionEntries} />
          </div>
        </div>
      </div>

        <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
          <AdminSparePartEditForm
            initial={{
            id: part.id,
            name: part.name,
            description: part.description,
            dimensions: part.dimensions,
            hasSizeOptions: part.hasSizeOptions,
            sizeOptions: part.sizeOptions,
            sizeOptionPrices: part.sizeOptionPrices,
            sizeOptionImages: part.sizeOptionImages,
            priceCents: part.priceCents,
            currency: part.currency,
            stockOnHand: part.stockOnHand,
            isFeatured: part.isFeatured,
            isActive: part.isActive,
            categoryId: part.categoryId,
          }}
          categories={categories}
          usdTryRate={usdTryExchangeRate.rate}
          />
        </div>
      </div>
  );
}
