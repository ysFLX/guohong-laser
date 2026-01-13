import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const allowedStatuses = new Set(['NEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REFUNDED'] as const);
type AllowedStatus = (typeof allowedStatuses extends Set<infer T> ? T : never) & string;

const statusLabel: Record<string, string> = {
  NEW: 'Talep alindi',
  UNDER_REVIEW: 'Incelemede',
  APPROVED: 'Onaylandi',
  REJECTED: 'Reddedildi',
  REFUNDED: 'Iade tamamlandi',
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
    return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status.trim() : '';
  const adminNote = typeof body.adminNote === 'string' ? body.adminNote.trim() : null;

  if (!status || !allowedStatuses.has(status as AllowedStatus)) {
    return NextResponse.json({ error: 'Durum gecersiz' }, { status: 400 });
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
    return NextResponse.json({ error: 'Talep bulunamadi' }, { status: 404 });
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
        subject: `Iade talebi guncellendi (#${existing.id.slice(0, 8)})`,
        text: [
          `Talep durumunuz guncellendi: ${statusLabel[status] || status}`,
          adminNote ? `Not: ${adminNote}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="margin-top: 0; color: #0f172a;">Iade talebiniz guncellendi</h2>
          <p>Merhaba <strong>${existing.name}</strong>,</p>
          <div style="margin: 12px 0; padding: 10px 14px; background: #f8fafc; border-radius: 8px; font-weight: 600;">
            ${statusLabel[status] || status}
          </div>
          ${
            adminNote
              ? `<div style="margin-top: 12px; padding: 12px; background: #eef2f7; border-radius: 8px;">
                  <div style="font-weight: 600; margin-bottom: 6px;">Not</div>
                  <div style="white-space: pre-line;">${adminNote}</div>
                </div>`
              : ''
          }
        </div>
        `,
      });
    }
  }

  return NextResponse.json({ item: updated });
}
