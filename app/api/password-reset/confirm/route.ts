import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
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
    if (hitRateLimit(`password-reset-confirm:${ip}`)) {
      return new Response(JSON.stringify({ error: 'Cok fazla istek. Lutfen daha sonra tekrar deneyin.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const safeEmail = normalizeEmail(body.email);
    const token = normalizeString(body.token);
    const newPassword = normalizeString(body.password);

    if (!safeEmail || !emailRegex.test(safeEmail) || !token || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'E-posta, token ve yeni şifre zorunludur' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Åifre en az 6 karakter olmalıdır' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { email: safeEmail },
    });

    if (!record) {
      return new Response(
        JSON.stringify({ error: 'Parola sıfırlama isteği bulunamadı' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await prisma.passwordResetToken.delete({ where: { email: safeEmail } });
      return new Response(
        JSON.stringify({ error: 'Parola sıfırlama bağlantısının süresi doldu' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const tokenHash = hashToken(token);
    if (tokenHash !== record.tokenHash) {
      return new Response(
        JSON.stringify({ error: 'Parola sıfırlama bağlantısı geçersiz' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: safeEmail },
        data: { hashedPassword, emailVerified: new Date() },
      });
      await tx.passwordResetToken.delete({ where: { email: safeEmail } });
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Parola sıfırlama onay hatası:', error);
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

