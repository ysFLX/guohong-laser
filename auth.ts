import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const OTP_TTL_MINUTES = 10;

const hashOtp = (value: string, secret: string) =>
  crypto.createHash('sha256').update(`${secret}:${value}`).digest('hex');

const sendOtpEmail = async (email: string, code: string) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error('2FA_SEND_FAILED');
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

  await transporter.sendMail({
    from: `Guohong Lazer <${smtpUser}>`,
    to: email,
    subject: 'Giriş doğrulama kodun',
    text: `Giriş yapmak için doğrulama kodun: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="margin-top: 0; color: #111827;">Giriş doğrulama kodu</h2>
        <p>Güvenli giriş için doğrulama kodun:</p>
        <div style="margin: 16px 0; font-size: 20px; font-weight: 700; letter-spacing: 6px; color: #111827;">${code}</div>
        <p style="font-size: 12px; color: #6b7280;">Kod ${OTP_TTL_MINUTES} dakika boyunca gecerlidir.</p>
      </div>
      `,
  });
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email?.trim().toLowerCase();
          const password = credentials?.password;
          const otpRaw = credentials?.otp?.trim();
          const otp = otpRaw && /^\d{6}$/.test(otpRaw) ? otpRaw : '';

          if (!email || !password) {
            throw new Error('Lutfen e-posta ve sifre giriniz');
          }

          const user = await prisma.user.findFirst({
            where: { email: { equals: email, mode: Prisma.QueryMode.insensitive } },
          });

          if (!user || !user.hashedPassword) {
            throw new Error('Kullanici bulunamadi');
          }

          const isCorrectPassword = await bcrypt.compare(
            password,
            user.hashedPassword
          );

          if (!isCorrectPassword) {
            throw new Error('Geçersiz şifre');
          }

          if (user.twoFactorEnabled) {
            const secret = process.env.NEXTAUTH_SECRET ?? '';
            if (!secret) {
              throw new Error('2FA_SEND_FAILED');
            }

            if (!otp) {
              const code = `${crypto.randomInt(100000, 1000000)}`;
              const codeHash = hashOtp(code, secret);
              const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

              await prisma.twoFactorToken.upsert({
                where: { userId: user.id },
                create: {
                  userId: user.id,
                  codeHash,
                  expiresAt,
                },
                update: {
                  codeHash,
                  expiresAt,
                },
              });

              try {
                await sendOtpEmail(user.email ?? email, code);
              } catch (error) {
                console.error('2FA e-posta gonderilemedi:', error);
                throw new Error('2FA_SEND_FAILED');
              }

              throw new Error('2FA_REQUIRED');
            }

            const token = await prisma.twoFactorToken.findUnique({
              where: { userId: user.id },
            });
            const otpHash = hashOtp(otp, secret);

            if (!token) {
              throw new Error('2FA_INVALID');
            }

            if (token.expiresAt.getTime() < Date.now()) {
              await prisma.twoFactorToken.delete({
                where: { userId: user.id },
              });
              throw new Error('2FA_EXPIRED');
            }

            if (token.codeHash !== otpHash) {
              throw new Error('2FA_INVALID');
            }

            await prisma.twoFactorToken.delete({
              where: { userId: user.id },
            });
          }

          if (!user.emailVerified) {
            await prisma.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            image: user.image,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const tokenAny = token as typeof token & {
        id?: string;
        role?: string;
        firstName?: string | null;
        lastName?: string | null;
        phone?: string | null;
        image?: string | null;
      };

      if (user) {
        const userAny = user as {
          id?: string;
          email?: string | null;
          name?: string | null;
          role?: string;
          firstName?: string | null;
          lastName?: string | null;
          phone?: string | null;
          image?: string | null;
        };

        tokenAny.id = userAny.id ?? token.sub ?? tokenAny.id;
        tokenAny.role = userAny.role ?? tokenAny.role;
        tokenAny.firstName = userAny.firstName ?? null;
        tokenAny.lastName = userAny.lastName ?? null;
        tokenAny.phone = userAny.phone ?? null;
        tokenAny.image = userAny.image ?? null;
      }

      if (!tokenAny.id && token.sub) {
        tokenAny.id = token.sub;
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        const tokenAny = token as typeof token & {
          id?: string;
          role?: string;
          firstName?: string | null;
          lastName?: string | null;
          phone?: string | null;
          image?: string | null;
        };

        session.user.id = tokenAny.id ?? session.user.id;
        session.user.role = tokenAny.role ?? session.user.role;
        session.user.firstName = tokenAny.firstName ?? null;
        session.user.lastName = tokenAny.lastName ?? null;
        session.user.phone = tokenAny.phone ?? null;
        session.user.image = tokenAny.image ?? null;
        session.user.profileComplete = Boolean(
          tokenAny.firstName && tokenAny.lastName && tokenAny.phone
        );
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
