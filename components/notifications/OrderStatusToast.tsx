'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { useToast } from '@/components/ui/ToastProvider';
import { useNotifications } from '@/components/notifications/NotificationsProvider';

const STORAGE_KEY = 'orderStatusToastShown';

const readShown = () => {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
};

const writeShown = (value: Set<string>) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(value)));
  } catch {
    // sessiz
  }
};

export default function OrderStatusToast() {
  const { data } = useSession();
  const isAdmin = data?.user?.role === 'ADMIN';
  const { items, open } = useNotifications();
  const { show } = useToast();
  const router = useRouter();
  const shownRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!shownRef.current) {
      shownRef.current = readShown();
    }
  }, []);

  useEffect(() => {
    if (isAdmin) return;
    if (!items.length) return;
    if (!shownRef.current) {
      shownRef.current = readShown();
    }

    const nextShown = new Set(shownRef.current);
    let didChange = false;

    items
      .filter((item) => item.type === 'ORDER_STATUS')
      .forEach((item) => {
        if (nextShown.has(item.id)) return;
        nextShown.add(item.id);
        didChange = true;

        const actions = [];
        if (item.orderId) {
          actions.push({
            label: 'Siparişi gör',
            onClick: () => router.push(`/profile/orders/${item.orderId}`),
          });
        }
        actions.push({
          label: 'Bildirimler',
          onClick: () => open(),
        });

        show(item.message || 'Siparis durumu guncellendi', actions);
      });

    if (didChange) {
      shownRef.current = nextShown;
      writeShown(nextShown);
    }
  }, [items, isAdmin, open, router, show]);

  return null;
}

