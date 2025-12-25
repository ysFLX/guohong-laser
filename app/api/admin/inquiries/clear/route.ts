import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type Payload = {
  type: 'CONTACT' | 'QUOTE';
};

type InquiryDeleteDelegate = {
  deleteMany: (args: unknown) => Promise<{ count: number }>;
};

const prismaInquiry = prisma as unknown as {
  inquiry: InquiryDeleteDelegate;
};

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const payload = body as Payload;
  if (payload.type !== 'CONTACT' && payload.type !== 'QUOTE') {
    return NextResponse.json({ error: 'type gerekli (CONTACT|QUOTE)' }, { status: 400 });
  }

  const result = await prismaInquiry.inquiry.deleteMany({
    where: { type: payload.type },
  });

  return NextResponse.json({ ok: true, count: result.count });
}
