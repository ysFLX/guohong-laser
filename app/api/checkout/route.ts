import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { isPaymentCheckoutEnabled } from '@/lib/checkoutMode';

type CheckoutItem = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string | null;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (!isPaymentCheckoutEnabled()) {
    return NextResponse.json(
      {
        error: 'Ödeme altyapısı şu an kapalı. Lütfen “Teklif iste” veya WhatsApp hattını kullanın.',
        code: 'PAYMENTS_DISABLED',
      },
      { status: 503 },
    );
  }

  let payload: { items?: CheckoutItem[]; addressId?: string; billingAddressId?: string | null };
  try {
    payload = (await req.json()) as { items?: CheckoutItem[]; addressId?: string; billingAddressId?: string | null };
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  const addressId = typeof payload.addressId === 'string' ? payload.addressId.trim() : '';
  const billingAddressId =
    typeof payload.billingAddressId === 'string' ? payload.billingAddressId.trim() : '';
  const cleanItems = items
    .filter((x) => x && typeof x.name === 'string' && typeof x.priceCents === 'number' && typeof x.quantity === 'number')
    .map((x) => ({
      id: String(x.id),
      name: String(x.name),
      priceCents: Math.max(0, Math.round(x.priceCents)),
      quantity: Math.max(1, Math.floor(x.quantity)),
      imageUrl: typeof x.imageUrl === 'string' ? x.imageUrl : null,
    }))
    .filter((x) => x.priceCents > 0 && x.quantity > 0);

  if (!cleanItems.length) {
    return NextResponse.json({ error: 'Sepet boş' }, { status: 400 });
  }

  if (!addressId) {
    return NextResponse.json({ error: 'Adres seçilmedi' }, { status: 400 });
  }

  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: session.user.id },
    select: { id: true },
  });

  if (!address) {
    return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 400 });
  }

  if (billingAddressId) {
    const billingAddress = await prisma.address.findFirst({
      where: { id: billingAddressId, userId: session.user.id },
      select: { id: true },
    });

    if (!billingAddress) {
      return NextResponse.json({ error: 'Fatura adresi bulunamadı' }, { status: 400 });
    }
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error('[checkout] stripe init failed:', error);
    return NextResponse.json(
      {
        error: 'Ödeme altyapısı şu an hazır değil. Lütfen “Teklif iste” üzerinden devam edin.',
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
      line_items: cleanItems.map((item) => ({
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
          cleanItems.map((item) => ({
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
      { error: 'Ödeme başlatılamadı. Lütfen tekrar deneyin.', code: 'CHECKOUT_FAILED' },
      { status: 500 },
    );
  }
}
