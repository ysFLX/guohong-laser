'use client';

import { useEffect, useMemo, useState } from 'react';

type OrderItem = {
  id: string;
  name: string;
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
  if (!address) return 'Adres bilgisi yok';
  const line2 = address.line2 ? `, ${address.line2}` : '';
  const cityLine = `${address.city || '-'}${address.state ? ` / ${address.state}` : ''} ${address.postalCode || ''}`.trim();
  const country = address.country || '';
  const parts = [
    address.label,
    address.fullName,
    address.line1 ? `${address.line1}${line2}` : null,
    `${cityLine} ${country}`.trim(),
    address.phone,
  ].filter(Boolean);
  return parts.join(' | ');
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

  const totalOrders = useMemo(() => orders.length, [orders.length]);

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

  async function saveStatus(orderId: string) {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Durum guncellenemedi');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 border-l-4 border-l-teal-500 bg-white p-4 shadow-sm">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Toplam</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{totalOrders}</div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Siparis listesi</h3>
          <button
            type="button"
            onClick={loadOrders}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Yenile
          </button>
        </div>

        {loading && <div className="mt-6 text-sm text-slate-500">Yukleniyor...</div>}
        {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}

        {!loading && orders.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            Henuz siparis yok.
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Siparis #{order.id.slice(0, 8)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatPriceTry(order.totalCents)}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr_0.8fr]">
                  <div className="text-sm text-slate-700">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Musteri</div>
                    <div className="mt-1 font-semibold">
                      {order.user?.name || order.user?.email || 'Misafir'}
                    </div>
                    <div className="text-xs text-slate-500">{order.user?.email || '-'}</div>
                  </div>

                  <div className="text-sm text-slate-700">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Urunler</div>
                    <div className="mt-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-xs">
                          <span className="truncate">{item.name}</span>
                          <span className="text-slate-500">{item.quantity}x</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-slate-700">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Teslimat adresi</div>
                    <div className="mt-1 text-xs text-slate-600">{formatAddress(order.shippingAddress)}</div>
                  </div>

                  <div className="text-sm text-slate-700">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Durum</div>
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                        value={draftStatus[order.id] || order.status}
                        onChange={(e) =>
                          setDraftStatus((prev) => ({
                            ...prev,
                            [order.id]: e.target.value,
                          }))
                        }
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
                        className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                      >
                        {savingId === order.id ? 'Kaydediliyor' : 'Kaydet'}
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Mevcut: {statusLabel[order.status] || order.status}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Kargo firmasi</div>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
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
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Takip no</div>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                      placeholder="Orn: 1234567890"
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
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Takip linki</div>
                    <input
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                      placeholder="https://..."
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


