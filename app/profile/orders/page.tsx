import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import BuyAgainButton, { type BuyAgainItem } from '@/components/profile/BuyAgainButton';

type OrderItem = {
  id: string;
  sparePartId: string | null;
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
  shippingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
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

function normalizeStatus(value: string) {
  if (value === 'PAID' || value === 'PENDING' || value === 'FAILED') {
    return 'RECEIVED';
  }
  return value;
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login?next=/profile/orders');
  }

  const orders = await prismaOrders.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  const hasOrders = orders.length > 0;
  const latestOrder = hasOrders ? orders[0] : null;

  const statusLabel: Record<string, string> = {
    RECEIVED: 'Sipariş alındı',
    SHIPPED: 'Kargoya verildi',
    IN_TRANSIT: 'Sipariş hazırlanıyor',
    DELIVERED: 'Teslim edildi',
    CANCELED: 'İptal',
  };

  const statusTone: Record<string, string> = {
    RECEIVED: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-200',
    IN_TRANSIT: 'bg-amber-500/15 text-amber-700 dark:text-amber-200',
    SHIPPED: 'bg-sky-500/15 text-sky-700 dark:text-sky-200',
    DELIVERED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
    CANCELED: 'bg-rose-500/15 text-rose-700 dark:text-rose-200',
  };

  const progressSteps = [
    { key: 'RECEIVED', label: 'Siparişiniz alındı' },
    { key: 'IN_TRANSIT', label: 'Siparişiniz hazırlanıyor' },
    { key: 'SHIPPED', label: 'Kargoya verildi' },
    { key: 'DELIVERED', label: 'Teslim edildi' },
  ];
  const lineLeftPercent = 100 / (progressSteps.length * 2);
  const lineWidthPercent = 100 - lineLeftPercent * 2;
  const statusAccent: Record<string, { dot: string; line: string; glow: string }> = {
    RECEIVED: { dot: 'bg-indigo-500', line: 'bg-indigo-400', glow: 'shadow-[0_0_0_4px_rgba(99,102,241,0.22)]' },
    IN_TRANSIT: { dot: 'bg-amber-500', line: 'bg-amber-400', glow: 'shadow-[0_0_0_4px_rgba(245,158,11,0.22)]' },
    SHIPPED: { dot: 'bg-sky-500', line: 'bg-sky-400', glow: 'shadow-[0_0_0_4px_rgba(14,165,233,0.22)]' },
    DELIVERED: { dot: 'bg-emerald-500', line: 'bg-emerald-500', glow: 'shadow-[0_0_0_4px_rgba(16,185,129,0.22)]' },
  };
  const statusToStep: Record<string, number> = {
    RECEIVED: 0,
    IN_TRANSIT: 1,
    SHIPPED: 2,
    DELIVERED: 3,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-200 dark:[&_.bg-white]:bg-slate-900/70 dark:[&_[class*='bg-white/90']]:bg-slate-900/70 dark:[&_[class*='bg-white/80']]:bg-slate-900/70 dark:[&_[class*='bg-slate-50/70']]:bg-slate-900/60 dark:[&_[class*='border-slate-200/70']]:border-white/10 dark:[&_.border-slate-200]:border-white/10 dark:[&_.text-slate-900]:text-white dark:[&_.text-slate-700]:text-slate-200 dark:[&_.text-slate-600]:text-slate-300 dark:[&_.text-slate-500]:text-slate-400 dark:[&_.text-slate-400]:text-slate-300">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />
        <div className="pointer-events-none absolute -left-32 top-48 h-72 w-72 rounded-full bg-slate-200/70 blur-3xl dark:bg-slate-800/60" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          <div className="rounded-32 bg-slate-950 px-6 py-8 text-white shadow-2xl sm:px-10 sm:py-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-400 text-slate-900 font-semibold">
                  {(session.user.name?.[0] || session.user.email?.[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">Hesabım</h1>
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
                Profil Sayfası
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="space-y-4">
              <div className="rounded-24 bg-slate-900 p-5 text-white shadow-xl">
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">Sipariş Özeti</div>
                <div className="mt-3 text-3xl font-semibold">{orders.length}</div>
                <div className="text-sm text-white/70">Toplam sipariş</div>
                {latestOrder && (
                  <div className="mt-4 rounded-20 bg-white/10 p-3 text-xs text-white/70">
                    Son sipariş: {formatDate(latestOrder.createdAt)}
                  </div>
                )}
              </div>

              <div className="rounded-24 border border-slate-200 bg-white p-5 shadow-lg dark:border-white/10 dark:bg-slate-900/70">
                <div className="text-sm font-semibold text-slate-900">Hızlı erişim</div>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href="/spare-parts"
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Yeni ürün keşfet
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

            <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-xl dark:border-white/10 dark:bg-slate-900/70">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href="/profile" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    Hesap yönetimine dön
                  </Link>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">Siparişlerim</h2>
                  <p className="mt-1 text-sm text-slate-600">Tüm siparişleriniz burada listelenir.</p>
                </div>
                <Link href="/spare-parts" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  Yeni ürün keşfet
                </Link>
              </div>

              {!hasOrders && (
                <div className="mt-8 rounded-24 border border-dashed border-slate-200 bg-white/90 p-6 dark:border-white/10 dark:bg-slate-900/60">
                  <div className="text-sm font-semibold text-slate-900">Henüz sipariş yok</div>
                  <p className="mt-2 text-sm text-slate-600">
                    Sepetinize ürün ekleyip siparişinizi tamamladığınızda burada görebilirsiniz.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/spare-parts"
                      className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      Yedek parçalar
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
                {orders.map((order) => {
                  const displayStatus = normalizeStatus(order.status);
                  const hasTracking = Boolean(order.shippingCarrier || order.trackingNumber || order.trackingUrl);
                  const buyAgainItems: BuyAgainItem[] = order.items
                    .filter((item) => typeof item.sparePartId === 'string' && item.sparePartId.length > 0)
                    .map((item) => ({
                      id: item.sparePartId as string,
                      name: item.name,
                      priceCents: item.priceCents,
                      quantity: item.quantity,
                      imageUrl: item.imageUrl,
                    }));
                  const returnParams = new URLSearchParams({
                    orderId: order.id,
                    itemName: order.items[0]?.name || '',
                  }).toString();
                  const invoiceParams = new URLSearchParams({
                    subject: `Fatura Talebi - ${order.id.slice(0, 8)}`,
                    message: `Merhaba,\n\n${order.id} numaralı siparişim için fatura talep ediyorum.\n\nTeşekkürler.`,
                  }).toString();
                  return (
                  <div
                    key={order.id}
                    className="block rounded-24 border border-slate-200 bg-white/90 p-6 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/70"
                  >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                    <span>Durum</span>
                    <div className="flex items-center gap-2">
                      {order.trackingUrl ? (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600 hover:border-slate-300 hover:text-slate-900"
                        >
                          Kargo takip
                        </a>
                      ) : null}
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                           statusTone[displayStatus as keyof typeof statusTone] ||
                           'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200'
                         }`}
                       >
                         {statusLabel[displayStatus as keyof typeof statusLabel] || displayStatus}
                       </span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link
                        href={`/profile/orders/${order.id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-indigo-600"
                      >
                        Sipariş #{order.id.slice(0, 8)}
                      </Link>
                      <div className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</div>
                    </div>
                  </div>

                  {typeof statusToStep[displayStatus] === 'number' && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-slate-400">
                        <span>Durum akışı</span>
                        <span>{progressSteps[statusToStep[displayStatus]].label}</span>
                      </div>
                      <div className="mt-3">
                        <div className="relative grid grid-cols-4 gap-0 pt-1 text-center">
                          <div
                            className="absolute top-3 h-0.5 -translate-y-1/2 rounded-full bg-slate-200 dark:bg-white/10"
                            style={{ left: `${lineLeftPercent}%`, width: `${lineWidthPercent}%` }}
                          />
                          <div
                            className={`absolute top-3 h-0.5 -translate-y-1/2 rounded-full ${
                              (statusAccent[displayStatus] || statusAccent.RECEIVED).line
                            }`}
                            style={{
                              left: `${lineLeftPercent}%`,
                              width: `${(statusToStep[displayStatus] / (progressSteps.length - 1)) * lineWidthPercent}%`,
                            }}
                          />
                          {progressSteps.map((step, index) => {
                            const isActive = index <= statusToStep[displayStatus];
                            const isCurrent = index === statusToStep[displayStatus];
                            const accent = statusAccent[displayStatus] || statusAccent.RECEIVED;
                            return (
                              <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                                <div
                                  className={`h-3.5 w-3.5 rounded-full ${
                                    isActive ? `border-0 ${accent.dot}` : 'border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70'
                                  } ${isCurrent ? `${accent.glow} scale-110` : ''}`}
                                />
                                <span className="text-center text-xs text-slate-500">{step.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid gap-4">
                        {order.items.map((item) => {
                          const productHref = item.sparePartId ? `/spare-parts/${item.sparePartId}` : null;
                          const content = (
                            <>
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
                                    Ürün
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="line-clamp-1 font-semibold text-slate-900">{item.name}</div>
                                <div className="text-xs text-slate-500">
                                  {item.quantity} adet - {formatPriceTry(item.priceCents)}
                                </div>
                              </div>
                            </>
                          );
                          return (
                            <div key={item.id} className="flex items-center justify-between gap-3 text-sm text-slate-700">
                              <div className="flex min-w-0 items-center gap-3">
                                {productHref ? (
                                  <Link href={productHref} className="flex items-center gap-3 hover:text-indigo-600">
                                    {content}
                                  </Link>
                                ) : (
                                  <div className="flex items-center gap-3">{content}</div>
                                )}
                              </div>
                              <div className="text-sm font-semibold text-slate-900">
                                {formatPriceTry(item.priceCents * item.quantity)}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                  {hasTracking && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600 dark:border-white/10 dark:bg-slate-900/60">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Kargo takibi
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {order.shippingCarrier && (
                          <span>
                            <span className="text-slate-500">Firma:</span> {order.shippingCarrier}
                          </span>
                        )}
                        {order.trackingNumber && (
                          <span>
                            <span className="text-slate-500">Takip no:</span> {order.trackingNumber}
                          </span>
                        )}
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-white"
                          >
                            Takip linki
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                    {!hasTracking && (displayStatus === 'SHIPPED' || displayStatus === 'DELIVERED') && (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600">
                          Kargo bilgisi bekleniyor
                        </div>
                        <div className="mt-1">
                          Kargo firması ve takip numarası admin tarafından eklendiğinde burada görünecek.
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      <BuyAgainButton
                        items={buyAgainItems}
                        className="rounded-full bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <Link
                        href={`/returns-request?${returnParams}`}
                        className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      >
                        İade / değişim talebi
                      </Link>
                      <Link
                        href={`/contact?${invoiceParams}`}
                        className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      >
                        Fatura talebi
                      </Link>
                      <Link
                        href={`/profile/orders/${order.id}`}
                        className="rounded-full bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
                      >
                        Sipariş detayı
                      </Link>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                      <span className="text-slate-600">Toplam</span>
                      <span className="font-semibold text-slate-900">{formatPriceTry(order.totalCents)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

