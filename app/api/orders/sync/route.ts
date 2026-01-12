import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import nodemailer from 'nodemailer';

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

const prismaNotifications = prisma as unknown as {
  userNotification: {
    create: (args: unknown) => Promise<unknown>;
  };
  address: {
    findUnique: (args: unknown) => Promise<{
      label: string | null;
      fullName: string | null;
      phone: string | null;
      line1: string | null;
      line2: string | null;
      city: string | null;
      state: string | null;
      postalCode: string | null;
      country: string | null;
    } | null>;
  };
};

function formatPriceTry(priceCents: number) {
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 2,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} TL`;
  }
}

async function sendOrderEmail(params: {
  to: string;
  orderId: string;
  totalCents: number;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
  shippingAddress?: {
    fullName: string | null;
    phone: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
}) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return;
  }

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const orderUrl = `${appUrl}/profile/orders/${params.orderId}`;
  const returnsUrl = `${appUrl}/returns-request`;

  const lines = params.items
    .map((item) => `${item.name} x${item.quantity} • ${formatPriceTry(item.priceCents * item.quantity)}`)
    .join('\n');

  const address = params.shippingAddress
    ? [
        params.shippingAddress.fullName,
        params.shippingAddress.line1,
        params.shippingAddress.line2,
        `${params.shippingAddress.city || ''}${params.shippingAddress.state ? ` / ${params.shippingAddress.state}` : ''}`,
        params.shippingAddress.postalCode,
        params.shippingAddress.country,
        params.shippingAddress.phone,
      ]
        .filter(Boolean)
        .join('\n')
    : 'Adres bilgisi bulunamadi.';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: `Guohong Lazer <${smtpUser}>`,
    to: params.to,
    subject: `Siparisiniz alindi (#${params.orderId.slice(0, 8)})`,
    text: [
      'Siparisiniz alindi.',
      `Siparis detaylari: ${orderUrl}`,
      '',
      'Siparis ozeti:',
      lines,
      '',
      `Toplam: ${formatPriceTry(params.totalCents)}`,
      '',
      'Teslimat adresi:',
      address,
      '',
      `Iade/degisim talebi: ${returnsUrl}`,
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="margin-top: 0; color: #111827;">Siparisiniz alindi</h2>
        <p style="margin: 0 0 12px;">Siparis numaraniz: <strong>#${params.orderId.slice(0, 8)}</strong></p>
        <div style="margin-bottom: 16px;">
          <a href="${orderUrl}" style="display: inline-block; padding: 10px 16px; background: #0f172a; color: #ffffff; border-radius: 8px; text-decoration: none;">Siparis detaylari</a>
        </div>
        <div style="padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 14px; color: #334155; white-space: pre-line;">
          <strong>Siparis ozeti</strong>
          <div style="margin-top: 8px;">${lines.replace(/\n/g, '<br />')}</div>
          <div style="margin-top: 8px;"><strong>Toplam:</strong> ${formatPriceTry(params.totalCents)}</div>
        </div>
        <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 14px; color: #334155; white-space: pre-line;">
          <strong>Teslimat adresi</strong>
          <div style="margin-top: 8px;">${address.replace(/\n/g, '<br />')}</div>
        </div>
        <div style="margin-top: 16px;">
          <a href="${returnsUrl}" style="color: #0f766e; text-decoration: none; font-weight: 600;">Iade/degisim talebi olustur</a>
        </div>
      </div>
    `,
  });
}

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

  const createPayload = {
    userId,
    status: 'RECEIVED',
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
  };

  let created: OrderCreateResult | null = null;
  try {
    created = await prismaOrders.order.create({ data: createPayload, select: { id: true } });
  } catch (error) {
    console.error('[orders/sync] create failed, retrying with PAID:', error);
    created = await prismaOrders.order.create({
      data: { ...createPayload, status: 'PAID' },
      select: { id: true },
    });
  }

  try {
    await prismaNotifications.userNotification.create({
      data: {
        userId,
        type: 'ORDER_STATUS',
        title: 'Siparisiniz alindi',
        message: 'Siparisiniz basariyla alindi. Detaylari hesabinizdan takip edebilirsiniz.',
        orderId: created?.id ?? null,
        status: 'RECEIVED',
      },
    });
  } catch (error) {
    console.error('Siparis bildirimi kaydedilemedi:', error);
  }

  try {
    const recipient = session.user.email || checkout.customer_details?.email || checkout.customer_email || '';
    if (recipient && created?.id) {
      const shippingAddress = shippingAddressId
        ? await prismaNotifications.address.findUnique({
            where: { id: shippingAddressId },
            select: {
              fullName: true,
              phone: true,
              line1: true,
              line2: true,
              city: true,
              state: true,
              postalCode: true,
              country: true,
            },
          })
        : null;
      await sendOrderEmail({
        to: recipient,
        orderId: created.id,
        totalCents: total,
        items: itemsToCreate.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
        shippingAddress,
      });
    }
  } catch (error) {
    console.error('Siparis e-postasi gonderilemedi:', error);
  }

  return NextResponse.json({ ok: true });
}
