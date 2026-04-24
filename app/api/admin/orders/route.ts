import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type AdminOrderItem = {
  id: string;
  name: string;
  imageUrl: string | null;
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

type AdminOrderInvoice = {
  id: string;
  status: string;
  issuedAt: Date | null;
  invoiceNumber: string | null;
  ettn: string | null;
  errorMessage: string | null;
};

type AdminOrder = {
  id: string;
  status: string;
  fulfillmentType: string;
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
  invoice?: AdminOrderInvoice | null;
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

  let orders: AdminOrder[] = [];
  try {
    orders = await prismaOrders.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
        shippingAddress: {
          select: {
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
        invoice: {
          select: {
            id: true,
            status: true,
            issuedAt: true,
            invoiceNumber: true,
            ettn: true,
            errorMessage: true,
          },
        },
      },
    });
  } catch {
    orders = await prismaOrders.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
        shippingAddress: {
          select: {
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
  }

  return NextResponse.json({
    items: orders.map((order) => ({
      id: order.id,
      status: order.status,
      fulfillmentType: order.fulfillmentType,
      totalCents: order.totalCents,
      currency: order.currency,
      createdAt: order.createdAt,
      shippingCarrier: order.shippingCarrier ?? null,
      trackingNumber: order.trackingNumber ?? null,
      trackingUrl: order.trackingUrl ?? null,
      user: order.user,
      shippingAddress: order.shippingAddress ?? null,
      billingAddress: order.billingAddress ?? null,
      invoice: order.invoice ?? null,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl ?? null,
        quantity: item.quantity,
        priceCents: item.priceCents,
      })),
    })),
  });
}
