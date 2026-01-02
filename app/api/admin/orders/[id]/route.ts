import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type UpdatePayload = {
  status?: string;
};

const allowedStatuses = new Set([
  'RECEIVED',
  'IN_TRANSIT',
  'SHIPPED',
  'DELIVERED',
  'PENDING',
  'PAID',
  'FAILED',
  'CANCELED',
]);

const prismaOrders = prisma as unknown as {
  order: {
    update: (args: unknown) => Promise<{ id: string; status: string }>;
  };
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  let body: UpdatePayload;
  try {
    body = (await req.json()) as UpdatePayload;
  } catch {
    return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status.trim() : '';
  if (!status || !allowedStatuses.has(status)) {
    return NextResponse.json({ error: 'Durum gecersiz' }, { status: 400 });
  }

  try {
    const updated = await prismaOrders.order.update({
      where: { id: params.id },
      data: { status },
      select: { id: true, status: true },
    });
    return NextResponse.json({ item: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Guncelleme hatasi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
