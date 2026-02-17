import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { authOptions } from '@/auth';
import { buildEmailHtml } from '@/lib/emailTemplate';
import { createProformaPdf } from '@/lib/invoicing/proformaPdf';
import { prisma } from '@/lib/prisma';
import { completeLeasedInvoice, leasePendingInvoices } from '@/lib/invoicing/service';

export const runtime = 'nodejs';

type Body = {
  limit?: number;
};

function getEmailTransporter() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

function mergeProviderPayload(existing: unknown, patch: Record<string, unknown>) {
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    return { ...(existing as Record<string, unknown>), ...patch };
  }
  if (existing == null) return patch;
  return { payload: existing, ...patch };
}

async function markEmailMeta(params: {
  invoiceId: string;
  to: string;
  sentAt?: string;
  lastError?: string;
  lastAttemptAt: string;
}) {
  const existing = await prisma.invoice.findUnique({
    where: { id: params.invoiceId },
    select: { id: true, providerPayload: true },
  });

  const providerPayload = mergeProviderPayload(existing?.providerPayload ?? null, {
    email: {
      to: params.to,
      sentAt: params.sentAt || null,
      lastError: params.lastError || null,
      lastAttemptAt: params.lastAttemptAt,
    },
  });

  await prisma.invoice.update({
    where: { id: params.invoiceId },
    data: { providerPayload: providerPayload as any },
  });
}

async function sendProformaEmail(params: {
  to: string;
  customerName: string | null;
  orderId: string;
  invoiceNumber: string;
  pdfBuffer: Buffer;
}) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error('SMTP env eksik (SMTP_USER/SMTP_PASS).');
  }

  const smtpUser = process.env.SMTP_USER as string;
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const orderUrl = `${appUrl}/profile/orders/${params.orderId}`;

  const displayName = params.customerName || params.to;

  await transporter.sendMail({
    from: `Guohong Lazer <${smtpUser}>`,
    to: params.to,
    subject: `Proforma belgesi hazır (#${params.orderId.slice(0, 8)})`,
    text: [
      `Merhaba ${displayName},`,
      '',
      `Siparişiniz için proforma/sipariş belgesi oluşturuldu.`,
      `Belge no: ${params.invoiceNumber}`,
      `Sipariş detayları: ${orderUrl}`,
      '',
      'Not: Bu belge proforma / geçici belgedir. Resmi e-Fatura ayrı iletilecektir.',
    ].join('\n'),
    html: buildEmailHtml({
      title: 'Proforma belgesi hazır',
      subtitle: `Sipariş #${params.orderId.slice(0, 8)}`,
      badge: 'Proforma',
      preheader: `Belge no: ${params.invoiceNumber}`,
      bodyHtml: `
        <div style="color:#475569;">Siparişiniz için proforma / sipariş belgesi oluşturuldu.</div>
        <div style="margin-top: 10px; font-size: 14px; color: #0f172a;"><strong>Belge no:</strong> ${params.invoiceNumber}</div>
        <div style="margin-top: 12px; padding: 12px; background: #f8fafc; border-radius: 10px; font-size: 13px; color: #475569;">
          Not: Bu belge proforma / geçici belgedir. Resmi e-Fatura ayrı iletilecektir.
        </div>
      `,
      primaryCta: { label: 'Sipariş detayları', href: orderUrl },
      footerNote: 'Bu e-posta otomatik olarak gönderilmiştir.',
    }),
    attachments: [
      {
        filename: `Proforma-${params.orderId.slice(0, 8)}.pdf`,
        content: params.pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return NextResponse.json({ error: 'SMTP env eksik (SMTP_USER/SMTP_PASS).' }, { status: 400 });
  }

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {};
  }

  const limit = Math.max(1, Math.min(25, typeof body.limit === 'number' ? body.limit : 10));

  const nowIso = new Date().toISOString();
  const errors: Array<{ invoiceId: string; orderId: string; error: string }> = [];
  let issuedCount = 0;
  let emailedCount = 0;

  try {
    const leased = await leasePendingInvoices({ limit });

    for (const item of leased.items) {
      const invoiceId = item.invoice.id;
      const orderId = item.invoice.orderId;
      const lockToken = item.lockToken;

      try {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: {
            id: true,
            status: true,
            createdAt: true,
            totalCents: true,
            currency: true,
            user: { select: { name: true, email: true } },
            items: { select: { name: true, quantity: true, priceCents: true } },
            billingAddress: {
              select: {
                label: true,
                fullName: true,
                phone: true,
                line1: true,
                line2: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
                invoiceType: true,
                companyName: true,
                taxOffice: true,
                taxNumber: true,
                identityNumber: true,
              },
            },
            shippingAddress: {
              select: {
                label: true,
                fullName: true,
                phone: true,
                line1: true,
                line2: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
                invoiceType: true,
                companyName: true,
                taxOffice: true,
                taxNumber: true,
                identityNumber: true,
              },
            },
          },
        });

        const to = order?.user?.email || null;
        if (!order || !to) {
          throw new Error('Müşteri e-postası bulunamadı');
        }

        const invoiceNumber = `PROFORMA-${order.id.slice(0, 8)}`;
        const pdfBuffer = await createProformaPdf({ order, invoiceNumber, issuedAtIso: nowIso });
        const xmlBuffer = Buffer.from(
          `<?xml version="1.0" encoding="UTF-8"?><Proforma orderId="${order.id}" issuedAt="${nowIso}" />`,
          'utf8',
        );

        await completeLeasedInvoice({
          invoiceId,
          lockToken,
          invoiceNumber,
          ettn: null,
          pdfBuffer,
          xmlBuffer,
          providerPayload: {
            kind: 'PROFORMA',
            generatedAt: nowIso,
            generatedBy: 'admin-batch',
          },
        });

        issuedCount += 1;

        try {
          await sendProformaEmail({
            to,
            customerName: order.user?.name ?? null,
            orderId: order.id,
            invoiceNumber,
            pdfBuffer,
          });
          emailedCount += 1;
          await markEmailMeta({ invoiceId, to, sentAt: nowIso, lastAttemptAt: nowIso });
        } catch (emailError) {
          const message = emailError instanceof Error ? emailError.message : 'E-posta gönderilemedi';
          await markEmailMeta({ invoiceId, to, lastError: message, lastAttemptAt: nowIso });
          errors.push({ invoiceId, orderId, error: message });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'İşlem başarısız';
        errors.push({ invoiceId, orderId, error: message });
        // Lock alındıysa en azından kilidi boşa çıkaralım:
        try {
          await prisma.invoice.updateMany({
            where: { id: invoiceId, lockedBy: lockToken },
            data: { status: 'FAILED', errorMessage: message, lockedAt: null, lockedBy: null },
          });
        } catch {
          // ignore
        }
      }
    }

    return NextResponse.json({
      ok: true,
      limit,
      issuedCount,
      emailedCount,
      errorCount: errors.length,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'İşlem başarısız';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
