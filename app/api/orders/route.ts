import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type OrderItemResult = {
  id: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
  priceCents: number;
};

type OrderResult = {
  id: string;
  status: string;
  fulfillmentType: string;
  totalCents: number;
  currency: string;
  createdAt: Date;
  items: OrderItemResult[];
};

const prismaOrders = prisma as unknown as {
  order: {
    findMany: (args: unknown) => Promise<OrderResult[]>;
  };
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const orders = await prismaOrders.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return NextResponse.json({
    items: orders.map((order) => ({
      id: order.id,
      status: order.status,
      fulfillmentType: order.fulfillmentType,
      totalCents: order.totalCents,
      currency: order.currency,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
        priceCents: item.priceCents,
      })),
    })),
  });
}
