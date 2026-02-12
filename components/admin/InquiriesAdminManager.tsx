'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdminBadge, AdminButton, AdminRadioCard } from '@/components/admin/AdminUi';
import InquiryReplyBox from '@/components/admin/InquiryReplyBox';
import InquiryStatusActions from '@/components/admin/InquiryStatusActions';

type InquiryStatus = 'NEW' | 'READ' | 'CLOSED';
type InquiryType = 'CONTACT' | 'QUOTE';

export type AdminInquiryItem = {
  id: string;
  type: InquiryType;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  product: string | null;
  message: string;
  status: InquiryStatus;
  adminResponse: string | null;
  createdAt: string;
  userId: string | null;
};

type Props = {
  items: AdminInquiryItem[];
};

type StatusFilter = 'ALL' | 'NEW' | 'READ';
type TypeFilter = 'ALL' | InquiryType;

const statusTone = (status: InquiryStatus) => {
  switch (status) {
    case 'READ':
      return 'indigo' as const;
    case 'CLOSED':
      return 'rose' as const;
    default:
      return 'amber' as const;
  }
};

const statusAccent = (status: InquiryStatus) => {
  switch (status) {
    case 'READ':
      return 'border-l-indigo-500';
    case 'CLOSED':
      return 'border-l-rose-500';
    default:
      return 'border-l-amber-500';
  }
};

const typeTone = (type: InquiryType) => (type === 'QUOTE' ? ('indigo' as const) : ('slate' as const));
const typeLabel = (type: InquiryType) => (type === 'QUOTE' ? 'Teklif' : 'İletişim');

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleString('tr-TR');
  } catch {
    return value;
  }
};

function toSearchString(value: string) {
  return value.toLocaleLowerCase('tr-TR').replaceAll('ı', 'i');
}

