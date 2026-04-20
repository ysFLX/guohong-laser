import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { authOptions } from '@/auth';
import { buildEmailHtml } from '@/lib/emailTemplate';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type UpdatePayload = {
  status?: string;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  cancelReason?: string | null;
};

const allowedStatuses = new Set([
  'RECEIVED',
  'IN_TRANSIT',
  'SHIPPED',
  'DELIVERED',
  'PENDING',
  'PAID',
  'FAILED',
  'CANCELED',
]);

const statusLabel: Record<string, string> = {
  RECEIVED: 'Siparişiniz alındı',
  IN_TRANSIT: 'Siparişiniz hazırlanıyor',
  SHIPPED: 'Kargoya verildi',
  DELIVERED: 'Teslim edildi',
  PENDING: 'Ödeme bekleniyor',
  PAID: 'Ödeme alındı',
  FAILED: 'Ödeme başarısız',
  CANCELED: 'Ä°ptal edildi',
};

const formatStatusLabel = (value: string) => statusLabel[value] || value;

const prismaOrders = prisma as unknown as {
  order: {
    update: (args: unknown) => Promise<{ id: string; status: string }>;
  };
};

const prismaNotifications = prisma as unknown as {
  userNotification: {
    create: (args: unknown) => Promise<unknown>;
  };
};

