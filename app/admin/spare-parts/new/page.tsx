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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
      <div className="text-lg font-bold text-gray-900 dark:text-white">Yeni Yedek Parca</div>
      <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Yeni urun bilgilerini girip kaydedin. Kayit sonrasi gorsel ekleyebilirsiniz.
      </div>

      <AdminSparePartCreateForm categories={categories} />
    </div>
  );
}
