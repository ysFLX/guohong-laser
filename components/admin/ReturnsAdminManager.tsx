'use client';

import { useEffect, useMemo, useState } from 'react';

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
  { value: 'NEW', label: 'Talep alindi' },
  { value: 'UNDER_REVIEW', label: 'Incelemede' },
  { value: 'APPROVED', label: 'Onaylandi' },
  { value: 'REJECTED', label: 'Reddedildi' },
  { value: 'REFUNDED', label: 'Iade tamamlandi' },
];

const statusBadge = (value: string) => {
  switch (value) {
    case 'APPROVED':
      return 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/30';
    case 'UNDER_REVIEW':
      return 'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30';
    case 'REJECTED':
      return 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/30';
    case 'REFUNDED':
      return 'bg-teal-500/10 text-teal-700 ring-1 ring-teal-500/30';
    default:
      return 'bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/30';
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
        if (!res.ok) throw new Error(data?.error || 'Iade talepleri alinamadi');
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Iade talepleri alinamadi');
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
        throw new Error(data?.error || 'Guncelleme basarisiz');
      }
      setItems((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, ...data.item } : row)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Guncelleme basarisiz');
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
        <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Iade talepleri</div>
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
          Yukleniyor...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Iade talebi bulunamadi.
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-4 border-b border-slate-100 px-6 py-4 text-sm sm:grid-cols-[1fr_1.2fr_0.8fr_0.8fr]">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Talep</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">#{item.id.slice(0, 8)}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Musteri</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{item.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.email}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Durum</div>
                  <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusBadge(item.status)}`}>
                    {statusOptions.find((s) => s.value === item.status)?.label || item.status}
                  </span>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Siparis</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{item.orderId}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.itemName || '-'}</div>
                </div>
              </div>

              <div className="grid gap-4 px-6 py-5 lg:grid-cols-[1.2fr_0.8fr] bg-slate-50/60">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Musteri</div>
                    <div className="mt-2 font-semibold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.email}</div>
                    {item.phone && <div className="text-xs text-slate-500">{item.phone}</div>}
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Siparis</div>
                    <div className="mt-2 text-sm">Siparis no: {item.orderId}</div>
                    {item.itemName && <div className="mt-1 text-sm">Urun: {item.itemName}</div>}
                    <div className="mt-1 text-sm">Talep tipi: {item.resolution}</div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Neden</div>
                    <div className="mt-2 whitespace-pre-line text-sm">{item.reason}</div>
                  </div>

                  {item.evidenceUrls?.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Kanitlar</div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {item.evidenceUrls.map((url, idx) => (
                          <a
                            key={`${url}-${idx}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="group rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 hover:border-teal-300"
                          >
                            {isImageUrl(url) ? (
                              <div className="relative mb-2 h-32 w-full overflow-hidden rounded-lg bg-slate-100">
                                <img
                                  src={url}
                                  alt={`Kanit ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <div className="mb-2 flex h-32 w-full items-center justify-center rounded-lg bg-slate-100 text-xs uppercase tracking-[0.2em] text-slate-400">
                                Dosya
                              </div>
                            )}
                            <div className="font-semibold text-slate-900">Kanit dosyasi #{idx + 1}</div>
                            <div className="mt-1 text-[11px] text-slate-500">Goruntule</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Durum guncelle</div>
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

                  <button
                    type="button"
                    onClick={() => updateItem(item)}
                    disabled={savingId === item.id}
                    className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {savingId === item.id ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
