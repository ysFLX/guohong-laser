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
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  const items = await prisma.returnRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      status: true,
      name: true,
      email: true,
      phone: true,
      orderId: true,
      itemName: true,
      reason: true,
      resolution: true,
      evidenceUrls: true,
      adminNote: true,
      respondedAt: true,
      createdAt: true,
      user: {
        select: {
          id: true,
        },
      },
    },
  });

  return NextResponse.json({ items });
}
