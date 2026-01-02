import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

type OrderCreateResult = { id: string };
type UserLookupResult = { id: string };

const prismaOrders = prisma as unknown as {
  order: {
    findUnique: (args: unknown) => Promise<OrderCreateResult | null>;
    create: (args: unknown) => Promise<OrderCreateResult>;
  };
  user: {
    findUnique: (args: unknown) => Promise<UserLookupResult | null>;
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
    const stripe = getStripe();
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
      client_reference_id?: string | null;
      customer_email?: string | null;
      customer_details?: { email?: string | null } | null;
    };

    const existing = await prismaOrders.order.findUnique({
      where: { stripeSessionId: session.id },
      select: { id: true },
    });

    if (!existing) {
      const stripe = getStripe();
      const cartRaw = session.metadata?.cart || '[]';
      const shippingAddressId =
        typeof session.metadata?.addressId === 'string' ? session.metadata.addressId : null;
      const billingAddressId =
        typeof session.metadata?.billingAddressId === 'string'
          ? session.metadata.billingAddressId
          : null;
      let cartItems: Array<{
        id: string;
        name: string;
        priceCents: number;
        quantity: number;
        imageUrl?: string | null;
      }> = [];

      try {
        cartItems = JSON.parse(cartRaw) as typeof cartItems;
      } catch {
        cartItems = [];
      }

      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items.data.price.product'],
      });

      const lineItems = fullSession.line_items?.data ?? [];
      const fallbackItems = lineItems.map((item) => {
        const quantity = item.quantity ?? 1;
        const unitAmount =
          item.price?.unit_amount ??
          (item.amount_total ? Math.round(item.amount_total / quantity) : 0);
        const product = typeof item.price?.product === 'object' ? item.price?.product : null;
        const productName =
          product && 'name' in product && typeof product.name === 'string'
            ? product.name
            : '';
        const imageUrl =
          product && 'images' in product && Array.isArray(product.images)
            ? product.images[0] || null
            : null;
        return {
          id: '',
          name: item.description || productName || 'Urun',
          priceCents: unitAmount,
          quantity,
          imageUrl,
        };
      });

      const itemsToCreate = cartItems.length > 0 ? cartItems : fallbackItems;
      const total =
        typeof session.amount_total === 'number'
          ? session.amount_total
          : itemsToCreate.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

      let userId = session.metadata?.userId || session.client_reference_id || '';
      if (!userId) {
        const email = session.customer_details?.email || session.customer_email || '';
        if (email) {
          const user = await prismaOrders.user.findUnique({
            where: { email },
            select: { id: true },
          });
          if (user?.id) userId = user.id;
        }
      }

      if (!userId) {
        return NextResponse.json({ received: true });
      }

      await prismaOrders.order.create({
        data: {
          userId,
          status: 'RECEIVED',
          totalCents: total,
          currency: (session.currency || 'try').toUpperCase(),
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent || null,
          shippingAddressId,
          billingAddressId: billingAddressId || shippingAddressId,
          items: {
            create: itemsToCreate.map((item) => ({
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
