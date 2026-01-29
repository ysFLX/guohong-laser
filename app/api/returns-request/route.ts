import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { promises as dns } from 'dns';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { buildEmailHtml } from '@/lib/emailTemplate';
import { prisma } from '@/lib/prisma';

const CODE_TTL_MINUTES = 10;
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const normalizeEmail = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const getClientIp = (request: Request) => {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const realIp = request.headers.get('x-real-ip') || '';
  const raw = forwarded.split(',')[0]?.trim() || realIp.trim();
  return raw || 'unknown';
};

async function ensureEmailDomain(email: string) {
  const domain = email.split('@')[1] || '';
  if (!domain) {
    return false;
  }
  try {
    const records = await dns.resolveMx(domain);
    return Boolean(records && records.length > 0);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const now = Date.now();
    const existing = rateLimitStore.get(ip);
    if (!existing || existing.resetAt < now) {
      rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    } else if (existing.count >= RATE_LIMIT_MAX) {
      return NextResponse.json({ error: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' }, { status: 429 });
    } else {
      rateLimitStore.set(ip, { count: existing.count + 1, resetAt: existing.resetAt });
    }

    const session = await getServerSession(authOptions);
    const formData = await request.json();

    const name = normalizeString(formData.name);
    const orderId = normalizeString(formData.orderId);
    const reason = normalizeString(formData.reason);
    const resolution = normalizeString(formData.resolution) || 'İade';
    const itemName = normalizeString(formData.itemName);
    const phone = normalizeString(formData.phone);
    const safeEmail = normalizeEmail(formData.email);
    const otp = normalizeString(formData.otp);
    const evidenceUrls = Array.isArray(formData.evidenceUrls)
      ? (formData.evidenceUrls as unknown[]).filter(
          (url): url is string => typeof url === 'string' && url.trim().length > 0,
        )
      : [];

    if (!name || !safeEmail || !orderId || !reason) {
      return NextResponse.json({ error: 'Eksik alanlar var.' }, { status: 400 });
    }

    if (!emailRegex.test(safeEmail)) {
      return NextResponse.json({ error: 'Lütfen doğru bir e-posta adresi giriniz.' }, { status: 400 });
    }

    const domainOk = await ensureEmailDomain(safeEmail);
    if (!domainOk) {
      return NextResponse.json({ error: 'Lütfen doğru bir e-posta adresi giriniz.' }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({ error: 'SMTP ayarları bulunamadı.' }, { status: 500 });
    }

    if (!otp) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

      await prisma.inquiryOtp.upsert({
        where: { email: safeEmail },
        create: {
          email: safeEmail,
          codeHash,
          expiresAt,
        },
        update: {
          codeHash,
          expiresAt,
        },
      });

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
        to: safeEmail,
        subject: 'İade talebi doğrulama kodu',
        text: `Doğrulama kodunuz: ${code}. Bu kod ${CODE_TTL_MINUTES} dakika geçerlidir.`,
        html: buildEmailHtml({
          title: 'İade talebi doğrulama',
          subtitle: 'İade talebinizi göndermek için kodunuzu girin',
          badge: 'Doğrulama',
          preheader: `Doğrulama kodunuz: ${code}`,
          bodyHtml: `
            <div style="margin: 12px 0; padding: 16px; background:#0b1120; color:#ffffff; text-align:center; border-radius: 12px; font-size: 26px; letter-spacing: 6px; font-weight: 700;">
              ${code}
            </div>
            <div style="color:#64748b; font-size: 13px;">Bu kod ${CODE_TTL_MINUTES} dakika boyunca geçerlidir.</div>
          `,
          footerNote: 'Bu kodu kimseyle paylaşmayın.',
        }),
      });

      return NextResponse.json({ step: 'verify', message: 'Doğrulama kodu gönderildi.' }, { status: 200 });
    }

    const otpRecord = await prisma.inquiryOtp.findUnique({
      where: { email: safeEmail },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Doğrulama kodu bulunamadı.' }, { status: 400 });
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      await prisma.inquiryOtp.delete({ where: { email: safeEmail } });
      return NextResponse.json({ error: 'Doğrulama kodu süresi doldu.' }, { status: 400 });
    }

    const otpMatch = await bcrypt.compare(otp, otpRecord.codeHash);
    if (!otpMatch) {
      return NextResponse.json({ error: 'Doğrulama kodu hatalı.' }, { status: 400 });
    }

    await prisma.inquiryOtp.delete({ where: { email: safeEmail } });

    const created = await prisma.returnRequest.create({
      data: {
        userId: session?.user?.id ?? null,
        name,
        email: safeEmail,
        phone: phone || null,
        orderId,
        itemName: itemName || null,
        reason,
        resolution,
        evidenceUrls,
      },
      select: { id: true },
    });

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

    const evidenceLinks = evidenceUrls
      .map((url) => `<li><a href="${url}" target="_blank" rel="noreferrer">${url}</a></li>`)
      .join('');

    await transporter.sendMail({
      from: `"${name}" <${smtpUser}>`,
      to: smtpUser,
      replyTo: safeEmail,
      subject: `İade talebi (#${created.id.slice(0, 8)})`,
      text: [
        `İade talebi: ${created.id}`,
        `Ad: ${name}`,
        `E-posta: ${safeEmail}`,
        phone ? `Telefon: ${phone}` : '',
        `Sipariş: ${orderId}`,
        itemName ? `Ürün: ${itemName}` : '',
        `Talep: ${resolution}`,
        `Neden: ${reason}`,
        evidenceUrls.length ? `Kanıt: ${evidenceUrls.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-top: 0;">İade talebi alındı</h2>
        <div style="margin: 12px 0; padding: 12px; background: #f8fafc; border-radius: 8px;">
          <div><strong>Talep no:</strong> ${created.id}</div>
          <div><strong>Müşteri:</strong> ${name}</div>
          <div><strong>E-posta:</strong> ${safeEmail}</div>
          ${phone ? `<div><strong>Telefon:</strong> ${phone}</div>` : ''}
          <div><strong>Sipariş:</strong> ${orderId}</div>
          ${itemName ? `<div><strong>Ürün:</strong> ${itemName}</div>` : ''}
          <div><strong>Talep:</strong> ${resolution}</div>
        </div>
        <div style="margin: 12px 0; padding: 12px; background: #eef2f7; border-radius: 8px;">
          <div style="font-weight: 600; margin-bottom: 6px;">Neden</div>
          <div style="white-space: pre-line;">${reason}</div>
        </div>
        ${
          evidenceUrls.length
            ? `<div style="margin-top: 12px;"><div style="font-weight: 600;">Kanıt dosyaları</div><ul>${evidenceLinks}</ul></div>`
            : ''
        }
      </div>
      `,
    });

    await transporter.sendMail({
      from: `Guohong Lazer <${smtpUser}>`,
      to: safeEmail,
      subject: 'İade talebiniz alındı',
      text: `Talebinizi aldık. Talep numaranız: ${created.id}`,
      html: buildEmailHtml({
        title: 'İade talebiniz alındı',
        subtitle: `Talep no: #${created.id.slice(0, 8)}`,
        badge: 'İade talebi',
        preheader: `Talep no: ${created.id.slice(0, 8)}`,
        bodyHtml: `
          <div>Merhaba <strong>${name}</strong>,</div>
          <div style="margin-top: 8px; color:#475569;">Talebinizi aldık. Teknik ekip değerlendirmeyi yaptıktan sonra sizi bilgilendireceğiz.</div>
          <div style="margin-top: 14px; padding: 14px; background:#f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color:#94a3b8; text-transform: uppercase; letter-spacing: 0.12em;">Ozet</div>
            <div style="margin-top: 8px;"><strong>Talep:</strong> ${resolution}</div>
            ${itemName ? `<div style="margin-top: 6px;"><strong>Ürün:</strong> ${itemName}</div>` : ''}
            <div style="margin-top: 6px;"><strong>Sipariş:</strong> ${orderId}</div>
          </div>
        `,
        primaryCta: { label: 'İade durumu', href: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/profile` },
        footerNote: 'Bu e-posta otomatik olarak gönderilmiştir.',
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('İade talebi hatası:', error);
    return NextResponse.json({ error: 'Talep gönderilemedi.' }, { status: 500 });
  }
}
