import { prisma } from '@/lib/prisma';
import { AdminBadge } from '@/components/admin/AdminUi';

import AdminSparePartCategoryForm from '@/components/spare-parts/AdminSparePartCategoryForm';

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count: { spareParts: number };
};

const prismaCategories = prisma as unknown as {
  sparePartCategory: {
    findMany: (args: unknown) => Promise<Category[]>;
  };
};

export default async function AdminSparePartCategoriesPage() {
  const categories = await prismaCategories.sparePartCategory.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { spareParts: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Kategori merkezi</div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Kategoriler</h1>
        <p className="mt-2 text-sm text-slate-500">Kategori ekle ve mevcut kategorileri yonet.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold text-slate-900">Yeni kategori</div>
        <div className="mt-3">
          <AdminSparePartCategoryForm />
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr]">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Kategori</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{c.name}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Slug</div>
                <div className="mt-2 text-sm text-slate-600">{c.slug}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Urun sayisi</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">{c._count.spareParts}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Durum</div>
                <div className="mt-2">
                  {c.isActive ? (
                    <AdminBadge tone="emerald">Aktif</AdminBadge>
                  ) : (
                    <AdminBadge tone="slate">Pasif</AdminBadge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
            Henuz kategori yok.
          </div>
        )}
      </div>
    </div>
  );
}


