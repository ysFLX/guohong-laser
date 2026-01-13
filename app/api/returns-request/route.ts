import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { promises as dns } from 'dns';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

const CODE_TTL_MINUTES = 10;
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const normalizeEmail = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

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
    const session = await getServerSession(authOptions);
    const formData = await request.json();

    const name = normalizeString(formData.name);
    const orderId = normalizeString(formData.orderId);
    const reason = normalizeString(formData.reason);
    const resolution = normalizeString(formData.resolution) || 'Iade';
    const itemName = normalizeString(formData.itemName);
    const phone = normalizeString(formData.phone);
    const safeEmail = normalizeEmail(formData.email);
    const otp = normalizeString(formData.otp);
    const evidenceUrls = Array.isArray(formData.evidenceUrls)
      ? formData.evidenceUrls.filter((url) => typeof url === 'string' && url.trim().length > 0)
      : [];

    if (!name || !safeEmail || !orderId || !reason) {
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
        subject: 'Iade talebi dogrulama kodu',
        text: `Dogrulama kodunuz: ${code}. Bu kod ${CODE_TTL_MINUTES} dakika gecerlidir.`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="margin-top: 0; color: #111827;">Dogrulama kodu</h2>
          <p>Iade talebinizi gonderebilmek icin dogrulama kodunuz:</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0; color: #0f172a;">${code}</div>
          <p style="margin: 0; color: #6b7280;">Bu kod ${CODE_TTL_MINUTES} dakika boyunca gecerlidir.</p>
        </div>
        `,
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
      subject: `Iade talebi (#${created.id.slice(0, 8)})`,
      text: [
        `Iade talebi: ${created.id}`,
        `Ad: ${name}`,
        `E-posta: ${safeEmail}`,
        phone ? `Telefon: ${phone}` : '',
        `Siparis: ${orderId}`,
        itemName ? `Urun: ${itemName}` : '',
        `Talep: ${resolution}`,
        `Neden: ${reason}`,
        evidenceUrls.length ? `Kanit: ${evidenceUrls.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-top: 0;">Iade talebi alindi</h2>
        <div style="margin: 12px 0; padding: 12px; background: #f8fafc; border-radius: 8px;">
          <div><strong>Talep no:</strong> ${created.id}</div>
          <div><strong>Musteri:</strong> ${name}</div>
          <div><strong>E-posta:</strong> ${safeEmail}</div>
          ${phone ? `<div><strong>Telefon:</strong> ${phone}</div>` : ''}
          <div><strong>Siparis:</strong> ${orderId}</div>
          ${itemName ? `<div><strong>Urun:</strong> ${itemName}</div>` : ''}
          <div><strong>Talep:</strong> ${resolution}</div>
        </div>
        <div style="margin: 12px 0; padding: 12px; background: #eef2f7; border-radius: 8px;">
          <div style="font-weight: 600; margin-bottom: 6px;">Neden</div>
          <div style="white-space: pre-line;">${reason}</div>
        </div>
        ${
          evidenceUrls.length
            ? `<div style="margin-top: 12px;"><div style="font-weight: 600;">Kanit dosyalari</div><ul>${evidenceLinks}</ul></div>`
            : ''
        }
      </div>
      `,
    });

    await transporter.sendMail({
      from: `Guohong Lazer <${smtpUser}>`,
      to: safeEmail,
      subject: 'Iade talebiniz alindi',
      text: `Talebinizi aldik. Talep numaraniz: ${created.id}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0f172a; margin-top: 0;">Iade talebiniz alindi</h2>
        <p>Merhaba <strong>${name}</strong>,</p>
        <p>Talebinizi aldik. Talep numaraniz: <strong>${created.id.slice(0, 8)}</strong>.</p>
        <p>Teknik ekip degerlendirme yaptiktan sonra sizi bilgilendirecegiz.</p>
      </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Iade talebi hatasi:', error);
    return NextResponse.json({ error: 'Talep gonderilemedi.' }, { status: 500 });
  }
}
