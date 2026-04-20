'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdminBadge, AdminButton, AdminRadioCard } from '@/components/admin/AdminUi';

const statusOptions = [
  { value: 'NEW', label: 'Talep alındı' },
  { value: 'UNDER_REVIEW', label: 'Ä°ncelemede' },
  { value: 'APPROVED', label: 'Onaylandı' },
  { value: 'REJECTED', label: 'Reddedildi' },
  { value: 'REFUNDED', label: 'Ä°ade tamamlandı' },
] as const;

type ReturnStatus = (typeof statusOptions)[number]['value'];
type StatusFilter = 'ALL' | ReturnStatus;
type BadgeTone = 'slate' | 'emerald' | 'amber' | 'rose' | 'indigo';

type ReturnRequestItem = {
  id: string;
  status: ReturnStatus;
  name: string;
  email: string;
  phone: string | null;
  orderId: string;
  itemName: string | null;
  reason: string;
  resolution: string;
  evidenceUrls: string[];
  adminNote: string | null;
  respondedAt: string | null;
  createdAt: string;
};

const statusLabel = statusOptions.reduce<Record<ReturnStatus, string>>((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {} as Record<ReturnStatus, string>);

const statusBadgeTone = (value: ReturnStatus): BadgeTone => {
  switch (value) {
    case 'APPROVED':
      return 'emerald';
    case 'UNDER_REVIEW':
      return 'amber';
    case 'REJECTED':
      return 'rose';
    case 'REFUNDED':
      return 'indigo';
    default:
      return 'slate';
  }
};

const statusAccent = (value: ReturnStatus) => {
  switch (value) {
    case 'APPROVED':
      return 'border-l-emerald-500';
    case 'UNDER_REVIEW':
      return 'border-l-amber-500';
    case 'REJECTED':
      return 'border-l-rose-500';
    case 'REFUNDED':
      return 'border-l-indigo-500';
    default:
      return 'border-l-slate-300';
  }
};

const formatDate = (value: string) => {
  try {
    return new Date(value).toLocaleString('tr-TR');
  } catch {
    return value;
  }
};

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif|svg)$/i.test(url);

