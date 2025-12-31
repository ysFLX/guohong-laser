import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

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
  createdAt: Date;
  items: OrderItem[];
};

const prismaOrders = prisma as unknown as {
  order: {
    findMany: (args: unknown) => Promise<Order[]>;
  };
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

function formatDate(value: Date) {
  try {
    return value.toLocaleString('tr-TR');
  } catch {
    return value.toISOString();
  }
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const orders = await prismaOrders.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  const hasOrders = orders.length > 0;

  const statusLabel: Record<string, string> = {
    PAID: 'Odeme alindi',
    PENDING: 'Beklemede',
    FAILED: 'Basarisiz',
    CANCELED: 'Iptal',
  };

  return (
    <div className="min-h-screen space-y-12">
      <div className="rounded-32 bg-slate-950 px-6 py-10 text-white shadow-2xl sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-400 text-slate-900 flex items-center justify-center font-semibold">
              {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Hesabim</h1>
              <div className="mt-1 text-sm text-white/70">
                {session.user.email ?? ''}
                {session.user.role === 'ADMIN' ? ' - Admin' : ''}
              </div>
            </div>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:border-white/60"
          >
            Profil sayfasi
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl">
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

          {!hasOrders && (
            <div className="mt-8 rounded-24 border border-dashed border-slate-200 bg-white/90 p-6">
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
                <div key={order.id} className="rounded-24 border border-slate-200 bg-white/90 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Siparis #{order.id.slice(0, 8)}</div>
                      <div className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</div>
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
                          <div className="text-xs text-slate-500">
                            {item.quantity} adet - {formatPriceTry(item.priceCents)}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {formatPriceTry(item.priceCents * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                    <span className="text-slate-600">Toplam</span>
                    <span className="font-semibold text-slate-900">{formatPriceTry(order.totalCents)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
