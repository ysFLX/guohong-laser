import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

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
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email?.trim().toLowerCase();
          const password = credentials?.password;

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
            throw new Error('Gecersiz sifre');
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
