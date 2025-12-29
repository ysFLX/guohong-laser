import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type InquiryUpdateDelegate = {
  updateMany: (args: unknown) => Promise<{ count: number }>;
  deleteMany: (args: unknown) => Promise<{ count: number }>;
};

const prismaInquiry = prisma as unknown as {
  inquiry: InquiryUpdateDelegate;
};

export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const { id } = await ctx.params;

  const result =
    session.user.role === 'ADMIN'
      ? await prismaInquiry.inquiry.updateMany({
          where: { id, status: 'NEW' },
          data: { status: 'READ' },
        })
      : await prismaInquiry.inquiry.updateMany({
          where: { id, userId: session.user.id },
          data: { userSeenAt: new Date() },
        });

  if (session.user.role !== 'ADMIN') {
    await prismaInquiry.inquiry.deleteMany({
      where: { id, userId: session.user.id, userSeenAt: { not: null } },
    });
  }

  return NextResponse.json({ ok: true, count: result.count });
}
