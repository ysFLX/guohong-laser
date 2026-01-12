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
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1120; padding: 0; margin: 0;">
        <tr>
          <td align="center" style="padding: 36px 16px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 700px; background:#ffffff; border-radius: 22px; overflow: hidden; border: 1px solid #0f172a;">
              <tr>
                <td style="background: linear-gradient(135deg, #0b1120 0%, #0b3b36 100%); padding: 28px 28px;">
                  <div style="font-family: Arial, sans-serif; color:#ffffff;">
                    <div style="font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase; opacity: 0.7;">Guohong Lazer</div>
                    <div style="margin-top: 10px; font-size: 24px; font-weight: 700;">Talebinize premium yanit</div>
                    <div style="margin-top: 6px; font-size: 14px; opacity: 0.85;">${subjectText}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 26px 28px; font-family: Arial, sans-serif;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <div style="font-size: 16px; color:#0b1120;">Merhaba <strong>${safeName}</strong>,</div>
                        <div style="margin-top: 8px; color:#475569; font-size: 14px;">Talebinizi inceledik ve yanitimiz asagidadir.</div>
                      </td>
                      <td align="right">
                        <span style="display:inline-block; padding: 6px 12px; border-radius: 999px; background:#e6fffb; color:#0b3b36; font-size:12px; font-weight:700;">Destek Yaniti</span>
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top: 18px; padding: 18px; background:#f8fafc; border-radius: 14px; border: 1px solid #e2e8f0; color:#0f172a; font-size: 15px; line-height: 1.65;">
                    ${responseHtml}
                  </div>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 22px;">
                    <tr>
                      <td>
                        <a href="${appUrl}/contact" style="display:inline-block; padding: 12px 18px; background:#0b1120; color:#ffffff; border-radius: 10px; text-decoration:none; font-weight:600;">Destek iletisimi</a>
                      </td>
                      <td align="right">
                        <a href="${appUrl}/quote" style="display:inline-block; padding: 12px 18px; border: 1px solid #0b1120; color:#0b1120; border-radius: 10px; text-decoration:none; font-weight:600;">Fiyat teklifi al</a>
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top: 22px; padding-top: 16px; border-top: 1px solid #e2e8f0; color:#64748b; font-size: 12px;">
                    Bu e-posta otomatik olarak gonderilmistir. Yanitlamak isterseniz bu e-postaya cevap yazabilirsiniz.
                  </div>
                </td>
              </tr>
            </table>
            <div style="margin-top: 16px; color:#94a3b8; font-size: 11px; font-family: Arial, sans-serif;">
              Guohong Lazer • Kurumsal destek ekibi
            </div>
          </td>
        </tr>
      </table>
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
