import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import ClearInquiriesButton from '@/components/admin/ClearInquiriesButton';
import InquiryReplyBox from '@/components/admin/InquiryReplyBox';

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
      status: { not: 'CLOSED' },
    },
    orderBy: [{ createdAt: 'desc' }],
    take: 200,
  });

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">Fiyat Teklifleri</div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Toplam: {items.length}</div>
          </div>
          <ClearInquiriesButton type="QUOTE" />
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {items.map((x) => (
          <div key={x.id} className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{x.name}</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {x.company ? `${x.company} - ` : ''}
                  {x.email}
                  {x.phone ? ` - ${x.phone}` : ''}
                </div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {x.product ? `Urun: ${x.product}` : x.subject || ''}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {new Date(x.createdAt).toLocaleString('tr-TR')}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
              {x.message}
            </div>

            <InquiryReplyBox inquiryId={x.id} existingResponse={x.adminResponse} canReply={Boolean(x.userId)} />
          </div>
        ))}

        {items.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-600 dark:text-gray-300">Henuz teklif talebi yok.</div>
        )}
      </div>
    </div>
  );
}
