import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type ReminderRow = {
  id: string;
  userId: string | null;
  email: string;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
  totalCents: number;
  updatedAt: Date;
};

const prismaReminders = prisma as unknown as {
  cartReminder: {
    findMany: (args: unknown) => Promise<ReminderRow[]>;
    update: (args: unknown) => Promise<{ id: string }>;
  };
  order: {
    findFirst: (args: unknown) => Promise<{ id: string } | null>;
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

async function sendReminderEmail(params: {
  to: string;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
  totalCents: number;
}) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return;
  }

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const cartUrl = `${appUrl}/cart`;

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
    subject: 'Sepetiniz sizi bekliyor',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.16em; color: #94a3b8;">Guohong Lazer</div>
        <h2 style="margin: 6px 0 0; color: #0f172a;">Sepetiniz sizi bekliyor</h2>
        <p style="margin-top: 12px; color: #475569;">Ödeme tamamlanmadı. Sepetinizdeki ürünleri güncel fiyatlarla koruduk.</p>
        <div style="margin-top: 18px;">
          <a href="${cartUrl}" style="display: inline-block; padding: 10px 18px; background: #0f172a; color: #ffffff; border-radius: 10px; text-decoration: none; font-weight: 600;">Sepete dön</a>
        </div>
        <div style="margin-top: 24px;">
          <div style="font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8; font-weight: 700;">Sepet ozeti</div>
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
        <div style="margin-top: 18px; font-size: 12px; color: #94a3b8;">
          Bu hatırlatma e-postası otomatik olarak gönderilmiştir.
        </div>
      </div>
    `,
  });
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const headerSecret = req.headers.get('x-cron-secret');
  const querySecret = new URL(req.url).searchParams.get('secret');
  const vercelCron = req.headers.get('x-vercel-cron');
  const isAuthed =
    !secret || headerSecret === secret || querySecret === secret || vercelCron === '1';

  if (!isAuthed) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const reminders = await prismaReminders.cartReminder.findMany({
    where: { sentAt: null, updatedAt: { lt: cutoff } },
    take: 50,
    orderBy: { updatedAt: 'asc' },
  });

  let sent = 0;
  let skipped = 0;

  for (const reminder of reminders) {
    if (reminder.userId) {
      const recentOrder = await prismaReminders.order.findFirst({
        where: { userId: reminder.userId, createdAt: { gt: reminder.updatedAt } },
        select: { id: true },
      });
      if (recentOrder) {
        await prismaReminders.cartReminder.update({
          where: { id: reminder.id },
          data: { sentAt: new Date() },
          select: { id: true },
        });
        skipped += 1;
        continue;
      }
    }

    try {
      await sendReminderEmail({
        to: reminder.email,
        items: reminder.items,
        totalCents: reminder.totalCents,
      });
      await prismaReminders.cartReminder.update({
        where: { id: reminder.id },
        data: { sentAt: new Date() },
        select: { id: true },
      });
      sent += 1;
    } catch (error) {
      console.error('Sepet hatırlatma e-postası gönderilemedi:', error);
    }
  }

  return NextResponse.json({ sent, skipped });
}
