import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
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
  shippingAddress: Address | null;
  billingAddress: Address | null;
  shippingAddressId: string | null;
  billingAddressId: string | null;
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

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const order = await prismaOrders.order.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { items: true, shippingAddress: true, billingAddress: true },
  });

  if (!order) {
    notFound();
  }

  const statusLabel: Record<string, string> = {
    PAID: 'Odeme alindi',
    PENDING: 'Beklemede',
    FAILED: 'Basarisiz',
    CANCELED: 'Iptal',
  };

  const statusTone: Record<string, string> = {
    PAID: 'bg-emerald-500/15 text-emerald-700',
    PENDING: 'bg-amber-500/15 text-amber-700',
    FAILED: 'bg-rose-500/15 text-rose-700',
    CANCELED: 'bg-slate-500/15 text-slate-700',
  };

  const shippingView = formatAddress(order.shippingAddress);
  const billingView = formatAddress(order.billingAddress);
  const billingSame =
    order.billingAddressId &&
    order.shippingAddressId &&
    order.billingAddressId === order.shippingAddressId;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/profile/orders" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
          Siparislerime don
        </Link>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Siparis #{order.id.slice(0, 8)}</h1>
            <div className="mt-1 text-sm text-slate-600">{formatDate(order.createdAt)}</div>
          </div>
          <div
            className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              statusTone[order.status as keyof typeof statusTone] || 'bg-slate-200 text-slate-700'
            }`}
          >
            {statusLabel[order.status as keyof typeof statusLabel] || order.status}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="text-lg font-semibold text-slate-900">Siparis detaylari</div>
            <div className="mt-6 space-y-4">
              {order.items.map((item) => (
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
              <span className="font-semibold text-slate-900">{formatPriceTry(order.totalCents)}</span>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Siparis durumu
              </div>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    statusTone[order.status as keyof typeof statusTone] || 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {statusLabel[order.status as keyof typeof statusLabel] || order.status}
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
