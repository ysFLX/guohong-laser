import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { authOptions } from '@/auth';
import { buildEmailHtml } from '@/lib/emailTemplate';
import { escapeHtml, textToHtml } from '@/lib/htmlEscape';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const allowedStatuses = new Set(['NEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REFUNDED'] as const);
type AllowedStatus = (typeof allowedStatuses extends Set<infer T> ? T : never) & string;

const statusLabel: Record<string, string> = {
  NEW: 'Talep alındı',
  UNDER_REVIEW: 'İncelemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  REFUNDED: 'İade tamamlandı',
};

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  let body: { status?: string; adminNote?: string };
  try {
    body = (await req.json()) as { status?: string; adminNote?: string };
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status.trim() : '';
  const adminNote = typeof body.adminNote === 'string' ? body.adminNote.trim() : null;

  if (!status || !allowedStatuses.has(status as AllowedStatus)) {
    return NextResponse.json({ error: 'Durum geçersiz' }, { status: 400 });
  }

  const existing = await prisma.returnRequest.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      email: true,
      name: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
  }

  const updated = await prisma.returnRequest.update({
    where: { id },
    data: {
      status: status as AllowedStatus,
      adminNote,
      respondedAt: new Date(),
      respondedByUserId: session.user.id,
    },
    select: {
      id: true,
      status: true,
      adminNote: true,
      respondedAt: true,
    },
  });

  if (existing.status !== status) {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass && existing.email) {
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
        to: existing.email,
        subject: `İade talebi güncellendi (#${existing.id.slice(0, 8)})`,
        text: [
          `Talep durumunuz güncellendi: ${statusLabel[status] || status}`,
          adminNote ? `Not: ${adminNote}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        html: buildEmailHtml({
          title: 'İade talebiniz güncellendi',
          subtitle: `Talep no: #${existing.id.slice(0, 8)}`,
          badge: 'İade durumu',
          preheader: `Durum: ${statusLabel[status] || status}`,
          bodyHtml: `
            <div>Merhaba <strong>${escapeHtml(existing.name)}</strong>,</div>
            <div style="margin-top: 8px; color:#475569;">Talep durumunuz güncellendi.</div>
            <div style="margin-top: 14px; padding: 12px 14px; background:#f8fafc; border-radius: 10px; font-weight: 600;">
              ${statusLabel[status] || status}
            </div>
            ${
              adminNote
                ? `<div style="margin-top: 12px; padding: 12px; background: #eef2f7; border-radius: 8px;">
                    <div style="font-weight: 600; margin-bottom: 6px;">Not</div>
                    <div style="white-space: pre-line;">${textToHtml(adminNote)}</div>
                  </div>`
                : ''
            }
          `,
          footerNote: 'Bu e-posta otomatik olarak gönderilmiştir.',
        }),
      });
    }
  }

  return NextResponse.json({ item: updated });
}