export default function InquiriesAdminManager({ items }: Props) {
  const [rows, setRows] = useState<AdminInquiryItem[]>(items);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(items.length ? [items[0].id] : []));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

  useEffect(() => {
    const applyHashFilter = () => {
      const hash = window.location.hash;
      if (hash === '#quotes') setTypeFilter('QUOTE');
      if (hash === '#contact') setTypeFilter('CONTACT');
    };
    applyHashFilter();
    window.addEventListener('hashchange', applyHashFilter);
    return () => window.removeEventListener('hashchange', applyHashFilter);
  }, []);

  const stats = useMemo(() => {
    return rows.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.type === 'CONTACT') acc.contact += 1;
        if (item.type === 'QUOTE') acc.quote += 1;
        if (item.status === 'NEW') acc.new += 1;
        if (item.status === 'READ') acc.read += 1;
        return acc;
      },
      { total: 0, contact: 0, quote: 0, new: 0, read: 0 },
    );
  }, [rows]);

  const filtered = useMemo(() => {
    const query = toSearchString(searchQuery.trim());
    return rows.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
      if (!query) return true;
      const searchable = toSearchString(
        [
          item.id,
          item.name,
          item.email,
          item.phone || '',
          item.company || '',
          item.subject || '',
          item.product || '',
          item.message || '',
        ].join(' '),
      );
      return searchable.includes(query);
    });
  }, [rows, searchQuery, statusFilter, typeFilter]);

  const activeFilterLabel = [
    statusFilter === 'ALL' ? 'Tüm durumlar' : statusFilter === 'NEW' ? 'Yeni' : 'Okundu',
    typeFilter === 'ALL' ? 'Tüm tipler' : typeLabel(typeFilter),
  ].join(' • ');

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div id="quotes" />
      <div id="contact" />

      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">Toplam</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{stats.total}</div>
          </div>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">Yeni</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{stats.new}</div>
          </div>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">Okundu</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{stats.read}</div>
          </div>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">İletişim</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{stats.contact}</div>
          </div>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">Teklif</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{stats.quote}</div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">Arama</div>
            <div className="mt-2 flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 shadow-sm">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-[var(--admin-muted)]" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Talep no, müşteri, e-posta, konu veya mesaj ara"
                className="w-full bg-transparent text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-1 text-[11px] font-semibold text-[var(--admin-muted)] transition hover:text-[var(--admin-text)]"
                >
                  Temizle
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">Durum</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { value: 'ALL' as const, label: 'Hepsi' },
                  { value: 'NEW' as const, label: 'Yeni' },
                  { value: 'READ' as const, label: 'Okundu' },
                ].map((item) => (
                  <AdminRadioCard
                    key={item.value}
                    active={statusFilter === item.value}
                    onClick={() => setStatusFilter(item.value)}
                  >
                    {item.label}
                  </AdminRadioCard>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">Tip</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { value: 'ALL' as const, label: 'Tümü' },
                  { value: 'CONTACT' as const, label: 'İletişim' },
                  { value: 'QUOTE' as const, label: 'Teklif' },
                ].map((item) => (
                  <AdminRadioCard
                    key={item.value}
                    active={typeFilter === item.value}
                    onClick={() => {
                      setTypeFilter(item.value);
                      const nextHash = item.value === 'QUOTE' ? '#quotes' : item.value === 'CONTACT' ? '#contact' : '';
                      try {
                        window.history.replaceState(null, '', `${window.location.pathname}${nextHash}`);
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    {item.label}
                  </AdminRadioCard>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-xs text-[var(--admin-muted)] shadow-sm">
          <div className="flex items-center gap-2">
            <AdminBadge tone="slate">{filtered.length} kayıt</AdminBadge>
            <span>Filtre: {activeFilterLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminButton tone="slate" variant="outline" onClick={resetFilters}>
              Sıfırla
            </AdminButton>
            <AdminButton tone="slate" variant="outline" onClick={() => window.location.reload()}>
              Yenile
            </AdminButton>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 text-sm text-[var(--admin-muted)] shadow-sm">
            Henüz talep yok.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 text-sm text-[var(--admin-muted)] shadow-sm">
            Filtreye uygun kayıt yok.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
            <div className="hidden items-center gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)] md:grid md:grid-cols-[1fr_1.2fr_0.8fr_0.8fr_0.9fr]">
              <div>Talep</div>
              <div>Müşteri</div>
              <div>Tip</div>
              <div>Durum</div>
              <div className="text-right">Tarih</div>
            </div>

            {filtered.map((item, index) => {
              const rowTone = index % 2 === 0 ? 'bg-[var(--admin-surface)]' : 'bg-[var(--admin-card-muted)]';
              const rowBorder = index === 0 ? 'border-t-0' : 'border-t';
              const isExpanded = expandedIds.has(item.id);
              const panelId = `inquiry-${item.id}`;

              return (
                <div
                  key={item.id}
                  className={`${rowBorder} border-[var(--admin-border)] ${rowTone} ${statusAccent(item.status)} border-l-4`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(item.id)}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    className="grid w-full gap-4 border-b border-[var(--admin-border)] px-6 py-4 text-left transition hover:bg-[var(--admin-card-muted)] md:grid-cols-[1fr_1.2fr_0.8fr_0.8fr_0.9fr]"
                  >
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-[var(--admin-text)]">#{item.id.slice(0, 8)}</div>
                      <div className="mt-1 text-xs text-[var(--admin-muted)] line-clamp-1">
                        {item.subject || item.product || 'Konu yok'}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[var(--admin-text)]">{item.name}</div>
                      <div className="mt-1 truncate text-xs text-[var(--admin-muted)]">{item.email}</div>
                    </div>
                    <div className="flex items-start md:items-center">
                      <AdminBadge tone={typeTone(item.type)}>{typeLabel(item.type)}</AdminBadge>
                    </div>
                    <div className="flex items-start md:items-center">
                      <AdminBadge tone={statusTone(item.status)}>
                        {item.status === 'READ' ? 'Okundu' : item.status === 'CLOSED' ? 'Silindi' : 'Yeni'}
                      </AdminBadge>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-center">
                      <div className="text-sm font-semibold text-[var(--admin-text)] md:text-right">
                        {formatDate(item.createdAt)}
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--admin-muted)]">
                        Detay
                        <svg
                          viewBox="0 0 20 20"
                          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M6 8l4 4 4-4" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {isExpanded ? (
                    <div
                      id={panelId}
                      className="grid gap-6 border-t border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-6 py-6 lg:grid-cols-[1.15fr_0.85fr]"
                    >
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm">
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                            Mesaj
                          </div>
                          <div className="mt-3 whitespace-pre-line text-sm text-[var(--admin-text)]">{item.message}</div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                              İletişim
                            </div>
                            <div className="mt-2 text-sm font-semibold text-[var(--admin-text)]">{item.email}</div>
                            {item.phone ? (
                              <div className="mt-1 text-xs text-[var(--admin-muted)]">{item.phone}</div>
                            ) : null}
                          </div>
                          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                              Konu
                            </div>
                            <div className="mt-2 text-sm text-[var(--admin-text)]">
                              {item.type === 'QUOTE'
                                ? item.product
                                  ? `Ürün: ${item.product}`
                                  : item.subject || '-'
                                : item.subject || '-'}
                            </div>
                            {item.company ? (
                              <div className="mt-1 text-xs text-[var(--admin-muted)]">{item.company}</div>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                                İşlemler
                              </div>
                              <div className="mt-2 text-sm font-semibold text-[var(--admin-text)]">
                                Durum: {item.status === 'READ' ? 'Okundu' : item.status === 'CLOSED' ? 'Silindi' : 'Yeni'}
                              </div>
                            </div>
                            <InquiryStatusActions inquiryId={item.id} status={item.status} />
                          </div>
                        </div>

                        <InquiryReplyBox
                          inquiryId={item.id}
                          existingResponse={item.adminResponse}
                          canReply={Boolean(item.email)}
                          onSaved={(updated) => {
                            setRows((prev) =>
                              prev.map((row) =>
                                row.id === item.id
                                  ? {
                                      ...row,
                                      adminResponse: updated.adminResponse,
                                      status: updated.status,
                                    }
                                  : row,
                              ),
                            );
                          }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {rows.length > 0 ? (
        <div className="sticky bottom-4 z-30">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/90 px-4 py-3 text-xs text-[var(--admin-muted)] shadow-lg backdrop-blur">
            <div className="flex items-center gap-2">
              <AdminBadge tone="slate">{filtered.length} kayıt</AdminBadge>
              <span>Filtre: {activeFilterLabel}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminButton tone="slate" variant="outline" onClick={() => window.location.reload()}>
                Yenile
              </AdminButton>
              <AdminButton tone="slate" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                En üst
              </AdminButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

