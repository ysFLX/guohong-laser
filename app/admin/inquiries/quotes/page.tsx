import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import ClearInquiriesButton from '@/components/admin/ClearInquiriesButton';
import InquiryReplyBox from '@/components/admin/InquiryReplyBox';
import InquiryStatusActions from '@/components/admin/InquiryStatusActions';

type InquiryRow = Array<{
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  product: string | null;
  message: string;
  status: string;
  adminResponse: string | null;
  createdAt: Date;
  userId: string | null;
}>;

const prismaInquiry = prisma as unknown as {
  inquiry: {
    deleteMany: (args: unknown) => Promise<{ count: number }>;
    findMany: (args: unknown) => Promise<InquiryRow>;
  };
};

export default async function AdminQuoteInquiriesPage() {
  const retentionCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    await prismaInquiry.inquiry.deleteMany({
      where: {
        type: 'QUOTE',
        respondedAt: { lt: retentionCutoff },
        adminResponse: { not: null },
      },
    });
  } catch (error) {
    console.error('Inquiry cleanup failed (QUOTE):', error);
  }

  const items = await prismaInquiry.inquiry.findMany({
    where: {
      type: 'QUOTE',
    },
    orderBy: [{ createdAt: 'desc' }],
    take: 200,
  });

  const statusMeta = (status: string) => {
    if (status === 'READ') {
      return {
        label: 'Okundu',
        card: 'border-emerald-200 bg-emerald-50/60',
        badge: 'text-emerald-700 bg-emerald-100',
      };
    }
    if (status === 'CLOSED') {
      return {
        label: 'Incele',
        card: 'border-rose-200 bg-rose-50/60',
        badge: 'text-rose-700 bg-rose-100',
      };
    }
    return {
      label: 'Yeni',
      card: 'border-amber-200 bg-amber-50/60',
      badge: 'text-amber-700 bg-amber-100',
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">Fiyat Teklifleri</div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Toplam: {items.length}</div>
          </div>
          <ClearInquiriesButton type="QUOTE" />
        </div>
      </div>

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center text-sm text-gray-600 dark:text-gray-300">
          Henuz teklif talebi yok.
        </div>
      )}

      <div className="space-y-4">
        {items.map((x) => {
          const meta = statusMeta(x.status);
          return (
            <div
              key={x.id}
              id={x.id}
              className={`rounded-2xl border ${meta.card} p-5`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Teklif
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{x.name}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">
                    {x.company ? `${x.company} · ` : ''}{x.email}{x.phone ? ` · ${x.phone}` : ''}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {x.product ? `Urun: ${x.product}` : x.subject || ''}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(x.createdAt).toLocaleString('tr-TR')}
                  </div>
                </div>

                <InquiryStatusActions inquiryId={x.id} status={x.status as 'NEW' | 'READ' | 'CLOSED'} />
              </div>

              <div className="mt-4 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                {x.message}
              </div>

              <InquiryReplyBox inquiryId={x.id} existingResponse={x.adminResponse} canReply={Boolean(x.userId)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
