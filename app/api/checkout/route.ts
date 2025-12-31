import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { getStripe } from '@/lib/stripe';

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

  let payload: { items?: CheckoutItem[] };
  try {
    payload = (await req.json()) as { items?: CheckoutItem[] };
  } catch {
    return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
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
    return NextResponse.json({ error: 'Sepet bos' }, { status: 400 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';

  const stripe = getStripe();
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
}
