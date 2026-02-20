import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const RESET_TTL_MINUTES = 30;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const RESEND_COOLDOWN_MS = 60 * 1000;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const normalizeEmail = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const getClientIp = (request: Request) => {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const realIp = request.headers.get('x-real-ip') || '';
  const raw = forwarded.split(',')[0]?.trim() || realIp.trim();
  return raw || 'unknown';
};

const hitRateLimit = (key: string) => {
  const now = Date.now();
  const existing = rateLimitStore.get(key);
  if (!existing || existing.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (existing.count >= RATE_LIMIT_MAX) {
    return true;
  }
  rateLimitStore.set(key, { count: existing.count + 1, resetAt: existing.resetAt });
  return false;
};

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (hitRateLimit(`password-reset:${ip}`)) {
      return new Response(JSON.stringify({ error: 'Cok fazla istek. Lutfen daha sonra tekrar deneyin.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!process.env.DATABASE_URL) {
      return new Response(
        JSON.stringify({ error: 'Sunucu yapılandırması hatası: DATABASE_URL tanımlı değil' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const safeEmail = normalizeEmail(body.email);

    if (!safeEmail || !emailRegex.test(safeEmail)) {
      return new Response(
        JSON.stringify({ error: 'Lütfen geçerli bir e-posta adresi girin' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return new Response(
        JSON.stringify({ error: 'SMTP ayarları bulunamadı. Lütfen e-posta gönderimi için ayarlarınızı yapılandırın.' }),
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

    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { email: safeEmail },
      select: { expiresAt: true },
    });
    if (
      existingToken?.expiresAt &&
      existingToken.expiresAt.getTime() - Date.now() > RESET_TTL_MINUTES * 60 * 1000 - RESEND_COOLDOWN_MS
    ) {
      return new Response(
        JSON.stringify({ error: 'Yeni sifirlama baglantisi icin lutfen kisa bir sure bekleyin.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
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
      subject: 'Parola sıfırlama bağlantınız',
      text: `Parolanızı sıfırlamak için bu bağlantıyı kullanın: ${resetUrl}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="margin-top: 0; color: #111827;">Parola sıfırlama</h2>
        <p>Parolanızı sıfırlamak için aşağıdaki bağlantıyı tıklayın:</p>
        <div style="margin: 16px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; border-radius: 8px; text-decoration: none;">Parolayı sıfırla</a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">Bu bağlantı ${RESET_TTL_MINUTES} dakika boyunca geçerlidir.</p>
      </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Parola sıfırlama isteği hatası:', error);
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return new Response(
      JSON.stringify({
        error:
          process.env.NODE_ENV === 'development'
            ? `Sunucu hatası: ${message}`
            : 'Sunucu hatası: Lütfen daha sonra tekrar deneyin',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
