import { prisma } from '@/lib/prisma';

import AdminSparePartCreateForm from '@/components/spare-parts/AdminSparePartCreateForm';

type CategoryResult = Array<{ id: string; name: string }>;

const prismaCategories = prisma as unknown as {
  sparePartCategory: {
    findMany: (args: unknown) => Promise<CategoryResult>;
  };
};

export default async function AdminSparePartNewPage() {
  const categories = await prismaCategories.sparePartCategory.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Urun olustur</div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Yeni yedek parca</h1>
        <p className="mt-2 text-sm text-slate-500">
          Urun bilgilerini gir, kaydettikten sonra gorsel ve ek detaylari tamamla.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <AdminSparePartCreateForm categories={categories} />
      </div>
    </div>
  );
}
