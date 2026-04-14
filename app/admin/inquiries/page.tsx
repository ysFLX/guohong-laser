import { prisma } from '@/lib/prisma';

import ClearInquiriesButton from '@/components/admin/ClearInquiriesButton';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import InquiriesAdminManager, { type AdminInquiryItem } from '@/components/admin/InquiriesAdminManager';
import { getLatestInquiryAdminResponse } from '@/lib/inquiryAdminResponses';

export const dynamic = 'force-dynamic';

type InquiryRow = Array<{
  id: string;
  type: 'CONTACT' | 'QUOTE';
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

const isLiveSupportInquiry = (subject: string | null) => {
  const normalizedSubject = (subject ?? '')
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i')
    .trim();
  return (
    normalizedSubject.includes('canli destek') ||
    normalizedSubject.includes('live support') ||
    normalizedSubject.includes('canli-destek')
  );
};

const normalizeStatus = (value: string): AdminInquiryItem['status'] => {
  if (value === 'READ') return 'READ';
  if (value === 'CLOSED') return 'CLOSED';
  return 'NEW';
};

export default async function AdminInquiriesPage() {
  const retentionCutoff = new Date();
  retentionCutoff.setDate(retentionCutoff.getDate() - 1);

  try {
    await prismaInquiry.inquiry.deleteMany({
      where: {
        respondedAt: { lt: retentionCutoff },
        adminResponse: { not: null },
      },
    });
  } catch (error) {
    console.error('Inquiry cleanup failed:', error);
  }

  const items = await prismaInquiry.inquiry.findMany({
    where: {
      NOT: [
        { subject: { contains: 'canli destek', mode: 'insensitive' } },
        { subject: { contains: 'canlı destek', mode: 'insensitive' } },
        { subject: { contains: 'live support', mode: 'insensitive' } },
        { subject: { contains: 'canli-destek', mode: 'insensitive' } },
      ],
    },
    orderBy: [{ createdAt: 'desc' }],
    take: 400,
  });

  const openItems = items.filter((item) => item.status !== 'CLOSED' && !isLiveSupportInquiry(item.subject ?? null));
  const initialItems = openItems.map(
    (item): AdminInquiryItem => ({
      id: item.id,
      type: item.type,
      name: item.name,
      email: item.email,
      phone: item.phone,
      company: item.company,
      subject: item.subject,
      product: item.product,
      message: item.message,
      status: normalizeStatus(item.status),
      adminResponse: getLatestInquiryAdminResponse(item.adminResponse),
      createdAt: item.createdAt.toISOString(),
      userId: item.userId,
    }),
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Talepler"
        title="İletişim & teklif mesajları"
        description="Teklif ve iletişim taleplerini iki panelde ara, filtrele ve yanıtla."
        actions={
          <>
            <ClearInquiriesButton type="QUOTE" label="Teklifleri temizle" />
            <ClearInquiriesButton type="CONTACT" label="İletişimi temizle" />
          </>
        }
      />

      <InquiriesAdminManager items={initialItems} />
    </div>
  );
}
