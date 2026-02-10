import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { AdminBadge } from '@/components/admin/AdminUi';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

type SparePartsResult = Array<{
  id: string;
  name: string;
  priceCents: number;
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

function getPageNumber(searchParams: { page?: string }) {
  const raw = Number(searchParams.page || '1');
  if (!Number.isFinite(raw) || raw < 1) return 1;
  return Math.floor(raw);
}

export default async function AdminSparePartsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string; category?: string; status?: string };
}) {
  const page = getPageNumber(searchParams);
  const skip = (page - 1) * PAGE_SIZE;
  const query = typeof searchParams.q === 'string' ? searchParams.q.trim() : '';
  const categoryId = typeof searchParams.category === 'string' ? searchParams.category.trim() : '';
  const status = typeof searchParams.status === 'string' ? searchParams.status : 'all';

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
            <div className="mt-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Ürün adı veya açıklama ara"
                className="w-full bg-transparent text-sm text-[var(--admin-text)] placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold tracking-[0.22em] text-[var(--admin-muted)]">Kategori</label>
            <select
              name="category"
              defaultValue={categoryId}
              className="form-input mt-2 text-sm text-slate-700"
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
              className="form-input mt-2 text-sm text-slate-700"
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
                : 'border-l-slate-200';
          return (
            <div
              key={p.id}
              className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${accent} border-l-4`}
            >
              <div className="grid gap-4 border-b border-slate-100 px-6 py-4 md:grid-cols-[1.4fr_1fr_0.9fr_0.7fr_0.7fr]">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Ürün</div>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {p.name}
                    {p.isFeatured && (
                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                        Vitrin
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Kategori</div>
                  <div className="mt-2 text-sm text-slate-700">{p.category.name}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Fiyat</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{formatPriceTry(p.priceCents)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Stok</div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                    {p.stockOnHand}
                    {isCritical && <AdminBadge tone="amber">Kritik</AdminBadge>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Durum</div>
                  <div className="mt-2">
                    {p.isActive ? (
                      <AdminBadge tone="emerald">Aktif</AdminBadge>
                    ) : (
                      <AdminBadge tone="slate">Pasif</AdminBadge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">İşlem</span>
                  <Link href={`/admin/spare-parts/${p.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    Düzenle
                  </Link>
                </div>
                {!p.isActive && <AdminBadge tone="slate">Pasif ürün</AdminBadge>}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-600">
            Henüz ürün yok.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-600">
        <div>
          Sayfa {page} / {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={prevPage ? `/admin/spare-parts?page=${prevPage}&q=${encodeURIComponent(query)}&category=${encodeURIComponent(categoryId)}&status=${encodeURIComponent(status)}` : '#'}
            aria-disabled={!prevPage}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              prevPage ? 'border border-slate-200 text-slate-700 hover:border-slate-300' : 'border border-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Önceki
          </Link>
          <Link
            href={nextPage ? `/admin/spare-parts?page=${nextPage}&q=${encodeURIComponent(query)}&category=${encodeURIComponent(categoryId)}&status=${encodeURIComponent(status)}` : '#'}
            aria-disabled={!nextPage}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              nextPage ? 'border border-slate-200 text-slate-700 hover:border-slate-300' : 'border border-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Sonraki
          </Link>
        </div>
      </div>
    </div>
  );
}

