'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type NotificationItem = {
  id: string;
  type: 'CONTACT' | 'QUOTE' | string;
  subject: string | null;
  product: string | null;
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
};

const NotificationsContext = createContext<Ctx | null>(null);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
    const run = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        setItems(Array.isArray(data?.items) ? data.items : []);
        setUnreadCount(typeof data?.unreadCount === 'number' ? data.unreadCount : 0);
      } catch {
        // sessiz
      }
    };

    run();
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    refresh();
  }, [refresh]);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const markSeen = useCallback(
    async (id: string) => {
      await fetch(`/api/notifications/${id}/seen`, { method: 'PATCH' });
      await refresh();
    },
    [refresh],
  );

  const value = useMemo(
    () => ({ isOpen, items, unreadCount, open, close, toggle, refresh, markSeen }),
    [isOpen, items, unreadCount, open, close, toggle, refresh, markSeen],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
