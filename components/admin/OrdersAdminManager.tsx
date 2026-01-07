'use client';

import { useEffect, useMemo, useState } from 'react';

type OrderItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  priceCents: number;
};

type OrderUser = {
  name: string | null;
  email: string | null;
};

type OrderAddress = {
  label: string | null;
  fullName: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
};

type AdminOrder = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  user: OrderUser | null;
  shippingAddress: OrderAddress | null;
  billingAddress: OrderAddress | null;
  items: OrderItem[];
};

const statusOptions = [
  { value: 'RECEIVED', label: 'Siparis alindi' },
  { value: 'IN_TRANSIT', label: 'Siparis hazirlaniyor' },
  { value: 'SHIPPED', label: 'Kargoya verildi' },
  { value: 'DELIVERED', label: 'Teslim edildi' },
  { value: 'PENDING', label: 'Beklemede' },
  { value: 'PAID', label: 'Odeme alindi' },
  { value: 'FAILED', label: 'Basarisiz' },
  { value: 'CANCELED', label: 'Iptal' },
];

const statusLabel = statusOptions.reduce<Record<string, string>>((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const statusTone = (value: string) => {
  switch (value) {
    case 'DELIVERED':
      return 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/30';
    case 'SHIPPED':
      return 'bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/30';
    case 'IN_TRANSIT':
      return 'bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30';
    case 'PAID':
      return 'bg-teal-500/10 text-teal-700 ring-1 ring-teal-500/30';
    case 'FAILED':
      return 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/30';
    case 'CANCELED':
      return 'bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/30';
    default:
      return 'bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/30';
  }
};

const statusAccent = (value: string) => {
  switch (value) {
    case 'DELIVERED':
      return 'border-l-emerald-500';
    case 'SHIPPED':
      return 'border-l-blue-500';
    case 'IN_TRANSIT':
      return 'border-l-amber-500';
    case 'PAID':
      return 'border-l-teal-500';
    case 'FAILED':
      return 'border-l-rose-500';
    case 'CANCELED':
      return 'border-l-slate-400';
    default:
      return 'border-l-slate-300';
  }
};

function formatPriceTry(priceCents: number) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} TL`;
  }
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString('tr-TR');
  } catch {
    return value;
  }
}

function formatAddress(address: OrderAddress | null) {
  if (!address) return null;
  const line2 = address.line2 ? `, ${address.line2}` : '';
  const cityLine = `${address.city || '-'}${address.state ? ` / ${address.state}` : ''} ${address.postalCode || ''}`.trim();
  const country = address.country || '';
  return {
    title: address.label || 'Adres',
    fullName: address.fullName || '-',
    line1: `${address.line1 || '-'}${line2}`,
    city: `${cityLine} ${country}`.trim(),
    phone: address.phone || '-',
  };
}

export default function OrdersAdminManager() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});
  const [draftTracking, setDraftTracking] = useState<Record<string, { carrier: string; number: string; url: string }>>(
    {},
  );
  const [cancelDialogId, setCancelDialogId] = useState<string | null>(null);
  const [cancelReasonDraft, setCancelReasonDraft] = useState<Record<string, string>>({});
  const [cancelReasonError, setCancelReasonError] = useState<Record<string, string>>({});
  const [cancelPrevStatus, setCancelPrevStatus] = useState<Record<string, string>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const totalOrders = useMemo(() => orders.length, [orders.length]);
  const latestOrder = useMemo(() => {
    if (!orders.length) return null;
    return orders.reduce((latest, order) =>
      new Date(order.createdAt).getTime() > new Date(latest.createdAt).getTime() ? order : latest,
    );
  }, [orders]);
  const statusCounts = useMemo(() => {
    return orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Siparisler yuklenemedi');
      const list = (data.items || []) as AdminOrder[];
      setOrders(list);
      setExpandedIds(new Set(list.length ? [list[0].id] : []));
      setDraftStatus(
        list.reduce<Record<string, string>>((acc, item) => {
          acc[item.id] = item.status;
          return acc;
        }, {}),
      );
      setDraftTracking(
        list.reduce<Record<string, { carrier: string; number: string; url: string }>>((acc, item) => {
          acc[item.id] = {
            carrier: item.shippingCarrier || '',
            number: item.trackingNumber || '',
            url: item.trackingUrl || '',
          };
          return acc;
        }, {}),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Siparisler yuklenemedi');
    } finally {
      setLoading(false);
    }
  }

  async function saveStatus(orderId: string, cancelReason?: string) {
    const nextStatus = draftStatus[orderId];
    if (!nextStatus) return;
    setSavingId(orderId);
    setError('');
    try {
      const tracking = draftTracking[orderId] || { carrier: '', number: '', url: '' };
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          shippingCarrier: tracking.carrier,
          trackingNumber: tracking.number,
          trackingUrl: tracking.url,
          cancelReason: cancelReason || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Durum guncellenemedi');
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: nextStatus,
                shippingCarrier: tracking.carrier || null,
                trackingNumber: tracking.number || null,
                trackingUrl: tracking.url || null,
              }
            : order,
        ),
      );
      setCancelDialogId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Durum guncellenemedi');
    } finally {
      setSavingId(null);
    }
  }

  const openCancelDialog = (orderId: string) => {
    setCancelDialogId(orderId);
    setCancelReasonError((prev) => ({ ...prev, [orderId]: '' }));
  };

  const confirmCancel = (orderId: string) => {
    const reason = cancelReasonDraft[orderId]?.trim();
    if (!reason) {
      setCancelReasonError((prev) => ({
        ...prev,
        [orderId]: 'Iptal nedeni yazilmasi gerekiyor.',
      }));
      return;
    }
    saveStatus(orderId, reason);
  };

  const closeCancelDialog = (orderId: string) => {
    setCancelDialogId(null);
    setCancelReasonError((prev) => ({ ...prev, [orderId]: '' }));
    if (cancelPrevStatus[orderId]) {
      setDraftStatus((prev) => ({
        ...prev,
        [orderId]: cancelPrevStatus[orderId],
      }));
    }
  };

  const cancelOrder = orders.find((order) => order.id === cancelDialogId) || null;
  const toggleExpanded = (orderId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Siparis yonetimi</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Operasyon merkezi</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tum siparisleri tek ekrandan takip et ve aksiyon al.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadOrders}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            >
              Yenile
            </button>
            <div className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
              {totalOrders} siparis
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Toplam</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{totalOrders}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Bekleyen</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{statusCounts.PENDING || 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Hazirlaniyor</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {(statusCounts.IN_TRANSIT || 0) + (statusCounts.RECEIVED || 0)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Iptal</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{statusCounts.CANCELED || 0}</div>
          </div>
        </div>
        {latestOrder && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600">
            Son siparis: <span className="font-semibold text-slate-900">#{latestOrder.id.slice(0, 8)}</span> -{' '}
            {formatDate(latestOrder.createdAt)}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        {loading && <div className="mt-6 text-sm text-slate-500">Yukleniyor...</div>}
        {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}

        {!loading && orders.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            Henuz siparis yok.
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-8">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_50px_-40px_rgba(15,23,42,0.35)] ring-1 ring-slate-100/80 ${statusAccent(
                  order.status,
                )} border-l-4`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpanded(order.id)}
                  aria-expanded={expandedIds.has(order.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-white px-6 py-5 text-left transition hover:bg-slate-50/80"
                >
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Siparis</div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="text-lg font-semibold text-slate-900">#{order.id.slice(0, 8)}</div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusTone(
                          order.status,
                        )}`}
                      >
                        {statusLabel[order.status] || order.status}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Tutar</div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">{formatPriceTry(order.totalCents)}</div>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                      Detay
                      <svg
                        viewBox="0 0 20 20"
                        className={`h-4 w-4 transition-transform ${expandedIds.has(order.id) ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 8l4 4 4-4" />
                      </svg>
                    </div>
                  </div>
                </button>

                {expandedIds.has(order.id) && (
                  <div className="grid gap-5 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-5">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Musteri</div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">
                          {order.user?.name || order.user?.email || 'Misafir'}
                        </div>
                        <div className="text-xs text-slate-500">{order.user?.email || '-'}</div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Teslimat adresi</div>
                        {(() => {
                          const view = formatAddress(order.shippingAddress);
                          if (!view) {
                            return <div className="mt-2 text-xs text-slate-500">Adres bilgisi yok</div>;
                          }
                          return (
                            <div className="mt-2 text-xs text-slate-600">
                              <div className="font-semibold text-slate-900">{view.title}</div>
                              <div>{view.fullName}</div>
                              <div>{view.line1}</div>
                              <div>{view.city}</div>
                              <div>{view.phone}</div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Urunler</div>
                        <div className="mt-3 space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <div className="h-9 w-9 overflow-hidden rounded-lg bg-white">
                                  {item.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                                      Urun
                                    </div>
                                  )}
                                </div>
                                <span className="truncate text-slate-700">{item.name}</span>
                              </div>
                              <span className="text-slate-500">{item.quantity}x</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Durum guncelle</div>
                        <div className="mt-3 flex items-center gap-2">
                          <select
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                            value={draftStatus[order.id] || order.status}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value !== 'CANCELED' && cancelDialogId === order.id) {
                                setCancelDialogId(null);
                              }
                              if (value === 'CANCELED') {
                                setCancelPrevStatus((prev) => ({
                                  ...prev,
                                  [order.id]: draftStatus[order.id] || order.status,
                                }));
                                openCancelDialog(order.id);
                              }
                              setDraftStatus((prev) => ({
                                ...prev,
                                [order.id]: value,
                              }));
                            }}
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => saveStatus(order.id)}
                            disabled={savingId === order.id}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                          >
                            {savingId === order.id ? 'Kaydediliyor' : 'Kaydet'}
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          Mevcut: {statusLabel[order.status] || order.status}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Kargo bilgisi</div>
                        <div className="mt-3 space-y-2">
                          <input
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                            placeholder="Orn: Yurtici Kargo"
                            value={draftTracking[order.id]?.carrier || ''}
                            onChange={(e) =>
                              setDraftTracking((prev) => ({
                                ...prev,
                                [order.id]: {
                                  carrier: e.target.value,
                                  number: prev[order.id]?.number || '',
                                  url: prev[order.id]?.url || '',
                                },
                              }))
                            }
                          />
                          <input
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                            placeholder="Takip no"
                            value={draftTracking[order.id]?.number || ''}
                            onChange={(e) =>
                              setDraftTracking((prev) => ({
                                ...prev,
                                [order.id]: {
                                  carrier: prev[order.id]?.carrier || '',
                                  number: e.target.value,
                                  url: prev[order.id]?.url || '',
                                },
                              }))
                            }
                          />
                          <input
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                            placeholder="Takip linki"
                            value={draftTracking[order.id]?.url || ''}
                            onChange={(e) =>
                              setDraftTracking((prev) => ({
                                ...prev,
                                [order.id]: {
                                  carrier: prev[order.id]?.carrier || '',
                                  number: prev[order.id]?.number || '',
                                  url: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {cancelDialogId && cancelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%),linear-gradient(160deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.98))] p-6 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)]">
            <div className="absolute -right-16 top-10 h-32 w-32 rounded-full bg-rose-500/20 blur-[80px]" />
            <div className="absolute -left-10 bottom-10 h-32 w-32 rounded-full bg-teal-400/10 blur-[90px]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-400/30 bg-rose-500/15 text-rose-200">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v4m0 4h.01" />
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-rose-300">
                    Siparis iptali
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    #{cancelOrder.id.slice(0, 8)} siparisini iptal et
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-300">
                Iptal islemi icin musteriye gidecek nedeni yazman gerekiyor.
              </p>

              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Iptal nedeni
                </label>
                <textarea
                  rows={4}
                  value={cancelReasonDraft[cancelDialogId] || ''}
                  onChange={(e) =>
                    setCancelReasonDraft((prev) => ({
                      ...prev,
                      [cancelDialogId]: e.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-rose-400/60 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
                  placeholder="Orn: Uretim stok sorunu nedeniyle iptal edildi."
                />
                {cancelReasonError[cancelDialogId] && (
                  <div className="mt-2 text-xs text-rose-300">{cancelReasonError[cancelDialogId]}</div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => closeCancelDialog(cancelDialogId)}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-white/30 hover:text-white"
                >
                  Vazgec
                </button>
                <button
                  type="button"
                  onClick={() => confirmCancel(cancelDialogId)}
                  disabled={savingId === cancelDialogId}
                  className="rounded-full bg-rose-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400 disabled:opacity-60"
                >
                  Iptali onayla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



