import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { buildEmailHtml } from '@/lib/emailTemplate';
import { prisma } from '@/lib/prisma';
import { getUsdTryExchangeRate, resolveDisplayedPriceCents } from '@/lib/exchangeRates';
import { getStripe } from '@/lib/stripe';
import { enqueueInvoiceForOrder } from '@/lib/invoicing/service';

export const runtime = 'nodejs';

type OrderCreateResult = { id: string };
type UserLookupResult = { id: string; email: string | null };
type OrderStatusResult = {
  id: string;
  status: string;
  userId: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  user: { email: string | null } | null;
};
type OrderEmailResult = {
  id: string;
  totalCents: number;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
  shippingAddress: {
    fullName: string | null;
    phone: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
  billingAddress: {
    fullName: string | null;
    phone: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
  user: { email: string | null } | null;
};

type CartMetadataItem = { id: string; quantity: number };
type VerifiedOrderItem = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  imageUrl: string | null;
};

const prismaOrders = prisma as unknown as {
  order: {
    findUnique: (args: unknown) => Promise<OrderCreateResult | null>;
    create: (args: unknown) => Promise<OrderCreateResult>;
    updateMany: (args: unknown) => Promise<{ count: number }>;
  };
  user: {
    findUnique: (args: unknown) => Promise<UserLookupResult | null>;
  };
  userNotification: {
    create: (args: unknown) => Promise<unknown>;
  };
  address: {
    findUnique: (args: unknown) => Promise<{
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

const prismaOrderLookup = prisma as unknown as {
  order: {
    findUnique: (args: unknown) => Promise<OrderStatusResult | null>;
    update: (args: unknown) => Promise<Pick<OrderStatusResult, 'id' | 'status'>>;
  };
};

const prismaOrderEmail = prisma as unknown as {
  order: {
    findUnique: (args: unknown) => Promise<OrderEmailResult | null>;
  };
};

function parseCartMetadata(raw: string): CartMetadataItem[] {
  try {
    const parsed = JSON.parse(raw) as Array<{ id?: unknown; quantity?: unknown }>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.id === 'string' && typeof item.quantity === 'number')
      .map((item) => ({
        id: String(item.id).trim(),
        quantity: Math.max(1, Math.min(50, Math.floor(item.quantity as number))),
      }))
      .filter((item) => item.id.length > 0);
  } catch {
    return [];
  }
}

async function resolveVerifiedItems(cartRaw: string): Promise<VerifiedOrderItem[]> {
  const metaItems = parseCartMetadata(cartRaw);
  if (metaItems.length === 0) return [];

  const ids = Array.from(new Set(metaItems.map((item) => item.id)));
  const exchangeRate = await getUsdTryExchangeRate();
  const parts = await prisma.sparePart.findMany({
    where: { id: { in: ids }, isActive: true },
    select: { id: true, name: true, priceCents: true, currency: true, imageUrl: true },
  });
  const partMap = new Map(parts.map((part) => [part.id, part]));

  const verified = metaItems
    .map((item) => {
      const part = partMap.get(item.id);
      if (!part) return null;
      return {
        id: part.id,
        name: part.name,
        priceCents: resolveDisplayedPriceCents(part.priceCents, part.currency, exchangeRate.rate),
        quantity: item.quantity,
        imageUrl: part.imageUrl,
      };
    })
    .filter((item): item is VerifiedOrderItem => Boolean(item));

  if (verified.length !== metaItems.length) return [];
  return verified;
}

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
      `,
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
    subject: `Siparisiniz alindi (#${params.orderId.slice(0, 8)})`,
    html: buildEmailHtml({
      title: 'Siparisiniz alindi',
      subtitle: `Siparis #${params.orderId.slice(0, 8)}`,
      badge: 'Siparis alindi',
      preheader: `Siparis #${params.orderId.slice(0, 8)} alindi.`,
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
      footerNote: 'Bu e-posta otomatik olarak gonderilmiştir.',
    }),
  });
}

async function sendOrderEmailForOrder(orderId: string) {
  const record = await prismaOrderEmail.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      totalCents: true,
      items: {
        select: {
          name: true,
          quantity: true,
          priceCents: true,
        },
      },
      shippingAddress: {
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
      },
      billingAddress: {
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
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  const recipient = record?.user?.email || '';
  if (!record || !recipient) return;

  await sendOrderEmail({
    to: recipient,
    orderId: record.id,
    totalCents: record.totalCents,
    items: record.items,
    shippingAddress: record.shippingAddress,
    billingAddress: record.billingAddress,
  });
}

async function sendPaymentFailedEmail(params: { to: string; status: 'FAILED' | 'CANCELED'; sessionId: string }) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return;
  }

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const cartUrl = `${appUrl}/cart`;
  const title = params.status === 'CANCELED' ? 'Ödeme süresi doldu' : 'Ödeme başarısız';
  const subtitle =
    params.status === 'CANCELED'
      ? 'Ödeme tamamlanamadığı için sepetiniz korunuyor.'
      : 'Ödeme işlemi tamamlanamadı, lütfen daha sonra tekrar deneyin.';
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
    subject: `${title} (Oturum: ${params.sessionId.slice(0, 8)})`,
    html: buildEmailHtml({
      title,
      subtitle,
      badge: params.status === 'CANCELED' ? 'Süre doldu' : 'Ödeme başarısız',
      preheader: title,
      bodyHtml: `
        <div style="color:#475569;">${subtitle}</div>
        <div style="margin-top: 14px; padding: 12px; background: #f8fafc; border-radius: 10px; color: #0f172a;">
          Oturum: ${params.sessionId.slice(0, 8)}
        </div>
      `,
      primaryCta: { label: 'Sepete dön', href: cartUrl },
      footerNote: 'Bu e-posta otomatik olarak gonderilmiştir.',
    }),
  });
}

