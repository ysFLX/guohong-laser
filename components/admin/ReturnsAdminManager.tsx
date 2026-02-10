'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdminBadge, AdminButton } from '@/components/admin/AdminUi';

type ReturnRequestItem = {
  id: string;
  status: string;
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

const statusOptions = [
  { value: 'NEW', label: 'Talep alındı' },
  { value: 'UNDER_REVIEW', label: 'İncelemede' },
  { value: 'APPROVED', label: 'Onaylandı' },
  { value: 'REJECTED', label: 'Reddedildi' },
  { value: 'REFUNDED', label: 'İade tamamlandı' },
];

const statusBadge = (value: string) => {
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/returns');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'İade talepleri alınamadı');
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'İade talepleri alınamadı');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateItem = async (item: ReturnRequestItem) => {
    setSavingId(item.id);
    try {
      const res = await fetch(`/api/admin/returns/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: item.status,
          adminNote: item.adminNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Güncelleme başarısız');
      }
      setItems((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, ...data.item } : row)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme başarısız');
    } finally {
      setSavingId(null);
    }
  };

  const summary = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">İade talepleri</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {statusOptions.map((status) => (
            <div
              key={status.value}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            >
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{status.label}</div>
              <div className="mt-2 text-lg font-semibold text-slate-900">{summary[status.value] || 0}</div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Yükleniyor...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          İade talebi bulunamadı.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="hidden items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400 sm:grid sm:grid-cols-[1fr_1.2fr_0.8fr_0.8fr]">
              <div>Talep</div>
              <div>Müşteri</div>
              <div>Durum</div>
              <div>Sipariş</div>
            </div>
            {items.map((item, index) => {
              const rowTone = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';
              const rowBorder = index === 0 ? 'border-t-0' : 'border-t';
              return (
              <div key={item.id} className={`${rowBorder} border-slate-200 ${rowTone}`}>
              <div className="grid gap-4 border-b border-slate-100 px-6 py-4 text-sm sm:grid-cols-[1fr_1.2fr_0.8fr_0.8fr]">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 sm:hidden">Talep</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">#{item.id.slice(0, 8)}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 sm:hidden">Müşteri</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{item.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.email}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 sm:hidden">Durum</div>
                  <div className="mt-2">
                    <AdminBadge tone={statusBadge(item.status)}>
                      {statusOptions.find((s) => s.value === item.status)?.label || item.status}
                    </AdminBadge>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 sm:hidden">Sipariş</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{item.orderId}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.itemName || '-'}</div>
                </div>
              </div>

              <div className="grid gap-4 border-t border-slate-200 px-6 py-5 lg:grid-cols-[1.2fr_0.8fr] bg-slate-50/60">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Müşteri</div>
                    <div className="mt-2 font-semibold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.email}</div>
                    {item.phone && <div className="text-xs text-slate-500">{item.phone}</div>}
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Sipariş</div>
                    <div className="mt-2 text-sm">Sipariş no: {item.orderId}</div>
                    {item.itemName && <div className="mt-1 text-sm">Ürün: {item.itemName}</div>}
                    <div className="mt-1 text-sm">Talep tipi: {item.resolution}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Neden</div>
                    <div className="mt-2 whitespace-pre-line text-sm">{item.reason}</div>
                  </div>

                  {item.evidenceUrls?.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Kanıtlar</div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {item.evidenceUrls.map((url, idx) => (
                          <a
                            key={`${url}-${idx}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="group rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 hover:border-indigo-300"
                          >
                            {isImageUrl(url) ? (
                              <div className="relative mb-2 h-32 w-full overflow-hidden rounded-lg bg-slate-100">
                                <img
                                  src={url}
                                  alt={`Kanıt ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <div className="mb-2 flex h-32 w-full items-center justify-center rounded-lg bg-slate-100 text-xs uppercase tracking-[0.2em] text-slate-400">
                                Dosya
                              </div>
                            )}
                            <div className="font-semibold text-slate-900">Kanıt dosyası #{idx + 1}</div>
                            <div className="mt-1 text-[11px] text-slate-500">Görüntüle</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Durum güncelle</div>
                  <select
                    className="form-input"
                    value={item.status}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((row) => (row.id === item.id ? { ...row, status: e.target.value } : row)),
                      )
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>

                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin notu</div>
                    {item.adminNote && (
                      <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Son not
                        </div>
                        <div className="mt-2 whitespace-pre-line text-sm text-slate-700">{item.adminNote}</div>
                        {item.respondedAt && (
                          <div className="mt-2 text-[11px] text-slate-400">{formatDate(item.respondedAt)}</div>
                        )}
                      </div>
                    )}
                    <textarea
                      rows={5}
                      className="form-input mt-2"
                      value={item.adminNote || ''}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row) =>
                            row.id === item.id ? { ...row, adminNote: e.target.value } : row,
                          ),
                        )
                      }
                    />
                  </div>

                  <AdminButton
                    onClick={() => updateItem(item)}
                    disabled={savingId === item.id}
                    className="w-full justify-center"
                  >
                    {savingId === item.id ? 'Kaydediliyor...' : 'Kaydet'}
                  </AdminButton>
                </div>
              </div>
            </div>
          )})}
          </div>
        </div>
      )}

      <div className="sticky bottom-4 z-30">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <AdminBadge tone="slate">{items.length} talep</AdminBadge>
            <span>Bekleyen: {summary.NEW || 0}</span>
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
    </div>
  );
}
