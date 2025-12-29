import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const RESET_TTL_MINUTES = 30;

const normalizeEmail = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return new Response(
        JSON.stringify({ error: 'Sunucu yapilandirma hatasi: DATABASE_URL tanimli degil' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const safeEmail = normalizeEmail(body.email);

    if (!safeEmail || !emailRegex.test(safeEmail)) {
      return new Response(
        JSON.stringify({ error: 'Lutfen gecerli bir e-posta adresi girin' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return new Response(
        JSON.stringify({ error: 'SMTP ayarlari bulunamadi. Lutfen e-posta gonderimi icin ayarlarinizi yapilandirin.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: safeEmail },
      select: { id: true },
    });

    if (!existingUser) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.upsert({
      where: { email: safeEmail },
      create: {
        email: safeEmail,
        tokenHash,
        expiresAt,
      },
      update: {
        tokenHash,
        expiresAt,
      },
    });

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(safeEmail)}`;

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
      subject: 'Parola sifirlama baglantiniz',
      text: `Parolanizi sifirlamak icin bu baglantiyi kullanin: ${resetUrl}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="margin-top: 0; color: #111827;">Parola sifirlama</h2>
        <p>Parolanizi sifirlamak icin asagidaki baglantiya tiklayin:</p>
        <div style="margin: 16px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; border-radius: 8px; text-decoration: none;">Parolayi sifirla</a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">Bu baglanti ${RESET_TTL_MINUTES} dakika boyunca gecerlidir.</p>
      </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Parola sifirlama istegi hatasi:', error);
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return new Response(
      JSON.stringify({
        error:
          process.env.NODE_ENV === 'development'
            ? `Sunucu hatasi: ${message}`
            : 'Sunucu hatasi: Lutfen daha sonra tekrar deneyin',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
