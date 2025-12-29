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

type InquiryDelegate = {
  findMany: (args: unknown) => Promise<NotificationRow>;
  deleteMany: (args: unknown) => Promise<{ count: number }>;
};

const prismaInquiry = prisma as unknown as {
  inquiry: InquiryDelegate;
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ items: [] });
  }

  await prismaInquiry.inquiry.deleteMany({
    where: { userSeenAt: { not: null } },
  });

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

  const items = await prismaInquiry.inquiry.findMany({
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

  const unreadCount = items.length;

  return NextResponse.json({ items, unreadCount });
}
