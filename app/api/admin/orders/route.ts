import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type AdminOrderItem = {
  id: string;
  name: string;
  quantity: number;
  priceCents: number;
};

type AdminOrderUser = {
  name: string | null;
  email: string | null;
};

type AdminOrderAddress = {
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
  createdAt: Date;
  shippingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  items: AdminOrderItem[];
  user: AdminOrderUser | null;
  shippingAddress: AdminOrderAddress | null;
  billingAddress: AdminOrderAddress | null;
};

const prismaOrders = prisma as unknown as {
  order: {
    findMany: (args: unknown) => Promise<AdminOrder[]>;
  };
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  const orders = await prismaOrders.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
      shippingAddress: true,
      billingAddress: true,
    },
  });

  return NextResponse.json({
    items: orders.map((order) => ({
      id: order.id,
      status: order.status,
      totalCents: order.totalCents,
      currency: order.currency,
      createdAt: order.createdAt,
      shippingCarrier: order.shippingCarrier ?? null,
      trackingNumber: order.trackingNumber ?? null,
      trackingUrl: order.trackingUrl ?? null,
      user: order.user,
      shippingAddress: order.shippingAddress ?? null,
      billingAddress: order.billingAddress ?? null,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        priceCents: item.priceCents,
      })),
    })),
  });
}
