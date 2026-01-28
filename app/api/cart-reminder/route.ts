import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

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
    upsert: (args: unknown) => Promise<{ id: string }>;
    delete: (args: unknown) => Promise<{ id: string }>;
  };
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  let body: { email?: string; items?: unknown; totalCents?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const items = sanitizeItems(body.items);
  if (items.length === 0) {
    return NextResponse.json({ error: 'Sepet boş' }, { status: 400 });
  }

  const emailRaw = typeof body.email === 'string' ? body.email.trim() : '';
  const email = emailRaw || session?.user?.email || '';
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'E-posta gerekli' }, { status: 400 });
  }

  const totalCents =
    typeof body.totalCents === 'number'
      ? Math.max(0, Math.round(body.totalCents))
      : items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  const userId = session?.user?.id ?? null;

  const reminder = await prismaReminders.cartReminder.upsert({
    where: { email },
    create: {
      email,
      userId,
      items,
      totalCents,
    },
    update: {
      items,
      totalCents,
      userId,
      sentAt: null,
    },
    select: { id: true },
  });

  return NextResponse.json({ item: reminder });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  let body: { email?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const emailRaw = typeof body.email === 'string' ? body.email.trim() : '';
  const email = emailRaw || session?.user?.email || '';
  if (!email) {
    return NextResponse.json({ error: 'E-posta gerekli' }, { status: 400 });
  }

  try {
    await prismaReminders.cartReminder.delete({
      where: { email },
      select: { id: true },
    });
  } catch {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