async function sendStatusEmail(params: {
  to: string;
  orderId: string;
  status: string;
  tracking: { carrier?: string | null; number?: string | null; url?: string | null };
  cancelReason?: string | null;
}) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return;
  }

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const orderUrl = `${appUrl}/profile/orders/${params.orderId}`;
  const returnsUrl = `${appUrl}/returns-request`;
  const statusText = formatStatusLabel(params.status);
  const showInvoiceNote = params.status === 'SHIPPED' || params.status === 'DELIVERED';

  const cancelLine =
    params.status === 'CANCELED' && params.cancelReason ? `Ä°ptal nedeni: ${params.cancelReason}` : '';
  const trackingLines = [
    params.tracking.carrier ? `Kargo firması: ${params.tracking.carrier}` : '',
    params.tracking.number ? `Takip no: ${params.tracking.number}` : '',
    params.tracking.url ? `Takip linki: ${params.tracking.url}` : '',
    cancelLine,
  ]
    .filter(Boolean)
    .join('\n');

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
    subject: `Sipariş durumu güncellendi (#${params.orderId.slice(0, 8)})`,
    text: [
      `Sipariş durumunuz güncellendi: ${statusText}`,
      `Sipariş detayları: ${orderUrl}`,
      showInvoiceNote ? 'Fatura/irsaliye: Sipariş onay e-postasında paylaşıldı.' : '',
      `Ä°ade/değişim talebi: ${returnsUrl}`,
      trackingLines,
    ]
      .filter(Boolean)
      .join('\n'),
    html: buildEmailHtml({
      title: 'Sipariş durumu güncellendi',
      subtitle: `Sipariş #${params.orderId.slice(0, 8)}`,
      badge: statusText,
      preheader: `Yeni durum: ${statusText}`,
      bodyHtml: `
        <div style="color:#475569;">Siparişinizin yeni durumu:</div>
        <div style="margin-top: 10px; display: inline-block; padding: 8px 12px; border-radius: 999px; background:#f1f5f9; color:#0f172a; font-weight: 600;">${statusText}</div>
        ${
          trackingLines
            ? `<div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 10px; font-size: 14px; color: #334155; white-space: pre-line;">${trackingLines}</div>`
            : ''
        }
        ${
          showInvoiceNote
            ? `<div style="margin-top: 12px; padding: 12px; background: #eef2f7; border-radius: 10px; font-size: 13px; color: #475569;">Fatura / irsaliye bilgileri siparis onay e-postasinda paylasilmistir.</div>`
            : ''
        }
      `,
      primaryCta: { label: 'Sipariş detayları', href: orderUrl },
      secondaryCta: { label: 'Ä°ade talebi', href: returnsUrl },
      footerNote: 'Bu e-posta otomatik olarak gönderilmiştir.',
    }),
  });
}

async function sendTrackingEmail(params: {
  to: string;
  orderId: string;
  status: string;
  tracking: { carrier?: string | null; number?: string | null; url?: string | null };
}) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return;
  }

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const orderUrl = `${appUrl}/profile/orders/${params.orderId}`;
  const statusText = formatStatusLabel(params.status);
  const trackingLines = [
    params.tracking.carrier ? `Kargo firmasi: ${params.tracking.carrier}` : '',
    params.tracking.number ? `Takip no: ${params.tracking.number}` : '',
    params.tracking.url ? `Takip linki: ${params.tracking.url}` : '',
  ]
    .filter(Boolean)
    .join('\n');

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
    subject: `Kargo bilgisi guncellendi (#${params.orderId.slice(0, 8)})`,
    text: [
      `Kargo bilgileriniz guncellendi. Guncel durum: ${statusText}`,
      `Siparis detaylari: ${orderUrl}`,
      trackingLines,
    ]
      .filter(Boolean)
      .join('\n'),
    html: buildEmailHtml({
      title: 'Kargo bilgisi guncellendi',
      subtitle: `Siparis #${params.orderId.slice(0, 8)}`,
      badge: statusText,
      preheader: `Kargo durumu: ${statusText}`,
      bodyHtml: `
        <div>Guncel durum: <strong>${statusText}</strong></div>
        ${
          trackingLines
            ? `<div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 10px; font-size: 14px; color: #334155; white-space: pre-line;">${trackingLines}</div>`
            : ''
        }
      `,
      primaryCta: { label: 'Sipariş detayları', href: orderUrl },
      footerNote: 'Bu e-posta otomatik olarak gönderilmiştir.',
    }),
  });
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  let body: UpdatePayload;
  try {
    body = (await req.json()) as UpdatePayload;
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status.trim() : '';
  if (!status || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: 'Durum geçersiz' }, { status: 400 });
  }
  const cancelReason =
    typeof body.cancelReason === 'string' && body.cancelReason.trim() ? body.cancelReason.trim() : null;
  if (status === 'CANCELED' && !cancelReason) {
    return NextResponse.json({ error: 'Ä°ptal nedeni gerekli' }, { status: 400 });
  }

  const shippingCarrier = typeof body.shippingCarrier === 'string' ? body.shippingCarrier.trim() : null;
  const trackingNumber = typeof body.trackingNumber === 'string' ? body.trackingNumber.trim() : null;
  const trackingUrl = typeof body.trackingUrl === 'string' ? body.trackingUrl.trim() : null;

  try {
    const existing = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        shippingCarrier: true,
        trackingNumber: true,
        trackingUrl: true,
        userId: true,
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    const updated = await prismaOrders.order.update({
      where: { id },
      data: {
        status,
        shippingCarrier: shippingCarrier || null,
        trackingNumber: trackingNumber || null,
        trackingUrl: trackingUrl || null,
      },
      select: { id: true, status: true },
    });

    const trackingChanged =
      (existing.shippingCarrier || null) !== (shippingCarrier || null) ||
      (existing.trackingNumber || null) !== (trackingNumber || null) ||
      (existing.trackingUrl || null) !== (trackingUrl || null);

    if (existing.status !== status) {
      const reasonSuffix =
        status === 'CANCELED' && cancelReason ? `İptal nedeni: ${cancelReason}` : '';
      try {
        await prismaNotifications.userNotification.create({
          data: {
            userId: existing.userId,
            type: 'ORDER_STATUS',
            title: 'Sipariş durumu güncellendi',
            message: `Sipariş durumunuz güncellendi: ${formatStatusLabel(status)}${
              reasonSuffix ? `. ${reasonSuffix}` : ''
            }`,
            orderId: updated.id,
            status,
          },
        });
      } catch (error) {
        console.error('Sipariş durum bildirimi kaydedilemedi:', error);
      }

      try {
        if (existing.user?.email) {
          await sendStatusEmail({
            to: existing.user.email,
            orderId: updated.id,
            status,
            tracking: {
              carrier: shippingCarrier,
              number: trackingNumber,
              url: trackingUrl,
            },
            cancelReason,
          });
        }
      } catch (error) {
        console.error('Sipariş durum e-postası gönderilemedi:', error);
      }
    } else if (trackingChanged) {
      try {
        await prismaNotifications.userNotification.create({
          data: {
            userId: existing.userId,
            type: 'ORDER_TRACKING',
            title: 'Kargo bilgisi güncellendi',
            message: 'Kargo takip bilgileriniz güncellendi.',
            orderId: updated.id,
            status,
          },
        });
      } catch (error) {
        console.error('Kargo bildirimi kaydedilemedi:', error);
      }

      try {
        if (existing.user?.email) {
          await sendTrackingEmail({
            to: existing.user.email,
            orderId: updated.id,
            status,
            tracking: {
              carrier: shippingCarrier,
              number: trackingNumber,
              url: trackingUrl,
            },
          });
        }
      } catch (error) {
        console.error('Kargo e-postası gönderilemedi:', error);
      }
    }

    return NextResponse.json({ item: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Güncelleme hatası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


