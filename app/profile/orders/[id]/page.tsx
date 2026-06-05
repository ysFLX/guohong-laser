import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import {
  formatFulfillmentTypeTr,
  getOrderProgressStepsTr,
  getOrderStatusLabelTr,
  normalizeFulfillmentType,
} from '@/lib/orderFulfillment';
import { prisma } from '@/lib/prisma';
import { VAT_PERCENTAGE, calculateVatTotals } from '@/lib/vat';
import BuyAgainButton from '@/components/profile/BuyAgainButton';

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
  fulfillmentType: string;
  totalCents: number;
  currency: string;
  createdAt: Date;
  items: OrderItem[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  shippingAddressId: string | null;
  billingAddressId: string | null;
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

type Invoice = {
  id: string;
  status: string;
  issuedAt: Date | null;
  invoiceNumber: string | null;
  ettn: string | null;
  errorMessage: string | null;
  pdfObjectPath: string | null;
  xmlObjectPath: string | null;
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

const prismaInvoices = prisma as unknown as {
  invoice: {
    findUnique: (args: unknown) => Promise<Invoice | null>;
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

  const order = await prismaOrders.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: true,
      shippingAddress: {
        select: {
          id: true,
          label: true,
          fullName: true,
          phone: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
        },
      },
      billingAddress: {
        select: {
          id: true,
          label: true,
          fullName: true,
          phone: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const safeOrder = order!;
  let invoice: Invoice | null = null;
  try {
    invoice = await prismaInvoices.invoice.findUnique({
      where: { orderId: safeOrder.id },
      select: {
        id: true,
        status: true,
        issuedAt: true,
        invoiceNumber: true,
        ettn: true,
        errorMessage: true,
        pdfObjectPath: true,
        xmlObjectPath: true,
      },
    });
  } catch {}

  const statusTone: Record<string, string> = {
    RECEIVED: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-200',
    IN_TRANSIT: 'bg-amber-500/15 text-amber-700 dark:text-amber-200',
    SHIPPED: 'bg-sky-500/15 text-sky-700 dark:text-sky-200',
    DELIVERED: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
    CANCELED: 'bg-rose-500/15 text-rose-700 dark:text-rose-200',
  };

  const progressSteps = getOrderProgressStepsTr(safeOrder.fulfillmentType);
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

  const displayStatus = normalizeStatus(safeOrder.status);
  const statusLabelText = getOrderStatusLabelTr(displayStatus, safeOrder.fulfillmentType);
  const fulfillmentType = normalizeFulfillmentType(safeOrder.fulfillmentType);

  const statusTimeline = progressSteps.map((step, index) => {
    const isReached = typeof statusToStep[displayStatus] === 'number' && index <= statusToStep[displayStatus];
    const hasDate = index === 0;
    return {
      ...step,
      isReached,
      dateLabel: hasDate ? formatDate(safeOrder.createdAt) : isReached ? 'Güncellenecek' : 'Planlanıyor',
    };
  });

  const shippingView = formatAddress(safeOrder.shippingAddress);
  const billingView = formatAddress(safeOrder.billingAddress);
  const billingSame =
    safeOrder.billingAddressId &&
    safeOrder.shippingAddressId &&
    safeOrder.billingAddressId === safeOrder.shippingAddressId;
  const hasTracking = fulfillmentType === 'SHIPPING' && Boolean(
    safeOrder.shippingCarrier || safeOrder.trackingNumber || safeOrder.trackingUrl,
  );
  const invoiceParams = new URLSearchParams({
    subject: `Fatura Talebi - ${safeOrder.id.slice(0, 8)}`,
    message: `Merhaba,\n\n${safeOrder.id} numaralı siparişim için fatura talep ediyorum.\n\nTeşekkürler.`,
  }).toString();
  const supportParams = new URLSearchParams({
    subject: `Sipariş desteği - ${safeOrder.id.slice(0, 8)}`,
    message:
      fulfillmentType === 'PICKUP'
        ? `Merhaba,\n\n${safeOrder.id} numaralı gel al siparişim için teslim alma detayını kontrol edebilir misiniz?\n\nTeşekkürler.`
        : `Merhaba,\n\n${safeOrder.id} numaralı siparişimde teslimat adresi bilgisi görünmüyor. Kontrol edebilir misiniz?\n\nTeşekkürler.`,
  }).toString();
  const itemCount = safeOrder.items.reduce((acc, item) => acc + item.quantity, 0);
  const orderSubtotalCents = calculateVatTotals(safeOrder.items).subtotalCents;
  const orderVatCents = Math.max(0, safeOrder.totalCents - orderSubtotalCents);

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
                    statusTone[displayStatus as keyof typeof statusTone] ||
                    'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200'
                  }`}
                >
                  {statusLabelText}
                </div>
                {fulfillmentType === 'SHIPPING' && safeOrder.trackingUrl ? (
                  <a
                    href={safeOrder.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm hover:bg-indigo-700"
                  >
                    Kargo takip
                  </a>
                ) : null}
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
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {fulfillmentType === 'PICKUP' ? 'Teslimat tipi' : 'Kargo'}
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {fulfillmentType === 'PICKUP' ? formatFulfillmentTypeTr(fulfillmentType) : safeOrder.shippingCarrier || 'Bilgi bekleniyor'}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {fulfillmentType === 'PICKUP'
                    ? displayStatus === 'SHIPPED'
                      ? 'Sipariş mağazadan teslim alınmaya hazır.'
                      : 'Hazırlık bilgisi durum akışında görünür.'
                    : safeOrder.trackingNumber
                      ? `Takip no: ${safeOrder.trackingNumber}`
                      : 'Takip eklenince görünür'}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Teslimat</div>
                <div className="mt-2 text-sm font-semibold text-slate-900">
                  {fulfillmentType === 'PICKUP' ? 'Magazadan teslim' : shippingView?.city || '-'}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {fulfillmentType === 'PICKUP' ? billingView?.fullName || '-' : shippingView?.fullName || '-'}
                </div>
              </div>
            </div>

            {!shippingView && fulfillmentType === 'SHIPPING' && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 px-5 py-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
                <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-200">
                  Adres bilgisi bekleniyor
                </div>
                <p className="mt-2 text-sm text-amber-800 dark:text-amber-100/90">
                  Sipariş yeni oluşturulduysa teslimat adresi birkaç dakika içinde güncellenebilir. Hâlâ görünmüyorsa destek ekibi hızlıca kontrol eder.
                </p>
                <Link
                  href={`/contact?${supportParams}`}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-amber-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 hover:bg-white dark:border-amber-400/30 dark:bg-white/10 dark:text-amber-100 dark:hover:bg-white/15"
                >
                  Destekle iletişime geç
                </Link>
              </div>
            )}
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
                          {item.quantity} adet â€¢ {formatPriceTry(item.priceCents)} KDV hariç
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em]">
                          <span className="rounded-full bg-indigo-500/15 px-2 py-1 text-indigo-600">
                            Stokta
                          </span>
                          <span className="rounded-full bg-indigo-500/15 px-2 py-1 text-indigo-600">
                            {fulfillmentType === 'PICKUP' ? 'Mağaza teslim' : '2-3 gün teslim'}
                          </span>
                          <span className="rounded-full bg-slate-900/10 px-2 py-1 text-slate-600 dark:bg-white/10 dark:text-slate-200">
                            {statusLabelText}
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
                        <BuyAgainButton
                          items={
                            item.sparePartId
                              ? [
                                  {
                                    id: item.sparePartId,
                                    name: item.name,
                                    priceCents: item.priceCents,
                                    quantity: item.quantity,
                                    imageUrl: item.imageUrl,
                                  },
                                ]
                              : []
                          }
                          label="Tekrar satın al"
                          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        />
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
                    {fulfillmentType === 'SHIPPING' && safeOrder.trackingUrl ? (
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
                    {statusLabelText}
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
                    <li>{fulfillmentType === 'PICKUP' ? 'Mağazaya gelmeden önce sipariş durumunu kontrol edin.' : 'Paket tesliminde kimlik teyidi alınabilir.'}</li>
                    <li>{fulfillmentType === 'PICKUP' ? 'Teslim alırken sipariş numaranızı paylaşın.' : 'Hasarlı teslimatlar için 24 saat içinde bildirim yapın.'}</li>
                    <li>{fulfillmentType === 'PICKUP' ? 'Hazirlik tamamlandiginda ekip sizi bilgilendirir.' : 'Kargo gecikmelerinde destek ekibi bilgi verir.'}</li>
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
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Ara toplam (KDV hariç)</span>
                  <span className="font-semibold text-slate-900">{formatPriceTry(orderSubtotalCents)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{`KDV (%${VAT_PERCENTAGE})`}</span>
                  <span className="font-semibold text-slate-900">{formatPriceTry(orderVatCents)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="font-semibold text-slate-900">Genel toplam</span>
                  <span className="font-bold text-slate-900">{formatPriceTry(safeOrder.totalCents)}</span>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm dark:bg-slate-900/60">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Sipariş durumu
                </div>
                <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                      statusTone[displayStatus as keyof typeof statusTone] ||
                      'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200'
                      }`}
                    >
                      {statusLabelText}
                    </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm dark:bg-slate-900/60">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {fulfillmentType === 'PICKUP' ? 'Teslim alacak kişi / fatura bilgisi' : 'Teslimat adresi'}
                </div>
                {fulfillmentType === 'PICKUP' && billingView ? (
                  <div className="mt-2 space-y-1 text-slate-700">
                    <div className="font-semibold text-slate-900">{billingView.title}</div>
                    <div>{billingView.fullName}</div>
                    <div>{billingView.line1}</div>
                    <div>{billingView.city}</div>
                    <div>{billingView.phone}</div>
                  </div>
                ) : shippingView ? (
                  <div className="mt-2 space-y-1 text-slate-700">
                    <div className="font-semibold text-slate-900">{shippingView.title}</div>
                    <div>{shippingView.fullName}</div>
                    <div>{shippingView.line1}</div>
                    <div>{shippingView.city}</div>
                    <div>{shippingView.phone}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-slate-600">
                    Adres bilgisi henüz görünmüyor.{' '}
                    <Link href={`/contact?${supportParams}`} className="font-semibold text-indigo-600 hover:text-indigo-700">
                      Destek ekibiyle iletişime geç
                    </Link>
                    .
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm dark:bg-slate-900/60">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {fulfillmentType === 'PICKUP' ? 'Teslim alma durumu' : 'Kargo takibi'}
                </div>
                {fulfillmentType === 'PICKUP' ? (
                  <div className="mt-2 text-slate-600">
                    {displayStatus === 'SHIPPED'
                      ? 'Siparişiniz mağazadan teslim alınmaya hazır.'
                      : displayStatus === 'DELIVERED'
                        ? 'Siparişiniz mağazadan teslim edildi.'
                        : 'Sipariş hazırlık durumu güncellendikçe burada görünür.'}
                  </div>
                ) : hasTracking ? (
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
                {invoice ? (
                  invoice.status === 'ISSUED' ? (
                    <div className="mt-2 space-y-3 text-slate-700">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                          Fatura hazır
                        </span>
                        {invoice.invoiceNumber ? (
                          <span className="text-xs text-slate-500">
                            No: <span className="font-semibold text-slate-900">{invoice.invoiceNumber}</span>
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {invoice.pdfObjectPath ? (
                          <a
                            href={`/api/invoices/${invoice.id}/download?file=pdf`}
                            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                          >
                            PDF indir
                          </a>
                        ) : null}
                        {invoice.xmlObjectPath ? (
                          <a
                            href={`/api/invoices/${invoice.id}/download?file=xml`}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            XML indir
                          </a>
                        ) : null}
                        <Link
                          href={`/contact?${invoiceParams}`}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Fatura desteği
                        </Link>
                      </div>

                      {invoice.ettn ? (
                        <div className="text-xs text-slate-500">
                          ETTN: <span className="font-mono">{invoice.ettn}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : invoice.status === 'FAILED' ? (
                    <div className="mt-2 space-y-3">
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                        Fatura oluşturulamadı. Tekrar denenecek.
                        {invoice.errorMessage ? <div className="mt-1">{invoice.errorMessage}</div> : null}
                      </div>
                      <Link
                        href={`/contact?${invoiceParams}`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Fatura desteği
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-3 text-slate-600">
                      <div>Fatura hazırlanıyor. Kısa süre içinde indirilebilir olacak.</div>
                      <Link
                        href={`/contact?${invoiceParams}`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Fatura desteği
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="mt-2 space-y-3 text-slate-600">
                    <div>
                      Fatura ve irsaliye, sipariş onayıyla birlikte e-posta ile paylaşılır. Talep etmek istersen destek
                      ekibi hızlıca yönlendirilir.
                    </div>
                    <Link
                      href={`/contact?${invoiceParams}`}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Fatura talebi gönder
                    </Link>
                  </div>
                )}
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


