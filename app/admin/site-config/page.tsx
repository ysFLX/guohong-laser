import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { normalizeHomePanelConfig } from '@/lib/homePanelDefaults';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import HomePanelsForm from '@/components/admin/HomePanelsForm';

export const dynamic = 'force-dynamic';

export default async function SiteConfigPage() {
  const config = await prisma.homePanelConfig.findUnique({
    where: { id: 'home' },
  });

  const initialConfig = normalizeHomePanelConfig(config ?? {});

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Site ayarları"
        title="Anasayfa panelleri"
        description="Canlı kapasite, fiyat alarmı ve kurumsal satın alma bloklarını buradan güncelleyebilirsin."
        actions={
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-xs font-semibold text-[var(--admin-text)] shadow-sm hover:bg-[var(--admin-card-muted)]"
          >
            Anasayfayı önizle
          </Link>
        }
      />

      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
        <HomePanelsForm initialConfig={initialConfig} />
      </div>
    </div>
  );
}

