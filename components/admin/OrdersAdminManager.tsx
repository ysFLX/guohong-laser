'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { AdminBadge, AdminButton, AdminRadioCard } from '@/components/admin/AdminUi';

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
  { value: 'RECEIVED', label: 'Sipariş alındı' },
  { value: 'IN_TRANSIT', label: 'Sipariş hazırlanıyor' },
  { value: 'SHIPPED', label: 'Kargoya verildi' },
  { value: 'DELIVERED', label: 'Teslim edildi' },
  { value: 'CANCELED', label: 'İptal' },
];

const statusLabel = statusOptions.reduce<Record<string, string>>((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const normalizeStatus = (value: string) => {
  if (value === 'PAID' || value === 'PENDING' || value === 'FAILED') {
    return 'RECEIVED';
  }
  return value;
};

const statusTone = (value: string) => {
  switch (value) {
    case 'DELIVERED':
      return 'emerald';
    case 'SHIPPED':
      return 'indigo';
    case 'IN_TRANSIT':
      return 'amber';
    case 'CANCELED':
      return 'rose';
    default:
      return 'slate';
  }
};

const statusAccent = (value: string) => {
  switch (value) {
    case 'DELIVERED':
      return 'border-l-indigo-500';
    case 'SHIPPED':
      return 'border-l-blue-500';
    case 'IN_TRANSIT':
      return 'border-l-amber-500';
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
  const searchParams = useSearchParams();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'RECEIVED' | 'IN_TRANSIT' | 'SHIPPED' | 'DELIVERED' | 'CANCELED'>('ALL');

  const totalOrders = useMemo(() => orders.length, [orders.length]);
  const latestOrder = useMemo(() => {
    if (!orders.length) return null;
    return orders.reduce((latest, order) =>
      new Date(order.createdAt).getTime() > new Date(latest.createdAt).getTime() ? order : latest,
    );
  }, [orders]);
  const statusCounts = useMemo(() => {
    return orders.reduce<Record<string, number>>((acc, order) => {
      const normalized = normalizeStatus(order.status);
      acc[normalized] = (acc[normalized] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);
  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const normalized = normalizeStatus(order.status);
      const matchesStatus = statusFilter === 'ALL' || normalized === statusFilter;
      if (!matchesStatus) return false;
      if (!query) return true;
      const idMatch = order.id.toLowerCase().includes(query);
      const nameMatch = (order.user?.name || '').toLowerCase().includes(query);
      const emailMatch = (order.user?.email || '').toLowerCase().includes(query);
      const itemMatch = order.items.some((item) => item.name.toLowerCase().includes(query));
      return idMatch || nameMatch || emailMatch || itemMatch;
    });
  }, [orders, searchQuery, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const initial = searchParams?.get('q') || '';
    if (initial) {
      setSearchQuery(initial);
    }
  }, [searchParams]);

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Siparişler yüklenemedi');
      const list = (data.items || []) as AdminOrder[];
      setOrders(list);
      setExpandedIds(new Set(list.length ? [list[0].id] : []));
      setDraftStatus(
        list.reduce<Record<string, string>>((acc, item) => {
          acc[item.id] = normalizeStatus(item.status);
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
      setError(err instanceof Error ? err.message : 'Siparişler yüklenemedi');
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
      if (!res.ok) throw new Error(data?.error || 'Durum güncellenemedi');
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
      setError(err instanceof Error ? err.message : 'Durum güncellenemedi');
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
        [orderId]: 'İptal nedeni yazılması gerekiyor.',
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sipariş yönetimi</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Operasyon merkezi</h2>
            <p className="mt-1 text-sm text-slate-500">Tüm siparişleri tek ekrandan takip et.</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminButton onClick={loadOrders} tone="slate" variant="outline">
              Yenile
            </AdminButton>
            <AdminBadge tone="slate">{totalOrders} sipariş</AdminBadge>
          </div>
        </div>
        <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 md:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Hızlı arama</div>
            <div className="mt-2 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-slate-400" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Siparis no, musteri, e-posta veya urun ara"
                className="w-full bg-transparent text-sm text-slate-700 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Durum filtre</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { value: 'ALL', label: 'Hepsi' },
                { value: 'RECEIVED', label: 'Alındı' },
                { value: 'IN_TRANSIT', label: 'Hazırlanıyor' },
                { value: 'SHIPPED', label: 'Kargoda' },
                { value: 'DELIVERED', label: 'Teslim' },
                { value: 'CANCELED', label: 'İptal' },
              ].map((item) => (
                <AdminRadioCard
                  key={item.value}
                  active={statusFilter === item.value}
                  onClick={() => setStatusFilter(item.value as typeof statusFilter)}
                >
                  {item.label}
                </AdminRadioCard>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Toplam</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{totalOrders}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Alındı</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{statusCounts.RECEIVED || 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Hazırlanıyor</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{statusCounts.IN_TRANSIT || 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400">İptal</div>
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

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading && <div className="mt-6 text-sm text-slate-500">Yükleniyor...</div>}
        {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}

        {!loading && filteredOrders.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            Filtreye uygun sipariş yok.
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="sticky top-24 z-10 hidden items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400 md:grid md:grid-cols-[1.1fr_1.2fr_0.8fr_0.7fr]">
                <div>Sipariş</div>
                <div>Müşteri</div>
                <div>Durum</div>
                <div className="text-right">Tutar</div>
              </div>
              {filteredOrders.map((order, index) => {
                const displayStatus = normalizeStatus(order.status);
                const rowTone = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';
                const rowBorder = index === 0 ? 'border-t-0' : 'border-t';
                return (
                <div
                  key={order.id}
                  className={`${rowBorder} border-slate-200 ${rowTone} ${statusAccent(displayStatus)} border-l-4`}
                >
                <button
                  type="button"
                  onClick={() => toggleExpanded(order.id)}
                  aria-expanded={expandedIds.has(order.id)}
                  className="grid w-full gap-4 border-b border-slate-100 px-6 py-4 text-left transition hover:bg-slate-50 md:grid-cols-[1.1fr_1.2fr_0.8fr_0.7fr]"
                >
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 md:hidden">Sipariş</div>
                    <div className="mt-2 md:mt-0 text-lg font-semibold text-slate-900">#{order.id.slice(0, 8)}</div>
                    <div className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 md:hidden">Müşteri</div>
                    <div className="mt-2 md:mt-0 text-sm font-semibold text-slate-900">
                      {order.user?.name || order.user?.email || 'Misafir'}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{order.user?.email || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 md:hidden">Durum</div>
                    <div className="mt-2 md:mt-0">
                      <AdminBadge tone={statusTone(displayStatus)}>
                        {statusLabel[displayStatus] || displayStatus}
                      </AdminBadge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 md:hidden">Tutar</div>
                    <div className="mt-2 md:mt-0 text-lg font-semibold text-slate-900">
                      {formatPriceTry(order.totalCents)}
                    </div>
                    <div className="mt-2 inline-flex items-center justify-end gap-1 text-xs font-semibold text-slate-500">
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
                  <div className="grid gap-5 border-t border-slate-200 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr] bg-slate-50/60">
                    <div className="relative space-y-5 pl-6">
                      <div className="absolute left-2 top-4 h-[calc(100%-16px)] w-px bg-slate-200" />
                      <div className="relative">
                        <span className="absolute left-[-2px] top-5 h-2.5 w-2.5 rounded-full bg-slate-900" />
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21a8 8 0 10-16 0" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Müşteri</div>
                            <div className="mt-2 text-sm font-semibold text-slate-900">
                              {order.user?.name || order.user?.email || 'Misafir'}
                            </div>
                            <div className="text-xs text-slate-500">{order.user?.email || '-'}</div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                              {order.user?.email && (
                                <a
                                  href={`mailto:${order.user.email}`}
                                  className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                                >
                                  E-posta gönder
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>

                      <div className="relative">
                        <span className="absolute left-[-2px] top-5 h-2.5 w-2.5 rounded-full bg-slate-900" />
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z" />
                                <circle cx="12" cy="11" r="2.5" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Teslimat adresi</div>
                              {(() => {
                                const view = formatAddress(order.shippingAddress);
                                if (!view) {
                                  return <div className="mt-2 text-xs text-slate-500">Adres bilgisi yok</div>;
                                }
                                return (
                                  <div className="mt-2 text-xs text-slate-600">
                                  <div className="font-semibold text-slate-900">{view.fullName}</div>
                                  <div>{view.line1}</div>
                                  <div>{view.city}</div>
                                  <div>{view.phone}</div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute left-[-2px] top-5 h-2.5 w-2.5 rounded-full bg-slate-900" />
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 7h-3V4H7v3H4v13h16V7z" />
                                <path d="M7 4h10" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Ürünler</div>
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
                                            Ürün
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
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                          <div className="flex items-center justify-between">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Durum güncelle</div>
                            <AdminBadge tone={statusTone(displayStatus)}>
                              {statusLabel[displayStatus] || displayStatus}
                            </AdminBadge>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <select
                              className="form-input text-xs font-semibold text-slate-700"
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
                          <AdminButton
                            onClick={() => saveStatus(order.id)}
                            disabled={savingId === order.id}
                            className="px-5"
                          >
                            {savingId === order.id ? 'Kaydediliyor' : 'Kaydet'}
                          </AdminButton>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          Mevcut: {statusLabel[displayStatus] || displayStatus}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 7h13l3 4v6H3z" />
                              <circle cx="7.5" cy="17" r="2" />
                              <circle cx="16.5" cy="17" r="2" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Kargo bilgisi</div>
                            <div className="text-xs text-slate-500">Taşıma detaylarını tamamla.</div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-3">
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Kargo firması
                            </label>
                          <input
                            className="form-input text-xs text-slate-700"
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
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Takip no
                            </label>
                          <input
                            className="form-input text-xs text-slate-700"
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
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Takip linki
                            </label>
                            <input
                              className="form-input text-xs text-slate-700"
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
                        <div className="mt-3 text-[11px] text-slate-500">
                          Kargo bilgisi kaydedildiğinde müşteriye e-posta gider ve sipariş detayında görünür.
                        </div>
                        {(draftTracking[order.id]?.carrier ||
                          draftTracking[order.id]?.number ||
                          draftTracking[order.id]?.url) && (
                          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Kargo Özeti
                            </div>
                            <div className="mt-2 space-y-1">
                              {draftTracking[order.id]?.carrier && <div>Firma: {draftTracking[order.id].carrier}</div>}
                              {draftTracking[order.id]?.number && <div>Takip no: {draftTracking[order.id].number}</div>}
                              {draftTracking[order.id]?.url && (
                                <a
                                  href={draftTracking[order.id].url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-800"
                                >
                                  Takip linkini aç
                                  <span>-&gt;</span>
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )})}
            </div>
          </div>
        )}

      </div>

      <div className="sticky bottom-4 z-30">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <AdminBadge tone="slate">{filteredOrders.length} kayit</AdminBadge>
            <span>Filtre: {statusFilter === 'ALL' ? 'Tüm siparişler' : statusLabel[statusFilter]}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminButton tone="slate" variant="outline" onClick={loadOrders}>
              Yenile
            </AdminButton>
            <AdminButton tone="slate" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              En üst
            </AdminButton>
          </div>
        </div>
      </div>

      {cancelDialogId && cancelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%),linear-gradient(160deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.98))] p-6 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)]">
            <div className="absolute -right-16 top-10 h-32 w-32 rounded-full bg-rose-500/20 blur-[80px]" />
            <div className="absolute -left-10 bottom-10 h-32 w-32 rounded-full bg-indigo-400/10 blur-[90px]" />
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
                    Sipariş iptali
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    #{cancelOrder.id.slice(0, 8)} siparişini iptal et
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-300">
                İptal işlemi için müşteriye gidecek nedeni yazman gerekiyor.
              </p>

              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  İptal nedeni
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
                  placeholder="Orn: Üretim stok sorunu nedeniyle iptal edildi."
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
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={() => confirmCancel(cancelDialogId)}
                  disabled={savingId === cancelDialogId}
                  className="rounded-full bg-rose-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400 disabled:opacity-60"
                >
                  İptali onayla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



