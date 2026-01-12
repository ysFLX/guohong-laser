import Link from 'next/link';

import { prisma } from '@/lib/prisma';

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

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <div className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">Yedek Parcalar</div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Toplam: {total}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/spare-parts/new"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
          >
            Yeni Urun
          </Link>
          <Link
            href="/admin/spare-parts/categories"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Kategoriler
          </Link>
        </div>
      </div>

      <div className="px-5 pb-5">
        <form className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="form-label block">Arama</label>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Urun adi veya aciklama ara"
              className="form-input mt-1 text-sm"
            />
          </div>
          <div>
            <label className="form-label block">Kategori</label>
            <select
              name="category"
              defaultValue={categoryId}
              className="form-input mt-1 text-sm"
            >
              <option value="">Tum kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label block">Durum</label>
            <select
              name="status"
              defaultValue={status}
              className="form-input mt-1 text-sm"
            >
              <option value="all">Tum durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
          <div className="md:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              className="btn-primary"
            >
              Filtrele
            </button>
            <Link
              href="/admin/spare-parts"
              className="btn-secondary"
            >
              Sifirla
            </Link>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/30">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Urun</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Kategori</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Fiyat</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Stok</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Durum</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Islem</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {p.name}{' '}
                    {p.isFeatured && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white">
                        Vitrin
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{p.category.name}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{formatPriceTry(p.priceCents)}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{p.stockOnHand}</td>
                <td className="px-4 py-3">
                  {p.isActive ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                      Pasif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/spare-parts/${p.id}`}
                    className="text-sm font-semibold text-emerald-600 hover:underline"
                  >
                    Duzenle
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-300">
                  Henuz urun yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Sayfa {page} / {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={prevPage ? `/admin/spare-parts?page=${prevPage}&q=${encodeURIComponent(query)}&category=${encodeURIComponent(categoryId)}&status=${encodeURIComponent(status)}` : '#'}
            aria-disabled={!prevPage}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
              prevPage ? 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700' : 'border-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Onceki
          </Link>
          <Link
            href={nextPage ? `/admin/spare-parts?page=${nextPage}&q=${encodeURIComponent(query)}&category=${encodeURIComponent(categoryId)}&status=${encodeURIComponent(status)}` : '#'}
            aria-disabled={!nextPage}
            className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
              nextPage ? 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700' : 'border-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Sonraki
          </Link>
        </div>
      </div>
    </div>
  );
}


