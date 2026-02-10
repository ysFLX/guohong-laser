import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { verifyCartRecoveryToken } from '@/lib/cartRecovery';

export const runtime = 'nodejs';

type CartReminderItem = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string | null;
};

const prismaReminders = prisma as unknown as {
  cartReminder: {
    findUnique: (args: unknown) => Promise<{
      id: string;
      email: string;
      items: unknown;
      totalCents: number;
    } | null>;
  };
};

function sanitizeItems(value: unknown): CartReminderItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => item as Partial<CartReminderItem>)
    .filter((item) => typeof item.id === 'string' && typeof item.name === 'string')
    .map((item) => ({
      id: item.id as string,
      name: item.name as string,
      priceCents: typeof item.priceCents === 'number' ? Math.max(0, Math.round(item.priceCents)) : 0,
      quantity: typeof item.quantity === 'number' ? Math.max(1, Math.round(item.quantity)) : 1,
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : null,
    }));
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') || '';
  const verified = verifyCartRecoveryToken(token);
  if (!verified) {
    return NextResponse.json({ error: 'Geçersiz bağlantı' }, { status: 400 });
  }

  const reminder = await prismaReminders.cartReminder.findUnique({
    where: { id: verified.reminderId },
    select: { id: true, email: true, items: true, totalCents: true },
  });

  if (!reminder || reminder.email !== verified.email) {
    return NextResponse.json({ error: 'Sepet bulunamadı' }, { status: 404 });
  }

  const items = sanitizeItems(reminder.items);
  if (items.length === 0) {
    return NextResponse.json({ error: 'Sepet boş' }, { status: 404 });
  }

  return NextResponse.json({ items, totalCents: reminder.totalCents });
}

