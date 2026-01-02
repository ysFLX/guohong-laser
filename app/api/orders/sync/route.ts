import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';

type OrderCreateResult = { id: string };

const prismaOrders = prisma as unknown as {
  order: {
    findUnique: (args: unknown) => Promise<OrderCreateResult | null>;
    create: (args: unknown) => Promise<OrderCreateResult>;
  };
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id gerekli' }, { status: 400 });
  }

  const existing = await prismaOrders.order.findUnique({
    where: { stripeSessionId: sessionId },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ ok: true });
  }

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items.data.price.product'],
  });

  const userId =
    checkout.metadata?.userId ||
    checkout.client_reference_id ||
    '';

  if (!userId || userId !== session.user.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const cartRaw = checkout.metadata?.cart || '[]';
  const shippingAddressId =
    typeof checkout.metadata?.addressId === 'string' ? checkout.metadata.addressId : null;
  const billingAddressId =
    typeof checkout.metadata?.billingAddressId === 'string' ? checkout.metadata.billingAddressId : null;
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

  const lineItems = checkout.line_items?.data ?? [];
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
    typeof checkout.amount_total === 'number'
      ? checkout.amount_total
      : itemsToCreate.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  await prismaOrders.order.create({
    data: {
      userId,
      status: 'PAID',
      totalCents: total,
      currency: (checkout.currency || 'try').toUpperCase(),
      stripeSessionId: checkout.id,
      stripePaymentIntentId: checkout.payment_intent ? String(checkout.payment_intent) : null,
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

  return NextResponse.json({ ok: true });
}
