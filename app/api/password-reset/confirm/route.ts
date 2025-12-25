import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const normalizeEmail = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeString = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const safeEmail = normalizeEmail(body.email);
    const token = normalizeString(body.token);
    const newPassword = normalizeString(body.password);

    if (!safeEmail || !emailRegex.test(safeEmail) || !token || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'E-posta, token ve yeni sifre zorunludur' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Sifre en az 6 karakter olmalidir' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { email: safeEmail },
    });

    if (!record) {
      return new Response(
        JSON.stringify({ error: 'Parola sifirlama istegi bulunamadi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await prisma.passwordResetToken.delete({ where: { email: safeEmail } });
      return new Response(
        JSON.stringify({ error: 'Parola sifirlama baglantisinin suresi doldu' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const tokenHash = hashToken(token);
    if (tokenHash !== record.tokenHash) {
      return new Response(
        JSON.stringify({ error: 'Parola sifirlama baglantisi gecersiz' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: safeEmail },
        data: { hashedPassword },
      });
      await tx.passwordResetToken.delete({ where: { email: safeEmail } });
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Parola sifirlama onay hatasi:', error);
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
