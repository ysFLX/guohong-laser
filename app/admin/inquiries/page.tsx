import { prisma } from '@/lib/prisma';

import ClearInquiriesButton from '@/components/admin/ClearInquiriesButton';
import InquiryReplyBox from '@/components/admin/InquiryReplyBox';
import InquiryStatusActions from '@/components/admin/InquiryStatusActions';
import { AdminBadge } from '@/components/admin/AdminUi';

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

const statusMeta = (status: string) => {
  if (status === 'READ') {
    return {
      label: 'Okundu',
      accent: 'border-l-indigo-400',
      badge: 'text-indigo-700 bg-indigo-500/10 ring-1 ring-indigo-500/30',
    };
  }
  if (status === 'CLOSED') {
    return {
      label: 'Incele',
      accent: 'border-l-rose-400',
      badge: 'text-rose-700 bg-rose-500/10 ring-1 ring-rose-500/30',
    };
  }
  return {
    label: 'Yeni',
    accent: 'border-l-amber-400',
    badge: 'text-amber-700 bg-amber-500/10 ring-1 ring-amber-500/30',
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

function SectionHeader({ title, count, type }: { title: string; count: number; type: 'CONTACT' | 'QUOTE' }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Talepler</div>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">Toplam kayit: {count}</p>
        </div>
        <ClearInquiriesButton type={type} />
      </div>
    </div>
  );
}

export default async function AdminInquiriesPage() {
  const retentionCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

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

  const contacts = items.filter(
    (item) => item.type === 'CONTACT' && item.status !== 'CLOSED' && !isLiveSupportInquiry(item.subject ?? null),
  );
  const quotes = items.filter((item) => item.type === 'QUOTE' && item.status !== 'CLOSED');

  const renderCards = (list: InquiryRow, typeLabel: 'CONTACT' | 'QUOTE') => (
    <div className="space-y-4">
      {list.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {list.map((x, index) => {
            const meta = statusMeta(x.status);
            const cardId = `${typeLabel.toLowerCase()}-${x.id}`;
            const rowTone = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';
            const rowBorder = index === 0 ? 'border-t-0' : 'border-t';
            return (
              <div
                key={x.id}
                id={cardId}
                className={`${rowBorder} border-slate-200 ${rowTone} ${meta.accent} border-l-4`}
              >
                <div className="px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {typeLabel === 'QUOTE' ? 'Teklif' : 'Iletisim'}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-900">#{x.id.slice(0, 8)}</div>
                      <div className="mt-1 text-xs text-slate-500">{new Date(x.createdAt).toLocaleString('tr-TR')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${meta.badge}`}>
                        {meta.label}
                      </span>
                      <InquiryStatusActions inquiryId={x.id} status={x.status as 'NEW' | 'READ' | 'CLOSED'} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Musteri</div>
                      <div className="mt-2 text-sm font-semibold text-slate-900">{x.name}</div>
                      {x.company && <div className="mt-1 text-xs text-slate-500">{x.company}</div>}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Iletisim</div>
                      <div className="mt-2 text-xs text-slate-700">{x.email}</div>
                      {x.phone && <div className="mt-1 text-xs text-slate-500">{x.phone}</div>}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Konu</div>
                      <div className="mt-2 text-xs text-slate-700">
                        {typeLabel === 'QUOTE'
                          ? x.product
                            ? `Urun: ${x.product}`
                            : x.subject || '-'
                          : x.subject || '-'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Mesaj</div>
                    <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">{x.message}</div>
                  </div>

                  <div className="mt-4">
                    <InquiryReplyBox inquiryId={x.id} existingResponse={x.adminResponse} canReply={Boolean(x.email)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          Kayit yok.
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10">
      <section id="contact">
        <SectionHeader title="Iletisim Mesajlari" count={contacts.length} type="CONTACT" />
        <div className="mt-6 space-y-6">{renderCards(contacts, 'CONTACT')}</div>
      </section>

      <section id="quotes">
        <SectionHeader title="Teklif Talepleri" count={quotes.length} type="QUOTE" />
        <div className="mt-6 space-y-6">{renderCards(quotes, 'QUOTE')}</div>
      </section>

      <div className="sticky bottom-4 z-30">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <AdminBadge tone="slate">{contacts.length + quotes.length} kayit</AdminBadge>
            <span>Iletisim: {contacts.length} / Teklif: {quotes.length}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/admin/inquiries"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 hover:border-slate-300"
            >
              Yenile
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              En ust
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


