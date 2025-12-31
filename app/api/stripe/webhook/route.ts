import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

type OrderItemInput = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string | null;
};

type OrderCreateResult = { id: string };

const prismaOrders = prisma as unknown as {
  order: {
    findUnique: (args: unknown) => Promise<OrderCreateResult | null>;
    create: (args: unknown) => Promise<OrderCreateResult>;
  };
};

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret eksik' }, { status: 400 });
  }

  const body = await req.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook dogrulama basarisiz';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      id: string;
      amount_total?: number | null;
      currency?: string | null;
      payment_intent?: string | null;
      metadata?: Record<string, string> | null;
    };

    const existing = await prismaOrders.order.findUnique({
      where: { stripeSessionId: session.id },
      select: { id: true },
    });

    if (!existing) {
      const cartRaw = session.metadata?.cart || '[]';
      let items: OrderItemInput[] = [];
      try {
        items = JSON.parse(cartRaw) as OrderItemInput[];
      } catch {
        items = [];
      }

      const total = typeof session.amount_total === 'number'
        ? session.amount_total
        : items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

      const userId = session.metadata?.userId;
      if (!userId) {
        return NextResponse.json({ received: true });
      }

      await prismaOrders.order.create({
        data: {
          userId,
          status: 'PAID',
          totalCents: total,
          currency: (session.currency || 'try').toUpperCase(),
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent || null,
          items: {
            create: items.map((item) => ({
              sparePartId: item.id || null,
              name: item.name,
              imageUrl: item.imageUrl || null,
              quantity: item.quantity,
              priceCents: item.priceCents,
            })),
          },
        },
        select: { id: true },
      });
    }
  }

  return NextResponse.json({ received: true });
}
