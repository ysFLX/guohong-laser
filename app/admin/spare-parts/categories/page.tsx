import { prisma } from '@/lib/prisma';

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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
        <div className="text-lg font-bold text-gray-900 dark:text-white">Kategoriler</div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Yeni kategori ekleyin veya mevcut kategorileri kontrol edin.
        </div>

        <AdminSparePartCategoryForm />
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">Kategori Listesi</div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Toplam: {categories.length}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/30">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Kategori</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Slug</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Urun Sayisi</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Durum</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{c.name}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{c.slug}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{c._count.spareParts}</td>
                  <td className="px-4 py-3">
                    {c.isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                        Pasif
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-600 dark:text-gray-300">
                    Henuz kategori yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
