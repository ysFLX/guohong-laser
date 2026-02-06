'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

type NotificationItem = {
  id: string;
  type: 'CONTACT' | 'QUOTE' | string;
  subject: string | null;
  product: string | null;
  isLocal?: boolean;
  name?: string;
  email?: string;
  phone?: string | null;
  company?: string | null;
  message?: string;
  adminResponse: string | null;
  respondedAt: string | null;
  userSeenAt: string | null;
  createdAt?: string;
  status?: string;
  title?: string | null;
  orderId?: string | null;
};

type Ctx = {
  isOpen: boolean;
  items: NotificationItem[];
  unreadCount: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  refresh: () => Promise<void>;
  markSeen: (id: string) => Promise<void>;
  pushLocal: (
    input: Partial<NotificationItem> &
      Pick<NotificationItem, 'type'> &
      { id?: string; subject?: string | null; product?: string | null },
  ) => void;
  clearLocal: () => void;
};

const NotificationsContext = createContext<Ctx | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { status, data } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [localItems, setLocalItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isAdmin = data?.user?.role === 'ADMIN';

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
      setUnreadCount(typeof data?.unreadCount === 'number' ? data.unreadCount : 0);
    } catch {
      // sessiz
    }
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    refresh();
  }, [status, refresh]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const pollMs = isAdmin ? 5000 : 30000;
    const interval = window.setInterval(() => {
      refresh();
    }, pollMs);
    return () => window.clearInterval(interval);
  }, [status, isAdmin, refresh]);

  const open = useCallback(() => {
    setIsOpen(true);
    refresh();
  }, [refresh]);

  const close = useCallback(async () => {
    setIsOpen(false);
    if (status !== 'authenticated' || isAdmin) return;
    try {
      await fetch('/api/notifications/clear', { method: 'POST' });
      await refresh();
    } catch {
      // sessiz
    }
  }, [status, isAdmin, refresh]);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const markSeen = useCallback(
    async (id: string) => {
      if (id.startsWith('local-')) {
        setLocalItems((prev) => prev.filter((item) => item.id !== id));
        return;
      }
      await fetch(`/api/notifications/${id}/seen`, { method: 'PATCH' });
      await refresh();
    },
    [refresh],
  );

  const pushLocal = useCallback(
    (
      input: Partial<NotificationItem> &
        Pick<NotificationItem, 'type'> &
        { id?: string; subject?: string | null; product?: string | null },
    ) => {
    const id = input.id ?? `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const createdAt = input.createdAt ?? new Date().toISOString();
    const localItem: NotificationItem = {
      id,
      type: input.type,
      subject: input.subject ?? null,
      product: input.product ?? null,
      adminResponse: input.adminResponse ?? null,
      respondedAt: input.respondedAt ?? null,
      userSeenAt: input.userSeenAt ?? null,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      company: input.company ?? null,
      message: input.message,
      createdAt,
      status: input.status,
      title: input.title ?? null,
      orderId: input.orderId ?? null,
      isLocal: true,
    };
    setLocalItems((prev) => [localItem, ...prev]);
    },
    [],
  );

  const clearLocal = useCallback(() => {
    setLocalItems([]);
  }, []);

  const mergedItems = useMemo(() => [...localItems, ...items], [localItems, items]);
  const mergedUnreadCount = unreadCount + localItems.length;

  const value = useMemo(
    () => ({
      isOpen,
      items: mergedItems,
      unreadCount: mergedUnreadCount,
      open,
      close,
      toggle,
      refresh,
      markSeen,
      pushLocal,
      clearLocal,
    }),
    [
      isOpen,
      mergedItems,
      mergedUnreadCount,
      open,
      close,
      toggle,
      refresh,
      markSeen,
      pushLocal,
      clearLocal,
    ],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
