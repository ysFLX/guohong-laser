'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SessionProvider, useSession } from 'next-auth/react';

import CartDrawer from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import NotificationsDrawer from '@/components/notifications/NotificationsDrawer';
import { NotificationsProvider } from '@/components/notifications/NotificationsProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const ALLOWED_INCOMPLETE_ROUTES = new Set(['/complete-profile', '/login', '/register']);

function ProfileCompletionGate() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (session?.user?.profileComplete) return;
    if (!pathname || ALLOWED_INCOMPLETE_ROUTES.has(pathname)) return;

    const next = encodeURIComponent(pathname);
    router.replace(`/complete-profile?next=${next}`);
  }, [status, session, pathname, router]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationsProvider>
        <CartProvider>
          <ThemeProvider>
            <ProfileCompletionGate />
            {children}
            <CartDrawer />
            <NotificationsDrawer />
          </ThemeProvider>
        </CartProvider>
      </NotificationsProvider>
    </SessionProvider>
  );
}
