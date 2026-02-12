import { getServerSession } from 'next-auth';
import Image from 'next/image';

import { authOptions } from '@/auth';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminSparePartEditForm from '@/components/spare-parts/AdminSparePartEditForm';
import AdminImageUpload from '@/components/spare-parts/AdminImageUpload';
import { prisma } from '@/lib/prisma';
import { AdminBadge } from '@/components/admin/AdminUi';

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
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 text-sm text-[var(--admin-muted)] shadow-sm">
        Ürün bulunamadı.
      </div>
    );
  }

  const previewUrl = part.images[0]?.url || part.imageUrl || '/images/1.jpg';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ürün düzenle"
        title={part.name}
        description={`Kategori: ${part.category.name}`}
        actions={part.isFeatured ? <AdminBadge tone="slate">Vitrin</AdminBadge> : null}
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
              <div className="mt-2 text-lg font-semibold text-[var(--admin-text)]">{formatPriceTry(part.priceCents)}</div>
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
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
          <div className="text-sm font-semibold text-[var(--admin-text)]">Görseller</div>
          <p className="mt-2 text-sm text-[var(--admin-muted)]">
            Ürün galerisi ve vitrin görselini buradan güncelleyebilirsin.
          </p>
          <div className="mt-4">
            <AdminImageUpload sparePartId={part.id} images={part.images} />
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
