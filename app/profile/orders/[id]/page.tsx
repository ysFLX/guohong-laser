import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type OrderItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  priceCents: number;
  sparePartId?: string | null;
};

type Order = {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: Date;
  items: OrderItem[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  stripeSessionId: string | null;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
};

type Address = {
  id: string;
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

const prismaOrders = prisma as unknown as {
  order: {
    findFirst: (args: unknown) => Promise<Order | null>;
    update: (args: unknown) => Promise<{ id: string }>;
  };
  address: {
    findFirst: (args: unknown) => Promise<{ id: string } | null>;
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

function formatAddress(address: Address | null) {
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

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const next = id ? `/profile/orders/${id}` : '/profile/orders';
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (!id) {
    notFound();
  }

  let order = await prismaOrders.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true, shippingAddress: true, billingAddress: true },
  });

  if (!order) {
    notFound();
  }

  if (!order.shippingAddressId && order.stripeSessionId) {
    try {
      const stripe = getStripe();
      const checkout = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      const addressId =
        typeof checkout.metadata?.addressId === 'string' ? checkout.metadata.addressId : '';
      const billingId =
        typeof checkout.metadata?.billingAddressId === 'string' ? checkout.metadata.billingAddressId : '';

      if (addressId) {
        const shipping = await prismaOrders.address.findFirst({
          where: { id: addressId, userId: session.user.id },
          select: { id: true },
        });

        const billing =
          billingId && billingId !== addressId
            ? await prismaOrders.address.findFirst({
                where: { id: billingId, userId: session.user.id },
                select: { id: true },
              })
            : null;

        if (shipping) {
          await prismaOrders.order.update({
            where: { id: order.id },
            data: {
              shippingAddressId: shipping.id,
              billingAddressId: billing?.id ?? shipping.id,
            },
          });

          order = await prismaOrders.order.findFirst({
            where: { id, userId: session.user.id },
            include: { items: true, shippingAddress: true, billingAddress: true },
          });

          if (!order) {
            notFound();
          }
        }
      }
    } catch {}
  }

  const safeOrder = order!;

  const statusLabel: Record<string, string> = {
    RECEIVED: 'Sipariş alındı',
    SHIPPED: 'Kargoya verildi',
    IN_TRANSIT: 'Sipariş hazırlanıyor',
    DELIVERED: 'Teslim edildi',
    CANCELED: 'İptal',
  };

  const statusTone: Record<string, string> = {
    RECEIVED: 'bg-indigo-500/15 text-indigo-700',
    SHIPPED: 'bg-amber-500/15 text-amber-700',
    IN_TRANSIT: 'bg-blue-500/15 text-blue-700',
    DELIVERED: 'bg-indigo-500/15 text-indigo-700',
    CANCELED: 'bg-slate-500/15 text-slate-700',
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
    RECEIVED: { dot: 'bg-amber-500', line: 'bg-amber-400', glow: 'shadow-[0_0_0_4px_rgba(251,191,36,0.2)]' },
    IN_TRANSIT: { dot: 'bg-indigo-500', line: 'bg-indigo-400', glow: 'shadow-[0_0_0_4px_rgba(249,115,22,0.2)]' },
    SHIPPED: { dot: 'bg-indigo-500', line: 'bg-indigo-400', glow: 'shadow-[0_0_0_4px_rgba(14,165,233,0.2)]' },
    DELIVERED: { dot: 'bg-indigo-500', line: 'bg-indigo-500', glow: 'shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' },
  };
  const statusToStep: Record<string, number> = {
    RECEIVED: 0,
    IN_TRANSIT: 1,
    SHIPPED: 2,
    DELIVERED: 3,
  };

  const statusTimeline = progressSteps.map((step, index) => {
    const isReached = typeof statusToStep[displayStatus] === 'number' && index <= statusToStep[displayStatus];
    const hasDate = index === 0;
    return {
      ...step,
      isReached,
      dateLabel: hasDate ? formatDate(safeOrder.createdAt) : isReached ? 'Güncellenecek' : 'Planlanıyor',
    };
  });

  const displayStatus = normalizeStatus(safeOrder.status);
  const shippingView = formatAddress(safeOrder.shippingAddress);
  const billingView = formatAddress(safeOrder.billingAddress);
  const billingSame =
    safeOrder.billingAddressId &&
    safeOrder.shippingAddressId &&
    safeOrder.billingAddressId === safeOrder.shippingAddressId;
  const hasTracking = Boolean(
    safeOrder.shippingCarrier || safeOrder.trackingNumber || safeOrder.trackingUrl,
  );
  const invoiceParams = new URLSearchParams({
    subject: `Fatura Talebi - ${safeOrder.id.slice(0, 8)}`,
  }).toString();
  const itemCount = safeOrder.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-200 dark:[&_.bg-white]:bg-slate-900/80 dark:[&_.border-slate-200]:border-white/10 dark:[&_.text-slate-900]:text-white dark:[&_.text-slate-700]:text-slate-200 dark:[&_.text-slate-600]:text-slate-300 dark:[&_.text-slate-500]:text-slate-400 dark:[&_.text-slate-400]:text-slate-300 dark:[&_.bg-slate-50]:bg-slate-900/60">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />
        <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-500/10" />

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/profile/orders" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              Siparişlerime dön
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
              Güncel durum
            </div>
          </div>

          <div className="mt-6 rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur dark:bg-slate-900/70">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  Sipariş özeti
                </div>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                  #{safeOrder.id.slice(0, 8)}
                </h1>
                <div className="mt-2 text-sm text-slate-600">{formatDate(safeOrder.createdAt)}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                    statusTone[displayStatus as keyof typeof statusTone] || 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {statusLabel[displayStatus as keyof typeof statusLabel] || displayStatus}
                </div>
                <Link
                  href={`/contact?${invoiceParams}`}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:bg-slate-50 dark:text-slate-200"
                >
                  Fatura talebi
                </Link>
                <Link
                  href="/returns-request"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:bg-slate-50 dark:text-slate-200"
                >
                  İade talebi
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Toplam</div>
                <div className="mt-2 text-2xl font-semibold text-slate-900">
                  {formatPriceTry(safeOrder.totalCents)}
                </div>
                <div className="mt-1 text-xs text-slate-500">{itemCount} ürün</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Kargo</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {safeOrder.shippingCarrier || 'Bilgi bekleniyor'}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {safeOrder.trackingNumber ? `Takip no: ${safeOrder.trackingNumber}` : 'Takip eklenince görünür'}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Teslimat</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {shippingView?.city || '-'}
                </div>
                <div className="mt-1 text-xs text-slate-500">{shippingView?.fullName || '-'}</div>
              </div>
            </div>
          </div>

          {typeof statusToStep[displayStatus] === 'number' && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm dark:bg-slate-900/70">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.25em] text-slate-400">
                <span>Durum akışı</span>
                <span>{progressSteps[statusToStep[displayStatus]].label}</span>
              </div>
              <div className="mt-4">
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
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {statusTimeline.map((step) => (
                  <div
                    key={step.key}
                    className={`rounded-2xl border border-slate-200 px-3 py-3 text-left text-xs ${
                      step.isReached ? 'bg-slate-50/80' : 'bg-white/70'
                    } dark:border-white/10 dark:bg-slate-900/60`}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {step.label}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{step.dateLabel}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                      {step.isReached ? 'Tamamlandı' : 'Beklemede'}
                    </div>
                  </div>
                ))}
              </div>
          </div>
        )}

          <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:bg-slate-900/70">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sipariş detayları</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">Ürünler ve kalemler</div>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {itemCount} ürün
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {safeOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:bg-slate-900/40"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                            Ürün
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold text-slate-900">{item.name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.quantity} adet • {formatPriceTry(item.priceCents)}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
                          <span className="rounded-full bg-indigo-500/15 px-2 py-1 text-indigo-600">
                            Stokta
                          </span>
                          <span className="rounded-full bg-indigo-500/15 px-2 py-1 text-indigo-600">
                            2-3 gün teslim
                          </span>
                          <span className="rounded-full bg-slate-900/10 px-2 py-1 text-slate-600 dark:bg-white/10 dark:text-slate-200">
                            {statusLabel[displayStatus as keyof typeof statusLabel] || displayStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tutar</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {formatPriceTry(item.priceCents * item.quantity)}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                        <Link
                          href={item.sparePartId ? `/spare-parts/${item.sparePartId}` : '/spare-parts'}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Detay
                        </Link>
                        <Link
                          href={item.sparePartId ? `/spare-parts/${item.sparePartId}` : '/spare-parts'}
                          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Tekrar satin al
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:bg-slate-900/60">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sipariş notu</div>
                  <div className="mt-2 text-slate-600">Sisteme kayıtlı özel bir not bulunmuyor.</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:bg-slate-900/60">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Hızlı aksiyonlar</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {safeOrder.trackingUrl ? (
                      <a
                        href={safeOrder.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Kargo takip
                      </a>
                    ) : null}
                    <Link
                      href={`/contact?${invoiceParams}`}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Fatura iste
                    </Link>
                    <Link
                      href="/returns-request"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      İade talebi
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm dark:bg-slate-900/60">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Sipariş zaman çizelgesi
                    </div>
                    <div className="mt-2 text-slate-600">
                      Durum güncellendikçe zaman damgası eklenir.
                    </div>
                  </div>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    {statusLabel[displayStatus as keyof typeof statusLabel] || displayStatus}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:bg-slate-900/40">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Oluşturuldu</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{formatDate(safeOrder.createdAt)}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:bg-slate-900/40">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Hazırlanıyor</div>
                    <div className="mt-2 text-sm text-slate-600">Duruma göre otomatik</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:bg-slate-900/40">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Teslim</div>
                    <div className="mt-2 text-sm text-slate-600">
                      {displayStatus === 'DELIVERED' ? 'Teslim edildi' : 'Planlama aşamasında'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm dark:bg-slate-900/60">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Teslimat notları</div>
                  <ul className="mt-3 space-y-2 text-slate-600">
                    <li>• Paket tesliminde kimlik teyidi alinabilir.</li>
                    <li>• Hasarlı teslimatlar için 24 saat içinde bildirim yap.</li>
                    <li>• Kargo gecikmelerinde destek ekibi bilgi verir.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm dark:bg-slate-900/60">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Yardım ve destek</div>
                  <div className="mt-3 text-slate-600">
                    Teknik destek ve fatura soruları için doğrudan ekibe ulaşabilirsin.
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Destek ekibi
                    </Link>
                    <Link
                      href={`/contact?${invoiceParams}`}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Fatura sorusu
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:bg-slate-900/70">
              <div className="text-lg font-semibold text-slate-900">Ozet</div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-600">Toplam</span>
                <span className="font-semibold text-slate-900">{formatPriceTry(safeOrder.totalCents)}</span>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm dark:bg-slate-900/60">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Sipariş durumu
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      statusTone[displayStatus as keyof typeof statusTone] || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {statusLabel[displayStatus as keyof typeof statusLabel] || displayStatus}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm dark:bg-slate-900/60">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Teslimat adresi
                </div>
                {shippingView ? (
                  <div className="mt-2 space-y-1 text-slate-700">
                    <div className="font-semibold text-slate-900">{shippingView.title}</div>
                    <div>{shippingView.fullName}</div>
                    <div>{shippingView.line1}</div>
                    <div>{shippingView.city}</div>
                    <div>{shippingView.phone}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-slate-600">Adres bilgisi bulunamadı.</div>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm dark:bg-slate-900/60">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Kargo takibi
                </div>
                {hasTracking ? (
                  <div className="mt-2 space-y-2 text-slate-700">
                    {safeOrder.shippingCarrier && (
                      <div>
                        <span className="text-slate-500">Firma:</span> {safeOrder.shippingCarrier}
                      </div>
                    )}
                    {safeOrder.trackingNumber && (
                      <div>
                        <span className="text-slate-500">Takip no:</span> {safeOrder.trackingNumber}
                      </div>
                    )}
                    {safeOrder.trackingUrl && (
                      <a
                        href={safeOrder.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Kargo takip sayfasına git
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 text-slate-600">
                    Takip bilgisi henüz girilmedi. Kargo bilgisi girildiğinde e-posta ile bilgilendirileceksiniz.
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm dark:bg-slate-900/60">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Fatura adresi
                </div>
                {billingSame && shippingView ? (
                  <div className="mt-2 text-slate-700">Teslimat adresi ile aynı.</div>
                ) : billingView ? (
                  <div className="mt-2 space-y-1 text-slate-700">
                    <div className="font-semibold text-slate-900">{billingView.title}</div>
                    <div>{billingView.fullName}</div>
                    <div>{billingView.line1}</div>
                    <div>{billingView.city}</div>
                    <div>{billingView.phone}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-slate-600">Adres bilgisi bulunamadı.</div>
                )}
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm dark:bg-slate-900/60">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Fatura ve irsaliye
                </div>
                <div className="mt-2 text-slate-600">
                  Fatura ve irsaliye, sipariş onayıyla birlikte e-posta ile paylaşılır. Talep etmek istersen destek ekibi
                  hızlıca yönlendirilir.
                </div>
                <Link
                  href={`/contact?${invoiceParams}`}
                  className="mt-3 inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Fatura talebi gönder
                </Link>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm dark:bg-slate-900/60">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  İade işlemleri
                </div>
                <div className="mt-2 text-slate-600">
                  Ürün iade veya değişim talebini form üzerinden başlatabilirsiniz.
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Talep alındı</span>
                    <span className="font-semibold">Beklemede</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900/40">
                    <div className="h-2 w-1/4 rounded-full bg-amber-400" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>İnceleme</span>
                    <span>Hazırlanıyor</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Sonuç</span>
                    <span>Bilgilendirilecek</span>
                  </div>
                </div>
                <Link
                  href="/returns-request"
                  className="mt-3 inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  İade talebi oluştur
                </Link>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/60">
                Sipariş durumunuz güncellendikçe burada görünür.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