async function notifyStatus(userId: string, status: string, orderId: string | null, title: string, message: string) {
  try {
    await prismaOrders.userNotification.create({
      data: {
        userId,
        type: 'ORDER_STATUS',
        title,
        message,
        orderId,
        status,
      },
    });
  } catch (error) {
    console.error('Sipariş bildirimi kaydedilemedi:', error);
  }
}

const statusFromPayment = (paymentStatus?: string | null) => {
  if (paymentStatus === 'paid' || paymentStatus === 'no_payment_required') return 'RECEIVED';
  return 'PENDING';
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
    const message = err instanceof Error ? err.message : 'Webhook doğrulama başarısız';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      id: string;
      amount_total?: number | null;
      currency?: string | null;
      payment_intent?: string | null;
      payment_status?: string | null;
      metadata?: Record<string, string> | null;
      client_reference_id?: string | null;
      customer_email?: string | null;
      customer_details?: { email?: string | null } | null;
    };

    const existingBySession = await prismaOrderLookup.order.findUnique({
      where: { stripeSessionId: session.id },
      select: {
        id: true,
        status: true,
        userId: true,
        stripeSessionId: true,
        stripePaymentIntentId: true,
        user: { select: { email: true } },
      },
    });
    const existingByIntent = session.payment_intent
      ? await prismaOrderLookup.order.findUnique({
          where: { stripePaymentIntentId: session.payment_intent },
          select: {
            id: true,
            status: true,
            userId: true,
            stripeSessionId: true,
            stripePaymentIntentId: true,
            user: { select: { email: true } },
          },
        })
      : null;
    const existing = existingBySession || existingByIntent;
    const nextStatus = statusFromPayment(session.payment_status);

    if (!existing) {
      const stripe = getStripe();
      const cartRaw = session.metadata?.cart || '[]';
      const shippingAddressId =
        typeof session.metadata?.addressId === 'string' ? session.metadata.addressId : null;
      const billingAddressId =
        typeof session.metadata?.billingAddressId === 'string'
          ? session.metadata.billingAddressId
          : null;
      const fullSession = await stripe.checkout.sessions.retrieve(session.id);
      const itemsToCreate = await resolveVerifiedItems(cartRaw);
      if (itemsToCreate.length === 0) {
        console.error('[stripe/webhook] invalid cart metadata for session', session.id);
        return NextResponse.json({ received: true });
      }

      const total =
        typeof session.amount_total === 'number'
          ? session.amount_total
          : itemsToCreate.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
      const sessionTotal = typeof fullSession.amount_total === 'number' ? fullSession.amount_total : session.amount_total;
      const verifiedTotal = itemsToCreate.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
      if (typeof sessionTotal === 'number' && sessionTotal !== verifiedTotal) {
        console.error('[stripe/webhook] amount mismatch', {
          sessionId: session.id,
          sessionTotal,
          verifiedTotal,
        });
        return NextResponse.json({ received: true });
      }

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

      const createPayload = {
        userId,
        status: nextStatus,
        totalCents: total,
        currency: (session.currency || 'try').toUpperCase(),
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent || null,
        shippingAddressId,
        billingAddressId: billingAddressId || shippingAddressId,
        items: {
          create: itemsToCreate.map((item) => ({
            sparePartId: item.id,
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
        console.error('[stripe/webhook] create failed, retrying with PAID:', error);
        created = await prismaOrders.order.create({
          data: { ...createPayload, status: 'PAID' },
          select: { id: true },
        });
      }

      if (created?.id && nextStatus === 'RECEIVED') {
        try {
          await enqueueInvoiceForOrder({ orderId: created.id });
        } catch (error) {
          console.error('[stripe/webhook] invoice enqueue failed:', error);
        }

        await notifyStatus(
          userId,
          nextStatus,
          created.id,
          'Siparişiniz alındı',
          'Siparişiniz başarıyla alındı. Detayları hesabınızdan takip edebilirsiniz.',
        );

        try {
          let recipient = session.customer_details?.email || session.customer_email || '';
          if (!recipient) {
            const user = await prismaOrders.user.findUnique({
              where: { id: userId },
              select: { email: true },
            });
            recipient = user?.email || '';
          }

          if (recipient && nextStatus === 'RECEIVED') {
            const shippingAddress = shippingAddressId
              ? await prismaOrders.address.findUnique({
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
                ? await prismaOrders.address.findUnique({
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
      }
    } else if (existing.status !== nextStatus && nextStatus === 'RECEIVED') {
      await prismaOrderLookup.order.update({
        where: { id: existing.id },
        data: {
          status: nextStatus,
          stripeSessionId: existing.stripeSessionId || session.id,
          stripePaymentIntentId: existing.stripePaymentIntentId || session.payment_intent || null,
        },
        select: { id: true, status: true },
      });
      await notifyStatus(
        existing.userId,
        nextStatus,
        existing.id,
        'Siparişiniz alındı',
        'Ödeme tamamlandı. Siparişiniz işleme alındı.',
      );
      try {
        await sendOrderEmailForOrder(existing.id);
        try {
          await enqueueInvoiceForOrder({ orderId: existing.id });
        } catch (error) {
          console.error('[stripe/webhook] invoice enqueue failed:', error);
        }
      } catch (error) {
        console.error('Sipariş e-postası gönderilemedi:', error);
      }
    } else if (!existing.stripeSessionId && session.id) {
      await prismaOrderLookup.order.update({
        where: { id: existing.id },
        data: { stripeSessionId: session.id },
        select: { id: true, status: true },
      });
    }
  }

  if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object as {
      id: string;
      metadata?: Record<string, string> | null;
      client_reference_id?: string | null;
      customer_email?: string | null;
      customer_details?: { email?: string | null } | null;
    };

    const status = event.type === 'checkout.session.expired' ? 'CANCELED' : 'FAILED';
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

    const existing = await prismaOrderLookup.order.findUnique({
      where: { stripeSessionId: session.id },
      select: {
        id: true,
        status: true,
        userId: true,
        stripeSessionId: true,
        stripePaymentIntentId: true,
        user: { select: { email: true } },
      },
    });

    if (
      existing &&
      existing.status !== status &&
      existing.status !== 'RECEIVED' &&
      existing.status !== 'IN_TRANSIT' &&
      existing.status !== 'SHIPPED' &&
      existing.status !== 'DELIVERED'
    ) {
      await prismaOrderLookup.order.update({
        where: { id: existing.id },
        data: { status },
        select: { id: true, status: true },
      });

      await notifyStatus(
        existing.userId,
        status,
        existing.id,
        status === 'CANCELED' ? 'Ödeme süresi doldu' : 'Ödeme başarısız',
        status === 'CANCELED'
          ? 'Ödeme süresi doldu. Sepetinizi tekrar onaylayabilirsiniz.'
          : 'Ödeme başarısız oldu. ütfen tekrar deneyin.',
      );

      try {
        const recipient =
          session.customer_details?.email ||
          session.customer_email ||
          existing.user?.email ||
          '';
        if (recipient) {
          await sendPaymentFailedEmail({ to: recipient, status, sessionId: session.id });
        }
      } catch (error) {
        console.error('Ödeme başarısız e-postası gönderilemedi:', error);
      }
    } else if (userId && !existing) {
      await notifyStatus(
        userId,
        status,
        null,
        status === 'CANCELED' ? 'Ödeme süresi doldu' : 'Ödeme başarısız',
        status === 'CANCELED'
          ? 'Ödeme süresi doldu. Sepetinizi tekrar onaylayabilirsiniz.'
          : 'Ödeme başarısız oldu. Lutfen tekrar deneyin.',
      );
    }
  }

  if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as {
      id: string;
      metadata?: Record<string, string> | null;
    };
    const intentStatus = event.type === 'payment_intent.succeeded' ? 'RECEIVED' : 'FAILED';
    const existing = await prismaOrderLookup.order.findUnique({
      where: { stripePaymentIntentId: intent.id },
      select: {
        id: true,
        status: true,
        userId: true,
        stripeSessionId: true,
        stripePaymentIntentId: true,
        user: { select: { email: true } },
      },
    });

    if (
      existing &&
      existing.status !== intentStatus &&
      existing.status !== 'IN_TRANSIT' &&
      existing.status !== 'SHIPPED' &&
      existing.status !== 'DELIVERED'
    ) {
      await prismaOrderLookup.order.update({
        where: { id: existing.id },
        data: { status: intentStatus },
        select: { id: true, status: true },
      });

      await notifyStatus(
        existing.userId,
        intentStatus,
        existing.id,
        intentStatus === 'RECEIVED' ? 'Ödeme alındı' : 'Ödeme başarısız',
        intentStatus === 'RECEIVED'
          ? 'Ödemeniz alındı, siparişiniz işleme alındı.'
          : 'Ödeme başarısız oldu. Lutfen tekrar deneyin.',
      );

      if (intentStatus === 'RECEIVED') {
        try {
          await sendOrderEmailForOrder(existing.id);
          try {
            await enqueueInvoiceForOrder({ orderId: existing.id });
          } catch (error) {
            console.error('[stripe/webhook] invoice enqueue failed:', error);
          }
        } catch (error) {
          console.error('Sipariş e-postası gönderilemedi:', error);
        }
      }

      if (intentStatus === 'FAILED' && existing.user?.email) {
        try {
          await sendPaymentFailedEmail({
            to: existing.user.email,
            status: 'FAILED',
            sessionId: intent.id,
          });
        } catch (error) {
          console.error('Ödeme başarısız sipariş e-postası gönderilemedi:', error);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
