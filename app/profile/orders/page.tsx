'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import ProfileLayout from '@/components/profile/ProfileLayout';

type OrderItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  priceCents: number;
};

type Order = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Siparisler alinamadi');
        setOrders(Array.isArray(data?.items) ? data.items : []);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Siparisler alinamadi');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasOrders = orders.length > 0;
  const emptyState = !isLoading && !error && !hasOrders;

  const statusLabel: Record<string, string> = {
    PAID: 'Odeme alindi',
    PENDING: 'Beklemede',
    FAILED: 'Basarisiz',
    CANCELED: 'Iptal',
  };

  return (
    <ProfileLayout showSide={false}>
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/profile" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              Hesap yonetimine don
            </Link>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">Siparislerim</h1>
            <p className="mt-1 text-sm text-slate-600">Tum siparislerin burada listelenir.</p>
          </div>
          <Link href="/spare-parts" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            Yeni urun kesfet
          </Link>
        </div>

        {(isLoading || !mounted) && (
          <div className="mt-8 rounded-[24px] border border-slate-200 bg-white/90 p-6 text-sm text-slate-600">
            Yukleniyor...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-[24px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {emptyState && (
          <div className="mt-8 rounded-[24px] border border-dashed border-slate-200 bg-white/90 p-6">
            <div className="text-sm font-semibold text-slate-900">Henuz siparis yok</div>
            <p className="mt-2 text-sm text-slate-600">
              Sepetine urun ekleyip siparisini tamamladiginda burada gorebilirsin.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/spare-parts"
                className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Yedek parcalar
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Destek al
              </Link>
            </div>
          </div>
        )}

        {hasOrders && (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-[24px] border border-slate-200 bg-white/90 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Siparis #{order.id.slice(0, 8)}</div>
                    <div className="mt-1 text-xs text-slate-500" suppressHydrationWarning>
                      {mounted ? formatDate(order.createdAt) : '...'}
                    </div>
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                    {statusLabel[order.status as keyof typeof statusLabel] || order.status}
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm text-slate-700">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 line-clamp-1">{item.name}</div>
                        <div className="text-xs text-slate-500" suppressHydrationWarning>
                          {item.quantity} adet - {mounted ? formatPriceTry(item.priceCents) : '...'}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-slate-900" suppressHydrationWarning>
                        {mounted ? formatPriceTry(item.priceCents * item.quantity) : '...'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                  <span className="text-slate-600">Toplam</span>
                  <span className="font-semibold text-slate-900" suppressHydrationWarning>
                    {mounted ? formatPriceTry(order.totalCents) : '...'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  );
}

