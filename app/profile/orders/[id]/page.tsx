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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id } = await params;
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
    RECEIVED: 'Siparis alindi',
    SHIPPED: 'Kargoya verildi',
    IN_TRANSIT: 'Siparis hazirlaniyor',
    DELIVERED: 'Teslim edildi',
    CANCELED: 'Iptal',
  };

  const statusTone: Record<string, string> = {
    RECEIVED: 'bg-sky-500/15 text-sky-700',
    SHIPPED: 'bg-amber-500/15 text-amber-700',
    IN_TRANSIT: 'bg-blue-500/15 text-blue-700',
    DELIVERED: 'bg-emerald-500/15 text-emerald-700',
    CANCELED: 'bg-slate-500/15 text-slate-700',
  };

  const progressSteps = [
    { key: 'RECEIVED', label: 'Siparisiniz alindi' },
    { key: 'IN_TRANSIT', label: 'Siparisiniz hazirlaniyor' },
    { key: 'SHIPPED', label: 'Kargoya verildi' },
    { key: 'DELIVERED', label: 'Teslim edildi' },
  ];
  const lineLeftPercent = 100 / (progressSteps.length * 2);
  const lineWidthPercent = 100 - lineLeftPercent * 2;
  const statusAccent: Record<string, { dot: string; line: string; glow: string }> = {
    RECEIVED: { dot: 'bg-amber-500', line: 'bg-amber-400', glow: 'shadow-[0_0_0_4px_rgba(251,191,36,0.2)]' },
    IN_TRANSIT: { dot: 'bg-teal-500', line: 'bg-teal-400', glow: 'shadow-[0_0_0_4px_rgba(249,115,22,0.2)]' },
    SHIPPED: { dot: 'bg-sky-500', line: 'bg-sky-400', glow: 'shadow-[0_0_0_4px_rgba(14,165,233,0.2)]' },
    DELIVERED: { dot: 'bg-emerald-500', line: 'bg-emerald-500', glow: 'shadow-[0_0_0_4px_rgba(16,185,129,0.2)]' },
  };
  const statusToStep: Record<string, number> = {
    RECEIVED: 0,
    IN_TRANSIT: 1,
    SHIPPED: 2,
    DELIVERED: 3,
  };

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/profile/orders" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
          Siparislerime don
        </Link>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Siparis #{safeOrder.id.slice(0, 8)}</h1>
            <div className="mt-1 text-sm text-slate-600">{formatDate(safeOrder.createdAt)}</div>
          </div>
          <div
            className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              statusTone[displayStatus as keyof typeof statusTone] || 'bg-slate-200 text-slate-700'
            }`}
          >
            {statusLabel[displayStatus as keyof typeof statusLabel] || displayStatus}
          </div>
        </div>

        {typeof statusToStep[displayStatus] === 'number' && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.25em] text-slate-400">
              <span>Durum akisi</span>
              <span>{progressSteps[statusToStep[displayStatus]].label}</span>
            </div>
            <div className="mt-4">
              <div className="relative grid grid-cols-4 gap-0 pt-1 text-center">
                <div
                  className="absolute top-3 h-0.5 -translate-y-1/2 rounded-full bg-slate-200"
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
                          isActive ? `border-0 ${accent.dot}` : 'border border-slate-200 bg-white'
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="text-lg font-semibold text-slate-900">Siparis detaylari</div>
            <div className="mt-6 space-y-4">
            {safeOrder.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4">
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
                          Urun
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900">{item.name}</div>
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
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="text-lg font-semibold text-slate-900">Ozet</div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-600">Toplam</span>
            <span className="font-semibold text-slate-900">{formatPriceTry(safeOrder.totalCents)}</span>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Siparis durumu
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

            <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm">
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
                <div className="mt-2 text-slate-600">Adres bilgisi bulunamadi.</div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm">
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
                      Kargo takip sayfasina git
                    </a>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-slate-600">Takip bilgisi henuz girilmedi.</div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Fatura adresi
              </div>
              {billingSame && shippingView ? (
                <div className="mt-2 text-slate-700">Teslimat adresi ile ayni.</div>
              ) : billingView ? (
                <div className="mt-2 space-y-1 text-slate-700">
                  <div className="font-semibold text-slate-900">{billingView.title}</div>
                  <div>{billingView.fullName}</div>
                  <div>{billingView.line1}</div>
                  <div>{billingView.city}</div>
                  <div>{billingView.phone}</div>
                </div>
              ) : (
                <div className="mt-2 text-slate-600">Adres bilgisi bulunamadi.</div>
              )}
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Siparis durumunuz guncellendikce burada gorunur.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

