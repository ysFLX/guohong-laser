import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import ClearInquiriesButton from '@/components/admin/ClearInquiriesButton';
import InquiryReplyBox from '@/components/admin/InquiryReplyBox';
import InquiryStatusActions from '@/components/admin/InquiryStatusActions';
import { AdminBadge } from '@/components/admin/AdminUi';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

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
      label: 'Silindi',
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

export default async function AdminQuoteInquiriesPage() {
  const retentionCutoff = new Date();
  retentionCutoff.setDate(retentionCutoff.getDate() - 1);

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

  return (
    <div className="space-y-6" id="top">
      <AdminPageHeader
        eyebrow="Teklif merkezi"
        title="Fiyat teklifleri"
        description={`Toplam kayıt: ${items.length}`}
        actions={<ClearInquiriesButton type="QUOTE" />}
      />

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 text-center text-sm text-[var(--admin-muted)] shadow-sm">
          Henüz teklif talebi yok.
        </div>
      )}

      <div className="space-y-4">
        {items.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400 lg:grid lg:grid-cols-[1.1fr_1fr_1.2fr_1.4fr_0.8fr_0.8fr]">
              <div>Kayıt</div>
              <div>Müşteri</div>
              <div>İletişim</div>
              <div>Konu</div>
              <div>Tarih</div>
              <div>Durum</div>
            </div>
            {items.map((x, index) => {
              const meta = statusMeta(x.status);
              const rowTone = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';
              const rowBorder = index === 0 ? 'border-t-0' : 'border-t';
              return (
              <div
                key={x.id}
                id={x.id}
                className={`${rowBorder} border-slate-200 ${rowTone} ${meta.accent} border-l-4`}
              >
              <div className="grid gap-4 border-b border-slate-100 px-6 py-4 text-sm lg:grid-cols-[1.1fr_1fr_1.2fr_1.4fr_0.8fr_0.8fr]">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 lg:hidden">Kayıt</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Teklif</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">#{x.id.slice(0, 8)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 lg:hidden">Müşteri</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{x.name}</div>
                  {x.company && <div className="mt-1 text-xs text-slate-500">{x.company}</div>}
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 lg:hidden">İletişim</div>
                  <div className="mt-2 text-xs text-slate-600">{x.email}</div>
                  {x.phone && <div className="mt-1 text-xs text-slate-500">{x.phone}</div>}
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 lg:hidden">Konu</div>
                  <div className="mt-2 text-xs text-slate-600">
                    {x.product ? `Ürün: ${x.product}` : x.subject || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 lg:hidden">Tarih</div>
                  <div className="mt-2 text-xs text-slate-500">{new Date(x.createdAt).toLocaleString('tr-TR')}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 lg:hidden">Durum</div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${meta.badge}`}>
                      {meta.label}
                    </span>
                    <InquiryStatusActions inquiryId={x.id} status={x.status as 'NEW' | 'READ' | 'CLOSED'} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/60 px-6 py-4">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Mesaj</div>
                <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                  {x.message}
                </div>
              </div>

              <div className="px-6 py-4">
                <InquiryReplyBox inquiryId={x.id} existingResponse={x.adminResponse} canReply={Boolean(x.email)} />
              </div>
            </div>
          );
        })}
          </div>
        )}
      </div>

      <div className="sticky bottom-4 z-30">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <AdminBadge tone="slate">{items.length} teklif</AdminBadge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/admin/inquiries/quotes"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 hover:border-slate-300"
            >
              Yenile
            </a>
            <a
              href="#top"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              En üst
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

