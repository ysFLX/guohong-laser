'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { SessionProvider, useSession } from 'next-auth/react';

import { CartProvider } from '@/components/cart/CartProvider';
import { NotificationsProvider } from '@/components/notifications/NotificationsProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ToastProvider } from '@/components/ui/ToastProvider';

const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer'), { ssr: false });
const NotificationsDrawer = dynamic(() => import('@/components/notifications/NotificationsDrawer'), { ssr: false });
const OrderStatusToast = dynamic(() => import('@/components/notifications/OrderStatusToast'), { ssr: false });

const PROFILE_COMPLETE_REQUIRED_ROUTES = new Set(['/checkout/address']);

function ProfileCompletionGate() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (session?.user?.profileComplete) return;
    if (!pathname || !PROFILE_COMPLETE_REQUIRED_ROUTES.has(pathname)) return;

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
            <ToastProvider>
              <ProfileCompletionGate />
              {children}
              <CartDrawer />
              <NotificationsDrawer />
              <OrderStatusToast />
            </ToastProvider>
          </ThemeProvider>
        </CartProvider>
      </NotificationsProvider>
    </SessionProvider>
  );
}
