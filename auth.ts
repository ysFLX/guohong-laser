import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
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
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Lutfen e-posta ve sifre giriniz');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.hashedPassword) {
            throw new Error('Kullanici bulunamadi');
          }

          if (!user.emailVerified) {
            throw new Error('E-posta dogrulamasi gerekli');
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          );

          if (!isCorrectPassword) {
            throw new Error('Gecersiz sifre');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
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
      if (user) {
        token.role = user.role;
        token.id = user.id ?? token.sub ?? token.id;
      }
      if (!token.id && token.sub) {
        token.id = token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        const tokenId = token.id ?? token.sub;
        session.user.role = token.role;
        session.user.id = tokenId ?? session.user.id;

        if (tokenId) {
          const dbUser = await prisma.user.findUnique({
            where: { id: String(tokenId) },
            select: { firstName: true, lastName: true, phone: true, image: true },
          });

          session.user.firstName = dbUser?.firstName ?? null;
          session.user.lastName = dbUser?.lastName ?? null;
          session.user.phone = dbUser?.phone ?? null;
          session.user.image = dbUser?.image ?? null;
          session.user.profileComplete = Boolean(
            dbUser?.firstName && dbUser?.lastName && dbUser?.phone
          );
        }
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
