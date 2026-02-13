import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import nodemailer from 'nodemailer';

import { authOptions } from '@/auth';
import { buildEmailHtml } from '@/lib/emailTemplate';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { enqueueInvoiceForOrder } from '@/lib/invoicing/service';

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
  billingAddress?: {
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
    .map((item) => `${item.name} x${item.quantity} TL ${formatPriceTry(item.priceCents * item.quantity)}`)
    .join('\n');

  const itemsHtml = params.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
            <div style="font-weight: 600; color: #0f172a;">${item.name}</div>
            <div style="font-size: 12px; color: #64748b;">Adet: ${item.quantity}</div>
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #0f172a;">
            ${formatPriceTry(item.priceCents * item.quantity)}
          </td>
        </tr>
      `
    )
    .join('');

  const formatAddressBlock = (address?: {
    fullName: string | null;
    phone: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null) => {
    if (!address) {
      return {
        text: 'Adres bilgisi bulunamadı.',
        html: '<span style="color:#64748b;">Adres bilgisi bulunamadı.</span>',
      };
    }
    const text = [
      address.fullName,
      address.line1,
      address.line2,
      `${address.city || ''}${address.state ? ` / ${address.state}` : ''}`,
      address.postalCode,
      address.country,
      address.phone,
    ]
      .filter(Boolean)
      .join('\n');
    return {
      text,
      html: text.replace(/\n/g, '<br />'),
    };
  };

  const shippingBlock = formatAddressBlock(params.shippingAddress);
  const billingBlock = formatAddressBlock(params.billingAddress);

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
    subject: `Siparişiniz alındı (#${params.orderId.slice(0, 8)})`,
    text: [
      'Siparişiniz alındı.',
      `Sipariş detayları: ${orderUrl}`,
      '',
      'Sipariş özeti:',
      lines,
      '',
      `Toplam: ${formatPriceTry(params.totalCents)}`,
      '',
      'Teslimat adresi:',
      shippingBlock.text,
      '',
      'Fatura / irsaliye adresi:',
      billingBlock.text,
      '',
      `İade/değişim talebi: ${returnsUrl}`,
    ].join('\n'),
    html: buildEmailHtml({
      title: 'Siparişiniz alındı',
      subtitle: `Sipariş #${params.orderId.slice(0, 8)}`,
      badge: 'Sipariş alındı',
      preheader: `Sipariş #${params.orderId.slice(0, 8)} alındı.`,
      bodyHtml: `
        <div style="margin-top: 2px; color:#475569;">Siparişiniz başarıyla alındı. Detayları hesabınızdan takip edebilirsiniz.</div>
        <div style="margin-top: 14px; padding: 14px; background: #f8fafc; border-radius: 12px;">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em;">Sipariş numaranız</div>
          <div style="margin-top: 6px; font-size: 18px; font-weight: 700; color: #0f172a;">#${params.orderId.slice(0, 8)}</div>
        </div>
        <div style="margin-top: 18px;">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700;">Sipariş özeti</div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
            <tbody>
              ${itemsHtml}
              <tr>
                <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #0f172a;">Toplam</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 700; color: #0f172a;">${formatPriceTry(params.totalCents)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="margin-top: 18px; padding: 14px; background: #f8fafc; border-radius: 12px; font-size: 14px; color: #334155;">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700;">Teslimat adresi</div>
          <div style="margin-top: 8px; line-height: 1.5;">${shippingBlock.html}</div>
        </div>
        <div style="margin-top: 18px; padding: 14px; background: #eef2f7; border-radius: 12px; font-size: 14px; color: #334155;">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700;">Fatura / İrsaliye</div>
          <div style="margin-top: 8px; line-height: 1.5;">${billingBlock.html}</div>
        </div>
      `,
      primaryCta: { label: 'Sipariş detaylarını gör', href: orderUrl },
      secondaryCta: { label: 'İade / Değişim talebi', href: returnsUrl },
      footerNote: 'Bu e-posta otomatik olarak gönderilmiştir.',
    }),
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
        title: 'Siparişiniz alındı',
        message: 'Siparişiniz başarıyla alındı. Detayları hesabınızdan takip edebilirsiniz.',
        orderId: created?.id ?? null,
        status: 'RECEIVED',
      },
    });
  } catch (error) {
    console.error('Sipariş bildirimi kaydedilemedi:', error);
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
      const billingAddress =
        billingAddressId && billingAddressId !== shippingAddressId
          ? await prismaNotifications.address.findUnique({
              where: { id: billingAddressId },
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
          : shippingAddress;
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
        billingAddress,
      });
    }
  } catch (error) {
    console.error('Sipariş e-postası gönderilemedi:', error);
  }

  try {
    if (created?.id) {
      await enqueueInvoiceForOrder({ orderId: created.id });
    }
  } catch (error) {
    console.error('[orders/sync] invoice enqueue failed:', error);
  }

  return NextResponse.json({ ok: true });
}
