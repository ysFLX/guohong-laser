import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { authOptions } from '@/auth';
import { buildEmailHtml } from '@/lib/emailTemplate';
import { prisma } from '@/lib/prisma';
import { completeLeasedInvoice, leasePendingInvoices } from '@/lib/invoicing/service';

export const runtime = 'nodejs';

type Body = {
  limit?: number;
};

function escapePdfText(input: string) {
  return input.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
}

function createMinimalPdf(lines: string[]) {
  const safeLines = lines.map((line) => escapePdfText(line)).slice(0, 40);

  const chunks: string[] = [];
  const offsets: number[] = [];
  let offset = 0;

  const push = (value: string) => {
    chunks.push(value);
    offset += Buffer.byteLength(value, 'utf8');
  };

  push('%PDF-1.4\n');

  offsets[1] = offset;
  push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  offsets[2] = offset;
  push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  offsets[3] = offset;
  push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n',
  );

  const contentLines = safeLines.length ? safeLines : ['PROFORMA'];
  const content = `BT\n/F1 12 Tf\n16 TL\n72 760 Td\n${contentLines
    .map((line, idx) => `${idx === 0 ? '' : 'T*\\n'}(${line}) Tj`)
    .join('\\n')}\nET\n`;

  offsets[4] = offset;
  push(`4 0 obj\n<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}endstream\nendobj\n`);

  offsets[5] = offset;
  push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  const xrefOffset = offset;
  push('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i += 1) {
    const pos = String(offsets[i] || 0).padStart(10, '0');
    push(`${pos} 00000 n \n`);
  }
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return Buffer.from(chunks.join(''), 'utf8');
}

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
            createdAt: true,
            totalCents: true,
            currency: true,
            user: { select: { name: true, email: true } },
            items: { select: { name: true, quantity: true, priceCents: true } },
          },
        });

        const to = order?.user?.email || null;
        if (!order || !to) {
          throw new Error('Müşteri e-postası bulunamadı');
        }

        const invoiceNumber = `PROFORMA-${order.id.slice(0, 8)}`;
        const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString('tr-TR') : '';
        const totalTry = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
          (order.totalCents || 0) / 100,
        );

        const lines: string[] = [
          'PROFORMA / GEÇİCİ BELGE',
          `Belge no: ${invoiceNumber}`,
          `Sipariş: #${order.id.slice(0, 8)}`,
          createdAt ? `Tarih: ${createdAt}` : '',
          order.user?.name ? `Müşteri: ${order.user.name}` : `Müşteri: ${to}`,
          '',
          'Ürünler:',
          ...(order.items || []).map((it) => `- ${it.name} x${it.quantity} (${(it.priceCents / 100).toFixed(2)} TL)`),
          '',
          `Toplam: ${totalTry}`,
          '',
          'Not: Resmi e-Fatura ayrı iletilecektir.',
        ].filter(Boolean);

        const pdfBuffer = createMinimalPdf(lines);
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
