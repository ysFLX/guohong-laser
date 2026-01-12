import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type Payload = {
  adminResponse?: string;
  status?: 'NEW' | 'READ' | 'CLOSED';
};

type InquiryUpdateDelegate = {
  update: (args: unknown) => Promise<{ id: string; adminResponse: string | null; respondedAt: Date | null }>;
  findUnique: (args: unknown) => Promise<{
    id: string;
    userId: string | null;
    email: string | null;
    name: string | null;
    subject: string | null;
  } | null>;
};

const prismaInquiry = prisma as unknown as {
  inquiry: InquiryUpdateDelegate;
};

async function sendInquiryReplyEmail(params: {
  to: string;
  name: string | null;
  subject: string | null;
  adminResponse: string;
}) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return;
  }

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const safeName = params.name?.trim() || 'Musterimiz';
  const subjectText = params.subject?.trim() || 'Talebiniz';
  const responseHtml = params.adminResponse.replace(/\n/g, '<br />');

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
    subject: `${subjectText} - Yanit`,
    text: [
      `Merhaba ${safeName},`,
      '',
      'Talebinize yanit verdik:',
      params.adminResponse,
      '',
      'Baska bir sorunuz olursa bu e-postaya yanit verebilirsiniz.',
    ].join('\n'),
    html: `
      <div style="background: #f1f5f9; padding: 32px 12px;">
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 18px; background: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px;">
            <div>
              <div style="font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: #94a3b8;">Guohong Lazer</div>
              <h2 style="margin: 6px 0 0; color: #0b1120;">Talebinize yanit verdik</h2>
            </div>
            <span style="padding: 6px 12px; border-radius: 999px; background: #e6fffb; color: #0b3b36; font-size: 12px; font-weight: 700;">Destek Yaniti</span>
          </div>

          <p style="margin: 18px 0 8px; color: #0f172a; font-size: 15px;">Merhaba <strong>${safeName}</strong>,</p>
          <p style="margin: 0 0 18px; color: #475569;">${subjectText} hakkindaki talebinize cevap verdik.</p>

          <div style="padding: 16px; background: #f8fafc; border-radius: 14px; color: #0f172a; font-size: 15px; line-height: 1.6;">
            ${responseHtml}
          </div>

          <div style="margin-top: 18px; display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="${appUrl}/contact" style="display: inline-block; padding: 10px 16px; background: #0b1120; color: #ffffff; border-radius: 10px; text-decoration: none; font-weight: 600;">Destek iletisimi</a>
            <a href="${appUrl}/quote" style="display: inline-block; padding: 10px 16px; border: 1px solid #1f2937; color: #0b1120; border-radius: 10px; text-decoration: none; font-weight: 600;">Fiyat teklifi al</a>
          </div>

          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;">
            Bu e-posta otomatik olarak gonderilmistir. Yanitlamak isterseniz bu e-postaya cevap yazabilirsiniz.
          </div>
        </div>
      </div>
    `,
  });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  const { id } = await ctx.params;

  const inquiry = await prismaInquiry.inquiry.findUnique({
    where: { id },
    select: { id: true, userId: true, email: true, name: true, subject: true },
  });

  if (!inquiry) {
    return NextResponse.json({ error: 'Talep bulunamadi' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
  }

  const payload = body as Payload;

  const data: Record<string, unknown> = {
    respondedAt: new Date(),
    respondedByUserId: session.user.id,
  };

  if (typeof payload.adminResponse === 'string') {
    data.adminResponse = payload.adminResponse.trim() ? payload.adminResponse.trim() : null;
  }

  if (payload.status === 'NEW' || payload.status === 'READ' || payload.status === 'CLOSED') {
    data.status = payload.status;
  }

  try {
    const updated = await prismaInquiry.inquiry.update({
      where: { id },
      data,
      select: { id: true, adminResponse: true, respondedAt: true },
    });

    if (payload.adminResponse && payload.adminResponse.trim() && inquiry.email) {
      await sendInquiryReplyEmail({
        to: inquiry.email,
        name: inquiry.name,
        subject: inquiry.subject,
        adminResponse: payload.adminResponse.trim(),
      });
    }

    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
