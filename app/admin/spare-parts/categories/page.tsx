import { prisma } from '@/lib/prisma';
import { AdminBadge } from '@/components/admin/AdminUi';

import AdminPageHeader from '@/components/admin/AdminPageHeader';
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
      <AdminPageHeader
        eyebrow="Kategori merkezi"
        title="Kategoriler"
        description="Kategori ekle ve mevcut kategorileri yönet."
      />

      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
        <div className="text-sm font-semibold text-[var(--admin-text)]">Yeni kategori</div>
        <div className="mt-3">
          <AdminSparePartCategoryForm />
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-6 py-4 shadow-sm"
          >
            <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr]">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Kategori</div>
                <div className="mt-2 text-sm font-semibold text-[var(--admin-text)]">{c.name}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Slug</div>
                <div className="mt-2 text-sm text-[var(--admin-muted)]">{c.slug}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Ürün sayısı</div>
                <div className="mt-2 text-sm font-semibold text-[var(--admin-text)]">{c._count.spareParts}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--admin-muted)]">Durum</div>
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
          <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 text-center text-sm text-[var(--admin-muted)] shadow-sm">
            Henüz kategori yok.
          </div>
        )}
      </div>
    </div>
  );
}
