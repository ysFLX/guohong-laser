import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      profileComplete?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string;
    hashedPassword?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    id?: string;
  }
}
