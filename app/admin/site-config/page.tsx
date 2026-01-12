import { prisma } from '@/lib/prisma';
import { normalizeHomePanelConfig } from '@/lib/homePanelDefaults';
import HomePanelsForm from '@/components/admin/HomePanelsForm';

export const dynamic = 'force-dynamic';

export default async function SiteConfigPage() {
  const config = await prisma.homePanelConfig.findUnique({
    where: { id: 'home' },
  });

  const initialConfig = normalizeHomePanelConfig(config ?? {});

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.3em] text-teal-600">Site ayarlari</div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Anasayfa premium paneller</h1>
        <p className="mt-2 text-sm text-slate-600">
          Canli kapasite, fiyat alarmi ve kurumsal satin alma bolumlerini buradan guncelleyebilirsin.
        </p>
      </div>

      <HomePanelsForm initialConfig={initialConfig} />
    </div>
  );
}
