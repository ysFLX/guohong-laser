import Link from 'next/link';

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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Site ayarları</div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Anasayfa panelleri</h1>
            <p className="mt-2 text-sm text-slate-500">
              Canlı kapasite, fiyat alarmı ve kurumsal satın alma bloklarını buradan güncelleyebilirsin.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
          >
            Anasayfayı önizle
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <HomePanelsForm initialConfig={initialConfig} />
      </div>
    </div>
  );
}
