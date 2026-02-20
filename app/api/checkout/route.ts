import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isPaymentCheckoutEnabled } from '@/lib/checkoutMode';
import { getStripe } from '@/lib/stripe';

type CheckoutItem = {
  id: string;
  quantity: number;
};

type SparePartRow = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (!isPaymentCheckoutEnabled()) {
    return NextResponse.json(
      {
        error: 'Odeme altyapisi su an kapali. Lutfen Teklif iste veya WhatsApp hattini kullanin.',
        code: 'PAYMENTS_DISABLED',
      },
      { status: 503 },
    );
  }

  let payload: { items?: CheckoutItem[]; addressId?: string; billingAddressId?: string | null };
  try {
    payload = (await req.json()) as { items?: CheckoutItem[]; addressId?: string; billingAddressId?: string | null };
  } catch {
    return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  const addressId = typeof payload.addressId === 'string' ? payload.addressId.trim() : '';
  const billingAddressId = typeof payload.billingAddressId === 'string' ? payload.billingAddressId.trim() : '';

  const cleanItems = items
    .filter((x) => x && typeof x.id === 'string' && typeof x.quantity === 'number')
    .map((x) => ({
      id: String(x.id).trim(),
      quantity: Math.max(1, Math.min(50, Math.floor(x.quantity))),
    }))
    .filter((x) => x.id.length > 0);

  if (!cleanItems.length) {
    return NextResponse.json({ error: 'Sepet bos' }, { status: 400 });
  }

  if (!addressId) {
    return NextResponse.json({ error: 'Adres secilmedi' }, { status: 400 });
  }

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: session.user.id },
    select: { id: true },
  });

  if (!address) {
    return NextResponse.json({ error: 'Adres bulunamadi' }, { status: 400 });
  }

  if (billingAddressId) {
    const billingAddress = await prisma.address.findFirst({
      where: { id: billingAddressId, userId: session.user.id },
      select: { id: true },
    });

    if (!billingAddress) {
      return NextResponse.json({ error: 'Fatura adresi bulunamadi' }, { status: 400 });
    }
  }

  const ids = Array.from(new Set(cleanItems.map((item) => item.id)));
  const parts = (await prisma.sparePart.findMany({
    where: { id: { in: ids }, isActive: true },
    select: {
      id: true,
      name: true,
      priceCents: true,
      imageUrl: true,
    },
  })) as SparePartRow[];

  const partMap = new Map(parts.map((part) => [part.id, part]));
  const verifiedItems = cleanItems
    .map((item) => {
      const part = partMap.get(item.id);
      if (!part) return null;
      return {
        id: part.id,
        name: part.name,
        priceCents: part.priceCents,
        quantity: item.quantity,
        imageUrl: part.imageUrl,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (verifiedItems.length !== cleanItems.length) {
    return NextResponse.json({ error: 'Sepette gecersiz veya pasif urun var.' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error('[checkout] stripe init failed:', error);
    return NextResponse.json(
      {
        error: 'Odeme altyapisi su an hazir degil. Lutfen Teklif iste uzerinden devam edin.',
        code: 'PAYMENTS_NOT_CONFIGURED',
      },
      { status: 503 },
    );
  }

  try {
    const sessionData = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      locale: 'tr',
      line_items: verifiedItems.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: 'try',
          unit_amount: item.priceCents,
          product_data: {
            name: item.name,
            images: item.imageUrl ? [item.imageUrl] : undefined,
          },
        },
      })),
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      client_reference_id: session.user.id,
      customer_email: session.user.email || undefined,
      metadata: {
        userId: session.user.id,
        addressId,
        billingAddressId: billingAddressId || addressId,
        cart: JSON.stringify(
          verifiedItems.map((item) => ({
            id: item.id,
            name: item.name,
            priceCents: item.priceCents,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          })),
        ),
      },
    });

    return NextResponse.json({ url: sessionData.url });
  } catch (error) {
    console.error('[checkout] stripe checkout create failed:', error);
    return NextResponse.json(
      { error: 'Odeme baslatilamadi. Lutfen tekrar deneyin.', code: 'CHECKOUT_FAILED' },
      { status: 500 },
    );
  }
}
