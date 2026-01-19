import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type NotificationPrefs = {
  emailNotify: boolean;
  inAppNotify: boolean;
  promoNotify: boolean;
  smsNotify: boolean;
  priceDropNotify: boolean;
  stockNotify: boolean;
  newsletter: boolean;
};

const sanitizePrefs = (value: unknown): NotificationPrefs => {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    emailNotify: Boolean(raw.emailNotify),
    inAppNotify: Boolean(raw.inAppNotify),
    promoNotify: Boolean(raw.promoNotify),
    smsNotify: Boolean(raw.smsNotify),
    priceDropNotify: Boolean(raw.priceDropNotify),
    stockNotify: Boolean(raw.stockNotify),
    newsletter: Boolean(raw.newsletter),
  };
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Yetkisiz' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Gecersiz JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const prefs = sanitizePrefs((body as { prefs?: unknown })?.prefs);

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      notificationPrefs: prefs,
    } as unknown as Prisma.UserUpdateInput,
    select: {
      id: true,
      notificationPrefs: true,
    } as unknown as Prisma.UserSelect,
  });

  return new Response(JSON.stringify({ success: true, user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
