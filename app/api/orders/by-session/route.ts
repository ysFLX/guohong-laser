import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type OrderItemResult = {
  id: string;
  sparePartId: string | null;
  name: string;
  quantity: number;
  priceCents: number;
};

type OrderResult = {
  id: string;
  totalCents: number;
  currency: string;
  items: OrderItemResult[];
} | null;

const prismaOrders = prisma as unknown as {
  order: {
    findFirst: (args: unknown) => Promise<OrderResult>;
  };
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const sessionId = new URL(req.url).searchParams.get('session_id') || '';
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id gerekli' }, { status: 400 });
  }

  const order = await prismaOrders.order.findFirst({
    where: { userId: session.user.id, stripeSessionId: sessionId },
    select: {
      id: true,
      totalCents: true,
      currency: true,
      items: {
        select: {
          id: true,
          sparePartId: true,
          name: true,
          quantity: true,
          priceCents: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      id: order.id,
      totalCents: order.totalCents,
      currency: order.currency,
      items: order.items.map((item) => ({
        id: item.id,
        sparePartId: item.sparePartId,
        name: item.name,
        quantity: item.quantity,
        priceCents: item.priceCents,
      })),
    },
  });
}

