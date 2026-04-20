import { prisma } from '@/lib/prisma';
import { getUsdTryExchangeRate } from '@/lib/exchangeRates';

import AdminPageHeader from '@/components/admin/AdminPageHeader';
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
  const usdTryExchangeRate = await getUsdTryExchangeRate();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Ürün oluştur"
        title="Yeni yedek parça"
        description="Ürün bilgilerini gir, kaydettikten sonra görsel ve ek detayları tamamla."
      />

      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
        <AdminSparePartCreateForm categories={categories} usdTryRate={usdTryExchangeRate.rate} />
      </div>
    </div>
  );
}

