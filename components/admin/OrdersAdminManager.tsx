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

type AdminOrder = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  user: OrderUser | null;
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

export default function OrdersAdminManager() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<Record<string, string>>({});

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
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Durum guncellenemedi');
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Durum guncellenemedi');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Toplam</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{totalOrders}</div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Siparis listesi</h3>
          <button
            type="button"
            onClick={loadOrders}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Yenile
          </button>
        </div>

        {loading && <div className="mt-6 text-sm text-slate-500">Yukleniyor...</div>}
        {error && <div className="mt-4 text-sm text-rose-600">{error}</div>}

        {!loading && orders.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            Henuz siparis yok.
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Siparis #{order.id.slice(0, 8)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatPriceTry(order.totalCents)}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_1fr_0.8fr]">
                  <div className="text-sm text-slate-700 dark:text-slate-200">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Musteri</div>
                    <div className="mt-1 font-semibold">
                      {order.user?.name || order.user?.email || 'Misafir'}
                    </div>
                    <div className="text-xs text-slate-500">{order.user?.email || '-'}</div>
                  </div>

                  <div className="text-sm text-slate-700 dark:text-slate-200">
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

                  <div className="text-sm text-slate-700 dark:text-slate-200">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Durum</div>
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
                        className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                      >
                        {savingId === order.id ? 'Kaydediliyor' : 'Kaydet'}
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      Mevcut: {statusLabel[order.status] || order.status}
                    </div>
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
