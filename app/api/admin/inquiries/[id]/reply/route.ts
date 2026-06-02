import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { authOptions } from '@/auth';
import { buildEmailHtml } from '@/lib/emailTemplate';
import { escapeHtml, textToHtml } from '@/lib/htmlEscape';
import { appendInquiryAdminResponse } from '@/lib/inquiryAdminResponses';
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
    adminResponse: string | null;
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
  const safeName = params.name?.trim() || 'Müşterimiz';
  const subjectText = params.subject?.trim() || 'Talebiniz';
  const responseHtml = textToHtml(params.adminResponse);

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
      'Talebinize yanıt verildi:',
      params.adminResponse,
      '',
      'Başka bir sorunuz olursa bu e-postaya yanıt verebilirsiniz.',
    ].join('\n'),
    html: buildEmailHtml({
      title: 'Talebinize yanıt verildi',
      subtitle: subjectText,
      badge: 'Destek yanıtı',
      preheader: 'Talebinize yanıt verildi.',
      bodyHtml: `
        <div>Merhaba <strong>${escapeHtml(safeName)}</strong>,</div>
        <div style="margin-top: 8px; color:#475569;">Talebinizi inceledik ve yanıtımız aşağıdadır.</div>
        <div style="margin-top: 16px; padding: 16px; background:#f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; color:#0f172a; line-height: 1.65;">
          ${responseHtml}
        </div>
      `,
      primaryCta: { label: 'Destek iletisimi', href: `${appUrl}/contact` },
      secondaryCta: { label: 'Fiyat teklifi al', href: `${appUrl}/quote` },
      footerNote: 'Bu e-posta otomatik olarak gönderilmiştir. Yanıtlamak isterseniz bu e-postaya cevap yazabilirsiniz.',
    }),
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
    select: { id: true, userId: true, email: true, name: true, subject: true, adminResponse: true },
  });

  if (!inquiry) {
    return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const payload = body as Payload;

  const data: Record<string, unknown> = {
    respondedAt: new Date(),
    respondedByUserId: session.user.id,
  };

  if (typeof payload.adminResponse === 'string') {
    data.adminResponse = appendInquiryAdminResponse(inquiry.adminResponse ?? null, payload.adminResponse, {
      senderName: session.user.name || 'Destek',
      senderUserId: session.user.id,
    });
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


