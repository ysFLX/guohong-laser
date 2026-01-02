import Image from 'next/image';
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
  const latestOrder = hasOrders ? orders[0] : null;

  const statusLabel: Record<string, string> = {
    PAID: 'Odeme alindi',
    RECEIVED: 'Siparis alindi',
    SHIPPED: 'Kargoya verildi',
    IN_TRANSIT: 'Siparis hazirlaniyor',
    DELIVERED: 'Teslim edildi',
    PENDING: 'Beklemede',
    FAILED: 'Basarisiz',
    CANCELED: 'Iptal',
  };

  const statusTone: Record<string, string> = {
    PAID: 'bg-emerald-500/15 text-emerald-700',
    RECEIVED: 'bg-sky-500/15 text-sky-700',
    SHIPPED: 'bg-amber-500/15 text-amber-700',
    IN_TRANSIT: 'bg-blue-500/15 text-blue-700',
    DELIVERED: 'bg-emerald-500/15 text-emerald-700',
    PENDING: 'bg-amber-500/15 text-amber-700',
    FAILED: 'bg-rose-500/15 text-rose-700',
    CANCELED: 'bg-slate-500/15 text-slate-700',
  };

  const progressSteps = [
    { key: 'RECEIVED', label: 'Siparisiniz alindi' },
    { key: 'IN_TRANSIT', label: 'Siparisiniz hazirlaniyor' },
    { key: 'SHIPPED', label: 'Kargoya verildi' },
    { key: 'DELIVERED', label: 'Teslim edildi' },
  ];
  const statusAccent: Record<string, { dot: string; line: string; glow: string }> = {
    RECEIVED: { dot: 'bg-amber-500', line: 'bg-amber-400', glow: 'shadow-[0_0_0_4px_rgba(251,191,36,0.2)]' },
    IN_TRANSIT: { dot: 'bg-orange-500', line: 'bg-orange-400', glow: 'shadow-[0_0_0_4px_rgba(249,115,22,0.2)]' },
    SHIPPED: { dot: 'bg-sky-500', line: 'bg-sky-400', glow: 'shadow-[0_0_0_4px_rgba(14,165,233,0.2)]' },
    DELIVERED: { dot: 'bg-emerald-500', line: 'bg-emerald-500', glow: 'shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' },
    PAID: { dot: 'bg-amber-500', line: 'bg-amber-400', glow: 'shadow-[0_0_0_4px_rgba(251,191,36,0.2)]' },
    PENDING: { dot: 'bg-amber-500', line: 'bg-amber-400', glow: 'shadow-[0_0_0_4px_rgba(251,191,36,0.2)]' },
  };
  const statusToStep: Record<string, number> = {
    RECEIVED: 0,
    IN_TRANSIT: 1,
    SHIPPED: 2,
    DELIVERED: 3,
    PAID: 0,
    PENDING: 0,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-48 h-72 w-72 rounded-full bg-slate-200/70 blur-3xl" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          <div className="rounded-32 bg-slate-950 px-6 py-8 text-white shadow-2xl sm:px-10 sm:py-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-400 text-slate-900 font-semibold">
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

          <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="space-y-4">
              <div className="rounded-24 bg-slate-900 p-5 text-white shadow-xl">
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">Siparis ozeti</div>
                <div className="mt-3 text-3xl font-semibold">{orders.length}</div>
                <div className="text-sm text-white/70">Toplam siparis</div>
                {latestOrder && (
                  <div className="mt-4 rounded-20 bg-white/10 p-3 text-xs text-white/70">
                    Son siparis: {formatDate(latestOrder.createdAt)}
                  </div>
                )}
              </div>

              <div className="rounded-24 border border-slate-200 bg-white p-5 shadow-lg">
                <div className="text-sm font-semibold text-slate-900">Hizli erisim</div>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href="/spare-parts"
                    className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                  >
                    Yeni urun kesfet
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Destek al
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href="/profile" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                    Hesap yonetimine don
                  </Link>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">Siparislerim</h2>
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
                <Link
                  key={order.id}
                  href={`/profile/orders/${order.id}`}
                  className="block rounded-24 border border-slate-200 bg-white/90 p-6 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                    <span>Durum</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                        statusTone[order.status as keyof typeof statusTone] || 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {statusLabel[order.status as keyof typeof statusLabel] || order.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Siparis #{order.id.slice(0, 8)}</div>
                      <div className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</div>
                    </div>
                  </div>

                  {typeof statusToStep[order.status] === 'number' && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-slate-400">
                        <span>Durum akisi</span>
                        <span>{progressSteps[statusToStep[order.status]].label}</span>
                      </div>
                      <div className="relative mt-3">
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-slate-200" />
                        <div
                          className={`absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full ${
                            (statusAccent[order.status] || statusAccent.RECEIVED).line
                          }`}
                          style={{
                            width: `${(statusToStep[order.status] / (progressSteps.length - 1)) * 100}%`,
                          }}
                        />
                        {progressSteps.map((step, index) => {
                          const isActive = index <= statusToStep[order.status];
                          const isCurrent = index === statusToStep[order.status];
                          const accent = statusAccent[order.status] || statusAccent.RECEIVED;
                          return (
                            <div key={step.key} className="relative z-10 flex flex-1 items-center justify-center">
                              <div
                                className={`h-3 w-3 rounded-full ${
                                  isActive ? `border-0 ${accent.dot}` : 'border border-slate-200 bg-white'
                                } ${isCurrent ? `${accent.glow} scale-110` : ''}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-slate-500">
                        {progressSteps.map((step) => (
                          <span key={`${order.id}-${step.key}`} className="w-full text-center">
                            {step.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid gap-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 text-sm text-slate-700">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-100">
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    width={48}
                                    height={48}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                    Urun
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="line-clamp-1 font-semibold text-slate-900">{item.name}</div>
                                <div className="text-xs text-slate-500">
                                  {item.quantity} adet - {formatPriceTry(item.priceCents)}
                                </div>
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
                </Link>
              ))}
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
