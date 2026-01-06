import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type InquiryUpdateDelegate = {
  updateMany: (args: unknown) => Promise<{ count: number }>;
  deleteMany: (args: unknown) => Promise<{ count: number }>;
};

type UserNotificationDelegate = {
  updateMany: (args: unknown) => Promise<{ count: number }>;
  deleteMany: (args: unknown) => Promise<{ count: number }>;
};

const prismaInquiry = prisma as unknown as {
  inquiry: InquiryUpdateDelegate;
  userNotification: UserNotificationDelegate;
};

export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { id } = await ctx.params;

  if (session.user.role === 'ADMIN') {
    const result = await prismaInquiry.inquiry.updateMany({
      where: { id, status: 'NEW' },
      data: { status: 'READ' },
    });
    return NextResponse.json({ ok: true, count: result.count });
  }

  const inquiryResult = await prismaInquiry.inquiry.updateMany({
    where: { id, userId: session.user.id },
    data: { userSeenAt: new Date() },
  });

  let notificationResult = { count: 0 };
  if (inquiryResult.count === 0) {
    notificationResult = await prismaInquiry.userNotification.updateMany({
      where: { id, userId: session.user.id, seenAt: null },
      data: { seenAt: new Date() },
    });
  }

  await prismaInquiry.inquiry.deleteMany({
    where: { id, userId: session.user.id, userSeenAt: { not: null } },
  });

  await prismaInquiry.userNotification.deleteMany({
    where: { id, userId: session.user.id, seenAt: { not: null } },
  });

  return NextResponse.json({ ok: true, count: inquiryResult.count + notificationResult.count });
}
