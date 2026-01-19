// app/api/contact/route.ts
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
      return NextResponse.json({ error: 'Cok fazla istek. Lutfen sonra tekrar deneyin.' }, { status: 429 });
    } else {
      rateLimitStore.set(ip, { count: existing.count + 1, resetAt: existing.resetAt });
    }

    const session = await getServerSession(authOptions);
    const formData = await request.json();

    const name = normalizeString(formData.name);
    const subject = normalizeString(formData.subject);
    const message = normalizeString(formData.message);
    const safeEmail = normalizeEmail(formData.email);
    const otp = normalizeString(formData.otp);

    if (!name || !safeEmail || !message) {
      return NextResponse.json({ error: 'Eksik alanlar var.' }, { status: 400 });
    }

    if (!emailRegex.test(safeEmail)) {
      return NextResponse.json({ error: 'Lutfen dogru bir e-posta adresi giriniz.' }, { status: 400 });
    }

    const domainOk = await ensureEmailDomain(safeEmail);
    if (!domainOk) {
      return NextResponse.json({ error: 'Lutfen dogru bir e-posta adresi giriniz.' }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({ error: 'SMTP ayarlari bulunamadi.' }, { status: 500 });
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
        subject: 'Dogrulama kodunuz',
        text: `Dogrulama kodunuz: ${code}. Bu kod ${CODE_TTL_MINUTES} dakika gecerlidir.`,
        html: buildEmailHtml({
          title: 'Dogrulama kodu',
          subtitle: 'Formu gonderebilmek icin kodunuz',
          badge: 'Guvenli dogrulama',
          preheader: `Dogrulama kodunuz: ${code}`,
          bodyHtml: `
            <div style="margin: 12px 0; padding: 16px; background:#0b1120; color:#ffffff; text-align:center; border-radius: 12px; font-size: 26px; letter-spacing: 6px; font-weight: 700;">
              ${code}
            </div>
            <div style="color:#64748b; font-size: 13px;">Bu kod ${CODE_TTL_MINUTES} dakika boyunca gecerlidir.</div>
          `,
          footerNote: 'Bu kodu kimseyle paylasmayin.',
        }),
      });

      return NextResponse.json({ step: 'verify', message: 'Dogrulama kodu gonderildi.' }, { status: 200 });
    }

    const otpRecord = await prisma.inquiryOtp.findUnique({
      where: { email: safeEmail },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Dogrulama kodu bulunamadi.' }, { status: 400 });
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      await prisma.inquiryOtp.delete({ where: { email: safeEmail } });
      return NextResponse.json({ error: 'Dogrulama kodu suresi doldu.' }, { status: 400 });
    }

    const otpMatch = await bcrypt.compare(otp, otpRecord.codeHash);
    if (!otpMatch) {
      return NextResponse.json({ error: 'Dogrulama kodu hatali.' }, { status: 400 });
    }

    await prisma.inquiryOtp.delete({ where: { email: safeEmail } });

    const inferredType = formData.company || formData.product ? 'QUOTE' : 'CONTACT';

    try {
      await (prisma as unknown as { inquiry: { create: (args: unknown) => Promise<unknown> } }).inquiry.create({
        data: {
          type: inferredType,
          name: String(name),
          email: safeEmail,
          phone: formData.phone ? String(formData.phone) : null,
          company: formData.company ? String(formData.company) : null,
          subject: subject ? String(subject) : null,
          product: formData.product ? String(formData.product) : null,
          message: String(message),
          userId: session?.user?.id ?? null,
        },
      });
    } catch (e) {
      console.error('Inquiry kaydi olusturulamadi:', e);
      return NextResponse.json(
        {
          error: 'Talebiniz kaydedilemedi. Lutfen daha sonra tekrar deneyin.',
        },
        { status: 500 },
      );
    }

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

    const mailOptions = {
      from: `"${name}" <${smtpUser}>`,
      to: smtpUser,
      replyTo: safeEmail,
      subject: `${subject || 'Iletisim'} - Iletisim Formu`,
      text: message,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e40af; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">${subject || 'Iletisim'}</h2>

        <div style="margin: 15px 0; padding: 15px; background-color: #f8fafc; border-radius: 6px;">
          <p><strong>Gonderen:</strong> ${name}</p>
          <p><strong>E-posta:</strong> ${safeEmail}</p>
          ${formData.phone ? `<p><strong>Telefon:</strong> ${formData.phone}</p>` : ''}
          ${formData.company ? `<p><strong>Firma:</strong> ${formData.company}</p>` : ''}
          ${formData.product ? `<p><strong>Urun:</strong> ${formData.product}</p>` : ''}
        </div>

        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Mesaj Icerigi:</h3>
          <p style="white-space: pre-line; margin: 0;">${message}</p>
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    await transporter.sendMail({
      from: `Guohong Lazer <${smtpUser}>`,
      to: safeEmail,
      subject: 'Talebiniz alindi',
      text: 'Talebinizi aldik. En kisa surede sizinle iletisime gececegiz.',
      html: buildEmailHtml({
        title: 'Talebiniz alindi',
        subtitle: inferredType === 'QUOTE' ? 'Fiyat teklifi talebiniz alindi' : 'Iletisim talebiniz alindi',
        badge: inferredType === 'QUOTE' ? 'Fiyat teklifi' : 'Iletisim',
        preheader: 'Talebinizi aldik. En kisa surede donus yapacagiz.',
        bodyHtml: `
          <div>Merhaba <strong>${String(name)}</strong>,</div>
          <div style="margin-top: 8px; color:#475569;">Talebinizi aldik. En kisa surede sizinle iletisime gececegiz.</div>
          <div style="margin-top: 14px; padding: 14px; background:#f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color:#94a3b8; text-transform: uppercase; letter-spacing: 0.12em;">Ozet</div>
            <div style="margin-top: 8px;"><strong>Tur:</strong> ${inferredType === 'QUOTE' ? 'Fiyat Teklifi' : 'Iletisim'}</div>
            ${formData.product ? `<div style="margin-top: 6px;"><strong>Urun:</strong> ${formData.product}</div>` : ''}
            ${subject ? `<div style="margin-top: 6px;"><strong>Konu:</strong> ${subject}</div>` : ''}
          </div>
        `,
        primaryCta: { label: 'Destek iletisimi', href: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/contact` },
        footerNote: 'Bu e-posta otomatik olarak gonderilmistir.',
      }),
    });

    return NextResponse.json({ success: true, mailed: true });
  } catch (error) {
    console.error('E-posta gonderilirken hata olustu:', error);
    return NextResponse.json(
      { error: 'E-posta gonderilirken bir hata olustu.' },
      { status: 500 },
    );
  }
}
