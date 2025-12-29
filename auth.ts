import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
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
            where: { email: { equals: email, mode: 'insensitive' } },
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
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        const dbUser =
          user ??
          (session.user.email
            ? await prisma.user.findFirst({
                where: { email: { equals: session.user.email, mode: 'insensitive' } },
                select: { id: true, role: true, firstName: true, lastName: true, phone: true, image: true },
              })
            : null);

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = (dbUser as { role?: string }).role;
          session.user.firstName = (dbUser as { firstName?: string | null }).firstName ?? null;
          session.user.lastName = (dbUser as { lastName?: string | null }).lastName ?? null;
          session.user.phone = (dbUser as { phone?: string | null }).phone ?? null;
          session.user.image = (dbUser as { image?: string | null }).image ?? null;
          session.user.profileComplete = Boolean(
            (dbUser as { firstName?: string | null }).firstName &&
              (dbUser as { lastName?: string | null }).lastName &&
              (dbUser as { phone?: string | null }).phone
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
