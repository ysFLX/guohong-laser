import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type UpdatePayload = {
  status?: string;
  shippingCarrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
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
  RECEIVED: 'Siparisiniz alindi',
  IN_TRANSIT: 'Siparisiniz hazirlaniyor',
  SHIPPED: 'Kargoya verildi',
  DELIVERED: 'Teslim edildi',
  PENDING: 'Beklemede',
  PAID: 'Odeme alindi',
  FAILED: 'Basarisiz',
  CANCELED: 'Iptal edildi',
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
    subject: `Siparis durumu guncellendi (#${params.orderId.slice(0, 8)})`,
    text: [
      `Siparis durumunuz guncellendi: ${statusText}`,
      `Siparis detaylari: ${orderUrl}`,
      trackingLines,
    ]
      .filter(Boolean)
      .join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="margin-top: 0; color: #111827;">Siparis durumu guncellendi</h2>
        <p style="margin: 0 0 12px;">Siparisinizin yeni durumu:</p>
        <div style="display: inline-block; padding: 6px 12px; border-radius: 999px; background: #f1f5f9; color: #0f172a; font-weight: 600;">
          ${statusText}
        </div>
        <div style="margin-top: 16px;">
          <a href="${orderUrl}" style="display: inline-block; padding: 10px 16px; background: #0f172a; color: #ffffff; border-radius: 8px; text-decoration: none;">Siparis detaylari</a>
        </div>
        ${
          trackingLines
            ? `<div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 14px; color: #334155; white-space: pre-line;">${trackingLines}</div>`
            : ''
        }
      </div>
    `,
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
    return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status.trim() : '';
  if (!status || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: 'Durum gecersiz' }, { status: 400 });
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
      return NextResponse.json({ error: 'Siparis bulunamadi' }, { status: 404 });
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

    if (existing.status !== status) {
      try {
        await prismaNotifications.userNotification.create({
          data: {
            userId: existing.userId,
            type: 'ORDER_STATUS',
            title: 'Siparis durumu guncellendi',
            message: `Siparis durumunuz guncellendi: ${formatStatusLabel(status)}`,
            orderId: updated.id,
            status,
          },
        });
      } catch (error) {
        console.error('Siparis durum bildirimi kaydedilemedi:', error);
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
          });
        }
      } catch (error) {
        console.error('Siparis durum e-postasi gonderilemedi:', error);
      }
    }

    return NextResponse.json({ item: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Guncelleme hatasi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
