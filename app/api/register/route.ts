import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const CODE_TTL_MINUTES = 10;
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 12;
const RESEND_COOLDOWN_MS = 60 * 1000;
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

const sanitizeAddress = (value: unknown) => {
  if (!value || typeof value !== 'object') return null;
  const address = value as Record<string, unknown>;
  return {
    label: normalizeString(address.label) || null,
    line1: normalizeString(address.line1) || null,
    line2: normalizeString(address.line2) || null,
    city: normalizeString(address.city) || null,
    state: normalizeString(address.state) || null,
    postalCode: normalizeString(address.postalCode) || null,
    country: normalizeString(address.country) || null,
  };
};

const buildAddressData = (
  address: Record<string, unknown> | null,
  fullName: string,
  phone: string
) => {
  if (!address) return null;
  return {
    label: normalizeString(address.label) || null,
    fullName,
    phone: phone || null,
    line1: normalizeString(address.line1) || null,
    line2: normalizeString(address.line2) || null,
    city: normalizeString(address.city) || null,
    state: normalizeString(address.state) || null,
    postalCode: normalizeString(address.postalCode) || null,
    country: normalizeString(address.country) || null,
    isDefault: true,
  };
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (hitRateLimit(`register:${ip}`)) {
      return new Response(JSON.stringify({ error: 'Cok fazla istek. Lutfen daha sonra tekrar deneyin.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!process.env.DATABASE_URL) {
      return new Response(
        JSON.stringify({ error: 'Sunucu yapılandırması hatası: DATABASE_URL tanımlı değil' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await request.json();
    const verificationCode = normalizeString(body.verificationCode);
    const safeEmail = normalizeEmail(body.email);

    if (!safeEmail || !emailRegex.test(safeEmail)) {
      return new Response(
        JSON.stringify({ error: 'Lütfen geçerli bir e-posta adresi girin' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (verificationCode) {
      const pending = await prisma.emailVerification.findUnique({
        where: { email: safeEmail },
      });

      if (!pending) {
        return new Response(
          JSON.stringify({ error: 'Doğrulama kodu bulunamadı. Lütfen tekrar deneyin.' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (pending.expiresAt.getTime() < Date.now()) {
        await prisma.emailVerification.delete({ where: { email: safeEmail } });
        return new Response(
          JSON.stringify({ error: 'Doğrulama kodunun süresi doldu. Lütfen yeni kod isteyin.' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const codeMatches = await bcrypt.compare(verificationCode, pending.codeHash);
      if (!codeMatches) {
        return new Response(
          JSON.stringify({ error: 'Doğrulama kodu hatalı.' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: safeEmail },
      });

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'Bu e-posta adresi zaten kullanılıyor' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const fullName = `${pending.firstName} ${pending.lastName}`.trim();
      const address =
        pending.address && typeof pending.address === 'object'
          ? (pending.address as Record<string, unknown>)
          : null;

      const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const created = await tx.user.create({
          data: {
            email: pending.email,
            name: fullName,
            firstName: pending.firstName,
            lastName: pending.lastName,
            phone: pending.phone,
            hashedPassword: pending.hashedPassword,
            emailVerified: new Date(),
          },
        });

        const addressData = buildAddressData(address, fullName, pending.phone);
        if (addressData) {
          await tx.address.create({
            data: {
              userId: created.id,
              ...addressData,
            },
          });
        }

        await tx.emailVerification.delete({
          where: { email: pending.email },
        });

        return created;
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Kullanıcı başarıyla oluşturuldu',
          userId: user.id,
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const safePassword = normalizeString(body.password);
    const safeFirstName = normalizeString(body.firstName);
    const safeLastName = normalizeString(body.lastName);
    const safePhone = normalizeString(body.phone);
    const safeAddress = sanitizeAddress(body.address);

    if (!safePassword || !safeFirstName || !safeLastName || !safePhone) {
      return new Response(
        JSON.stringify({ error: 'Ad, soyad, e-posta, telefon ve şifre zorunludur' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (safePassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Åifre en az 6 karakter olmalıdır' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: safeEmail },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Bu e-posta adresi zaten kullanılıyor' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return new Response(
        JSON.stringify({ error: 'SMTP ayarları bulunamadı. Lütfen e-posta gönderimi için ayarlarınızı yapılandırın.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const existingVerification = await prisma.emailVerification.findUnique({
      where: { email: safeEmail },
      select: { expiresAt: true },
    });
    if (
      existingVerification?.expiresAt &&
      existingVerification.expiresAt.getTime() - Date.now() > CODE_TTL_MINUTES * 60 * 1000 - RESEND_COOLDOWN_MS
    ) {
      return new Response(
        JSON.stringify({ error: 'Yeni kod istemek icin lutfen kisa bir sure bekleyin.' }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const hashedPassword = await bcrypt.hash(safePassword, 12);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    const addressValue = safeAddress ?? undefined;

    await prisma.emailVerification.upsert({
      where: { email: safeEmail },
      create: {
        email: safeEmail,
        codeHash,
        expiresAt,
        firstName: safeFirstName,
        lastName: safeLastName,
        phone: safePhone,
        hashedPassword,
        address: addressValue,
      },
      update: {
        codeHash,
        expiresAt,
        firstName: safeFirstName,
        lastName: safeLastName,
        phone: safePhone,
        hashedPassword,
        address: addressValue,
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
      subject: 'E-posta doğrulama kodunuz',
      text: `Doğrulama kodunuz: ${code}. Bu kod ${CODE_TTL_MINUTES} dakika geçerlidir.`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="margin-top: 0; color: #111827;">E-posta doğrulama</h2>
        <p>Kaydınızı tamamlamak için doğrulama kodunuz:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0; color: #1e40af;">${code}</div>
        <p style="margin: 0; color: #6b7280;">Bu kod ${CODE_TTL_MINUTES} dakika boyunca geçerlidir.</p>
      </div>
      `,
    });

    return new Response(
      JSON.stringify({
        success: true,
        step: 'verify',
        message: 'Doğrulama kodu gönderildi',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Kayit hatasi:', error);
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return new Response(
      JSON.stringify({
        error:
          process.env.NODE_ENV === 'development'
            ? `Sunucu hatası: ${message}`
            : 'Sunucu hatası: Lütfen daha sonra tekrar deneyin',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

