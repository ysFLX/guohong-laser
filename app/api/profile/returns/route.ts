import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const items = await prisma.returnRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderId: true,
      itemName: true,
      status: true,
      adminNote: true,
      createdAt: true,
      updatedAt: true,
    },
    take: 20,
  });

  return NextResponse.json({ items });
}
