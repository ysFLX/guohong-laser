import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type InquiryUpdateDelegate = {
  updateMany: (args: unknown) => Promise<{ count: number }>;
};

const prismaInquiry = prisma as unknown as {
  inquiry: InquiryUpdateDelegate;
};

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const result =
    session.user.role === 'ADMIN'
      ? await prismaInquiry.inquiry.updateMany({
          where: { status: 'NEW' },
          data: { status: 'READ' },
        })
      : await prismaInquiry.inquiry.updateMany({
          where: { userId: session.user.id, respondedAt: { not: null }, adminResponse: { not: null }, userSeenAt: null },
          data: { userSeenAt: new Date() },
        });

  return NextResponse.json({ ok: true, count: result.count });
}