export default function ReturnsAdminManager() {
  const [items, setItems] = useState<ReturnRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [draftStatus, setDraftStatus] = useState<Record<string, ReturnStatus>>({});
  const [draftAdminNote, setDraftAdminNote] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/returns');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Ä°ade talepleri alınamadı');
      const list = Array.isArray(data?.items) ? (data.items as ReturnRequestItem[]) : [];
      setItems(list);
      setExpandedIds(new Set(list.length ? [list[0].id] : []));
      setDraftStatus(
        list.reduce<Record<string, ReturnStatus>>((acc, row) => {
          acc[row.id] = row.status;
          return acc;
        }, {}),
      );
      setDraftAdminNote(
        list.reduce<Record<string, string>>((acc, row) => {
          acc[row.id] = row.adminNote || '';
          return acc;
        }, {}),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ä°ade talepleri alınamadı');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      const searchable = [
        item.id,
        item.orderId,
        item.name,
        item.email,
        item.phone || '',
        item.itemName || '',
        item.resolution,
        item.reason,
        item.adminNote || '',
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(query);
    });
  }, [items, searchQuery, statusFilter]);

  const summary = useMemo(() => {
    return items.reduce<Record<ReturnStatus, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<ReturnStatus, number>);
  }, [items]);

  const activeFilterLabel = statusFilter === 'ALL' ? 'Tüm talepler' : statusLabel[statusFilter];

  const toggleExpanded = (itemId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const resetDraft = (itemId: string) => {
    const item = items.find((row) => row.id === itemId);
    if (!item) return;
    setDraftStatus((prev) => ({ ...prev, [itemId]: item.status }));
    setDraftAdminNote((prev) => ({ ...prev, [itemId]: item.adminNote || '' }));
  };

  const updateItem = async (itemId: string) => {
    const item = items.find((row) => row.id === itemId);
    if (!item) return;
    const status = draftStatus[itemId] || item.status;
    const adminNote = (draftAdminNote[itemId] ?? item.adminNote ?? '').trim();
    setSavingId(itemId);
    setError('');
    try {
      const res = await fetch(`/api/admin/returns/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Güncelleme başarısız');
      }

      const nextStatus =
        typeof data?.item?.status === 'string' ? (data.item.status as ReturnStatus) : status;
      const nextAdminNote =
        typeof data?.item?.adminNote === 'string'
          ? (data.item.adminNote as string)
          : data?.item?.adminNote === null
            ? null
            : item.adminNote;
      const nextRespondedAt =
        typeof data?.item?.respondedAt === 'string'
          ? (data.item.respondedAt as string)
          : data?.item?.respondedAt === null
            ? null
            : item.respondedAt;

      setItems((prev) =>
        prev.map((row) =>
          row.id === itemId
            ? {
                ...row,
                status: nextStatus,
                adminNote: nextAdminNote,
                respondedAt: nextRespondedAt,
              }
            : row,
        ),
      );

      setDraftStatus((prev) => ({ ...prev, [itemId]: nextStatus }));
      setDraftAdminNote((prev) => ({ ...prev, [itemId]: nextAdminNote || '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme başarısız');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">
              Ä°ade yönetimi
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">Talepler</h2>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">
              Ä°ade/değişim taleplerini hızlıca ara ve güncelle.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AdminButton tone="slate" variant="outline" onClick={loadItems}>
              Yenile
            </AdminButton>
            <AdminBadge tone="slate">{items.length} talep</AdminBadge>
          </div>
        </div>

        <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4 md:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">
              Hızlı arama
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] px-3 py-2 shadow-sm">
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4 text-[var(--admin-muted)]"
                fill="currentColor"
                aria-hidden="true"
              >
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
                placeholder="Talep no, sipariş no, müşteri, e-posta, ürün veya neden ara"
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

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)]">
              Durum filtre
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[{ value: 'ALL', label: 'Hepsi' }, ...statusOptions].map((status) => (
                <AdminRadioCard
                  key={status.value}
                  active={statusFilter === status.value}
                  onClick={() => setStatusFilter(status.value as StatusFilter)}
                >
                  {status.label}
                </AdminRadioCard>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--admin-muted)]">Toplam</div>
            <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{items.length}</div>
          </div>
          {statusOptions.map((status) => (
            <div
              key={status.value}
              className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-4 py-4"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--admin-muted)]">{status.label}</div>
              <div className="mt-2 text-2xl font-semibold text-[var(--admin-text)]">{summary[status.value] || 0}</div>
            </div>
          ))}
        </div>

        {items.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-xs text-[var(--admin-muted)] shadow-sm">
            Gösterilen:{' '}
            <span className="font-semibold text-[var(--admin-text)]">{filteredItems.length}</span> · Filtre:{' '}
            <span className="font-semibold text-[var(--admin-text)]">{activeFilterLabel}</span>
            {searchQuery.trim() ? (
              <>
                {' '}
                · Arama:{' '}
                <span className="font-semibold text-[var(--admin-text)]">"{searchQuery.trim()}"</span>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[var(--admin-shadow)]">
        {error ? <div className="text-sm text-rose-600">{error}</div> : null}
        {loading ? <div className="mt-6 text-sm text-[var(--admin-muted)]">Yükleniyor...</div> : null}

        {!loading && items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-[var(--admin-border)] p-4 text-sm text-[var(--admin-muted)]">
            Ä°ade talebi bulunamadı.
          </div>
        ) : null}

        {!loading && items.length > 0 && filteredItems.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-[var(--admin-border)] p-4 text-sm text-[var(--admin-muted)]">
            Filtreye uygun iade talebi yok.
          </div>
        ) : null}

        {!loading && filteredItems.length > 0 ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
            <div className="hidden items-center gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--admin-muted)] md:grid md:grid-cols-[1fr_1.2fr_0.9fr_0.9fr]">
              <div>Talep</div>
              <div>Müşteri</div>
              <div>Durum</div>
              <div>Sipariş</div>
            </div>

            {filteredItems.map((item, index) => {
              const rowTone = index % 2 === 0 ? 'bg-[var(--admin-surface)]' : 'bg-[var(--admin-card-muted)]';
              const rowBorder = index === 0 ? 'border-t-0' : 'border-t';
              const panelId = `return-request-${item.id}`;

              const currentDraftStatus = draftStatus[item.id] || item.status;
              const savedNote = item.adminNote || '';
              const currentDraftNote = draftAdminNote[item.id] ?? savedNote;
              const isDirty = currentDraftStatus !== item.status || currentDraftNote !== savedNote;

              return (
                <div
                  key={item.id}
                  className={`${rowBorder} border-[var(--admin-border)] ${rowTone} ${statusAccent(item.status)} border-l-4`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(item.id)}
                    aria-expanded={expandedIds.has(item.id)}
                    aria-controls={panelId}
                    className="grid w-full gap-4 border-b border-[var(--admin-border)] px-6 py-4 text-left transition hover:bg-[var(--admin-card-muted)] md:grid-cols-[1fr_1.2fr_0.9fr_0.9fr]"
                  >
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-[var(--admin-text)]">#{item.id.slice(0, 8)}</div>
                      <div className="mt-1 text-xs text-[var(--admin-muted)]">{formatDate(item.createdAt)}</div>
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[var(--admin-text)]">{item.name}</div>
                      <div className="mt-1 truncate text-xs text-[var(--admin-muted)]">{item.email}</div>
                    </div>

                    <div className="flex flex-wrap items-start gap-2 md:items-center">
                      <AdminBadge tone={statusBadgeTone(item.status)}>{statusLabel[item.status] || item.status}</AdminBadge>
                      {isDirty ? <AdminBadge tone="amber">Taslak</AdminBadge> : null}
                    </div>

                    <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-center">
                      <div className="min-w-0 text-sm font-semibold text-[var(--admin-text)] md:text-right">
                        <div className="truncate">{item.orderId}</div>
                        <div className="mt-1 truncate text-xs text-[var(--admin-muted)]">{item.itemName || '-'}</div>
                      </div>
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--admin-muted)]">
                        Detay
                        <svg
                          viewBox="0 0 20 20"
                          className={`h-4 w-4 transition-transform ${expandedIds.has(item.id) ? 'rotate-180' : ''}`}
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

                  {expandedIds.has(item.id) ? (
                    <div
                      id={panelId}
                      className="grid gap-6 border-t border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm">
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                            Müşteri
                          </div>
                          <div className="mt-2 text-sm font-semibold text-[var(--admin-text)]">{item.name}</div>
                          <div className="mt-1 text-xs text-[var(--admin-muted)]">{item.email}</div>
                          {item.phone ? <div className="mt-1 text-xs text-[var(--admin-muted)]">{item.phone}</div> : null}
                        </div>

                        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm">
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                            Sipariş
                          </div>
                          <div className="mt-2 text-sm text-[var(--admin-text)]">
                            <span className="font-semibold">Sipariş no:</span> {item.orderId}
                          </div>
                          {item.itemName ? (
                            <div className="mt-1 text-sm text-[var(--admin-text)]">
                              <span className="font-semibold">Ürün:</span> {item.itemName}
                            </div>
                          ) : null}
                          <div className="mt-1 text-sm text-[var(--admin-text)]">
                            <span className="font-semibold">Talep tipi:</span> {item.resolution}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm sm:col-span-2">
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                            Neden
                          </div>
                          <div className="mt-2 whitespace-pre-line text-sm text-[var(--admin-text)]">{item.reason}</div>
                        </div>

                        {item.evidenceUrls?.length > 0 ? (
                          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-4 shadow-sm sm:col-span-2">
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                              Kanıtlar
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              {item.evidenceUrls.map((url, idx) => (
                                <a
                                  key={`${url}-${idx}`}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="group rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] p-3 text-xs text-[var(--admin-muted)] transition hover:border-indigo-300"
                                >
                                  {isImageUrl(url) ? (
                                    <div className="relative mb-2 h-32 w-full overflow-hidden rounded-xl bg-slate-100">
                                      <img
                                        src={url}
                                        alt={`Kanıt ${idx + 1}`}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                    </div>
                                  ) : (
                                    <div className="mb-2 flex h-32 w-full items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                      Dosya
                                    </div>
                                  )}
                                  <div className="font-semibold text-[var(--admin-text)]">Kanıt dosyası #{idx + 1}</div>
                                  <div className="mt-1 text-[11px] text-[var(--admin-muted)]">Görüntüle</div>
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                              Durum güncelle
                            </div>
                            <div className="mt-2 text-sm font-semibold text-[var(--admin-text)]">
                              {statusLabel[item.status] || item.status}
                            </div>
                          </div>
                          <AdminBadge tone={statusBadgeTone(item.status)}>{statusLabel[item.status] || item.status}</AdminBadge>
                        </div>

                        <select
                          className="form-input"
                          value={currentDraftStatus}
                          onChange={(e) =>
                            setDraftStatus((prev) => ({
                              ...prev,
                              [item.id]: e.target.value as ReturnStatus,
                            }))
                          }
                        >
                          {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>

                        <div>
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                            Admin notu
                          </div>
                          {item.adminNote ? (
                            <div className="mt-2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card-muted)] px-3 py-3 text-xs text-[var(--admin-muted)]">
                              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
                                Son not
                              </div>
                              <div className="mt-2 whitespace-pre-line text-sm text-[var(--admin-text)]">{item.adminNote}</div>
                              {item.respondedAt ? (
                                <div className="mt-2 text-[11px] text-[var(--admin-muted)]">{formatDate(item.respondedAt)}</div>
                              ) : null}
                            </div>
                          ) : null}
                          <textarea
                            rows={6}
                            className="form-input mt-2 min-h-[140px] resize-y"
                            value={currentDraftNote}
                            placeholder="Müşteriye iletilecek not (opsiyonel)"
                            onChange={(e) =>
                              setDraftAdminNote((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <AdminButton
                            onClick={() => updateItem(item.id)}
                            disabled={savingId === item.id || !isDirty}
                            className="flex-1 justify-center"
                          >
                            {savingId === item.id ? 'Kaydediliyor...' : 'Kaydet'}
                          </AdminButton>
                          <AdminButton
                            tone="slate"
                            variant="outline"
                            onClick={() => resetDraft(item.id)}
                            disabled={savingId === item.id || !isDirty}
                            className="flex-1 justify-center"
                          >
                            Sıfırla
                          </AdminButton>
                        </div>

                        <div className="text-xs text-[var(--admin-muted)]">
                          {isDirty ? 'Değişiklikler henüz kaydedilmedi.' : 'Kaydedilmiş.'}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="sticky bottom-4 z-30">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/90 px-4 py-3 text-xs text-[var(--admin-muted)] shadow-lg backdrop-blur">
            <div className="flex items-center gap-2">
              <AdminBadge tone="slate">{filteredItems.length} kayıt</AdminBadge>
              <span>Filtre: {activeFilterLabel}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminButton tone="slate" variant="outline" onClick={loadItems}>
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

