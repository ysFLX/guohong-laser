import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { AdminBadge } from '@/components/admin/AdminUi';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import SparePartVisibilityToggle from '@/components/spare-parts/SparePartVisibilityToggle';

type SparePartsResult = Array<{
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  stockOnHand: number;
  isFeatured: boolean;
  isActive: boolean;
  category: { name: string };
}>;

type PrismaClientLike = {
  sparePart: {
    count: (args?: unknown) => Promise<number>;
    findMany: (args: unknown) => Promise<SparePartsResult>;
  };
  sparePartCategory: {
    findMany: (args: unknown) => Promise<Array<{ id: string; name: string }>>;
  };
};

const prismaSpareParts = prisma as unknown as PrismaClientLike;

const PAGE_SIZE = 20;
const CRITICAL_STOCK_LEVEL = 5;

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

function getPageNumber(searchParams: { page?: string }) {
  const raw = Number(searchParams.page || '1');
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.floor(raw);
}

export default async function AdminSparePartsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string; status?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const inputClassName =
    'mt-2 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-3 text-sm text-[var(--admin-text)] shadow-sm placeholder:text-[var(--admin-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-bg)]';
  const page = getPageNumber(resolvedSearchParams);
  const skip = (page - 1) * PAGE_SIZE;
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q.trim() : '';
  const categoryId = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category.trim() : '';
  const status = typeof resolvedSearchParams.status === 'string' ? resolvedSearchParams.status : 'all';

  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (status === 'active') {
    where.isActive = true;
  }
  if (status === 'inactive') {
    where.isActive = false;
  }

  const [total, items, categories] = await Promise.all([
    prismaSpareParts.sparePart.count({ where }),
    prismaSpareParts.sparePart.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
      include: { category: true },
      take: PAGE_SIZE,
      skip,
    }),
    prismaSpareParts.sparePartCategory.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;
  const criticalCount = items.filter((item) => item.stockOnHand > 0 && item.stockOnHand <= CRITICAL_STOCK_LEVEL)
    .length;
  const activeCount = items.filter((item) => item.isActive).length;
  const featuredCount = items.filter((item) => item.isFeatured).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ürün merkezi"
        title="Yedek parçalar"
        description="Stok, vitrin ve kategori takibini tek ekrandan yönet."
        actions={
          <>
            <Link
              href="/admin/spare-parts/new"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-xs font-semibold text-[var(--admin-accent-contrast)] shadow-sm hover:opacity-95"
            >
              Yeni ürün
            </Link>
            <Link
              href="/admin/spare-parts/categories"
              className="inline-flex items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-xs font-semibold text-[var(--admin-text)] shadow-sm hover:bg-[var(--admin-card-muted)]"
            >
              Kategoriler
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-4 shadow-sm">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-muted)]">Toplam ürün</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{total}</div>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-4 shadow-sm">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-muted)]">Aktif ürün</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{activeCount}</div>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-4 shadow-sm">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-muted)]">Vitrin</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{featuredCount}</div>
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-4 shadow-sm">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-muted)]">Kritik stok</div>
          <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{criticalCount}</div>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
        <form className="grid grid-cols-1 gap-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end">
          <div>
            <label className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-muted)]">Arama</label>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Ürün adı veya açıklama ara"
              className={inputClassName}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-muted)]">Kategori</label>
            <select
              name="category"
              defaultValue={categoryId}
              className={inputClassName}
            >
              <option value="">Tüm kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-muted)]">Durum</label>
            <select
              name="status"
              defaultValue={status}
              className={inputClassName}
            >
              <option value="all">Tüm durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-xl bg-[var(--admin-accent)] px-4 py-2 text-xs font-semibold text-[var(--admin-accent-contrast)] shadow-sm hover:opacity-95"
            >
              Filtrele
            </button>
            <Link
              href="/admin/spare-parts"
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-xs font-semibold text-[var(--admin-text)] shadow-sm hover:bg-[var(--admin-card-muted)]"
            >
              Sıfırla
            </Link>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {items.map((p) => {
          const isCritical = p.stockOnHand > 0 && p.stockOnHand <= CRITICAL_STOCK_LEVEL;
          const accent =
            isCritical
              ? 'border-l-amber-400'
              : p.isFeatured
                ? 'border-l-indigo-400'
                : 'border-l-[var(--admin-border)]';
          return (
            <div
              key={p.id}
              className={`rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm ${accent} border-l-4`}
            >
              <div className="grid gap-4 border-b border-[var(--admin-border)] px-6 py-4 md:grid-cols-[1.4fr_1fr_0.9fr_0.7fr_0.7fr]">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Ürün</div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--admin-text)]">
                    {p.name}
                    {p.isFeatured && (
                      <AdminBadge tone="indigo">Vitrin</AdminBadge>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Kategori</div>
                  <div className="mt-2 text-sm text-[var(--admin-muted)]">{p.category.name}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Fiyat</div>
                  <div className="mt-2 text-sm font-semibold text-[var(--admin-text)]">{formatPrice(p.priceCents, p.currency || 'TRY')}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Stok</div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--admin-text)]">
                    {p.stockOnHand}
                    {isCritical && <AdminBadge tone="amber">Kritik</AdminBadge>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Durum</div>
                  <div className="mt-2">
                    {p.isActive ? (
                      <AdminBadge tone="emerald">Aktif</AdminBadge>
                    ) : (
                      <AdminBadge tone="slate">Pasif</AdminBadge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-xs text-[var(--admin-muted)]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--admin-muted)]">İşlem</span>
                  <Link href={`/admin/spare-parts/${p.id}`} className="text-sm font-semibold text-[var(--admin-accent)] hover:opacity-90">
                    Düzenle
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  {!p.isActive && <AdminBadge tone="slate">Gizli ürün</AdminBadge>}
                  <SparePartVisibilityToggle sparePartId={p.id} isActive={p.isActive} compact />
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 text-sm text-[var(--admin-muted)] shadow-sm">
            Henüz ürün yok.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-6 py-4 text-sm text-[var(--admin-muted)] shadow-sm">
        <div>
          Sayfa {page} / {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={prevPage ? `/admin/spare-parts?page=${prevPage}&q=${encodeURIComponent(query)}&category=${encodeURIComponent(categoryId)}&status=${encodeURIComponent(status)}` : '#'}
            aria-disabled={!prevPage}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              prevPage
                ? 'border border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--admin-text)] hover:bg-[var(--admin-card-muted)]'
                : 'cursor-not-allowed border border-[var(--admin-border)]/50 bg-[var(--admin-card)]/60 text-[var(--admin-muted)]'
            }`}
          >
            Önceki
          </Link>
          <Link
            href={nextPage ? `/admin/spare-parts?page=${nextPage}&q=${encodeURIComponent(query)}&category=${encodeURIComponent(categoryId)}&status=${encodeURIComponent(status)}` : '#'}
            aria-disabled={!nextPage}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              nextPage
                ? 'border border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--admin-text)] hover:bg-[var(--admin-card-muted)]'
                : 'cursor-not-allowed border border-[var(--admin-border)]/50 bg-[var(--admin-card)]/60 text-[var(--admin-muted)]'
            }`}
          >
            Sonraki
          </Link>
        </div>
      </div>
    </div>
  );
}
