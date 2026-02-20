import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type NotificationRow = Array<{
  id: string;
  type: string;
  subject: string | null;
  product: string | null;
  name?: string;
  email?: string;
  phone?: string | null;
  company?: string | null;
  message?: string;
  adminResponse: string | null;
  respondedAt: Date | null;
  userSeenAt: Date | null;
  createdAt: Date;
  status?: string;
}>;

type UserNotificationRow = Array<{
  id: string;
  type: string;
  title: string | null;
  message: string;
  orderId: string | null;
  status: string | null;
  createdAt: Date;
  seenAt: Date | null;
}>;

type InquiryDelegate = {
  findMany: (args: unknown) => Promise<NotificationRow>;
  deleteMany: (args: unknown) => Promise<{ count: number }>;
};

type UserNotificationDelegate = {
  findMany: (args: unknown) => Promise<UserNotificationRow>;
};

const prismaInquiry = prisma as unknown as {
  inquiry: InquiryDelegate;
  userNotification: UserNotificationDelegate;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }

  if (session.user.role === 'ADMIN') {
    const items = await prismaInquiry.inquiry.findMany({
      where: { status: 'NEW' },
      orderBy: [{ createdAt: 'desc' }],
      take: 20,
      select: {
        id: true,
        type: true,
        subject: true,
        product: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        message: true,
        adminResponse: true,
        respondedAt: true,
        userSeenAt: true,
        createdAt: true,
        status: true,
      },
    });

    return NextResponse.json({
      items,
      unreadCount: items.length,
      mode: 'ADMIN_NEW_INQUIRIES',
    });
  }

  const inquiryItems = await prismaInquiry.inquiry.findMany({
    where: {
      userId: session.user.id,
      adminResponse: { not: null },
      respondedAt: { not: null },
      userSeenAt: null,
    },
    orderBy: [{ respondedAt: 'desc' }],
    take: 20,
    select: {
      id: true,
      type: true,
      subject: true,
      product: true,
      adminResponse: true,
      respondedAt: true,
      userSeenAt: true,
      createdAt: true,
    },
  });

  const orderItems = await prismaInquiry.userNotification.findMany({
    where: { userId: session.user.id, seenAt: null },
    orderBy: [{ createdAt: 'desc' }],
    take: 20,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      orderId: true,
      status: true,
      createdAt: true,
      seenAt: true,
    },
  });

  const items = [
    ...orderItems.map((item) => ({
      id: item.id,
      type: item.type,
      subject: null,
      product: null,
      adminResponse: null,
      respondedAt: null,
      userSeenAt: item.seenAt,
      createdAt: item.createdAt,
      status: item.status ?? undefined,
      title: item.title,
      message: item.message,
      orderId: item.orderId,
    })),
    ...inquiryItems,
  ].sort((a, b) => {
    const aTime = (a.respondedAt || a.createdAt || new Date(0)).getTime();
    const bTime = (b.respondedAt || b.createdAt || new Date(0)).getTime();
    return bTime - aTime;
  });

  const unreadCount = items.length;

  return NextResponse.json({ items, unreadCount });
}
