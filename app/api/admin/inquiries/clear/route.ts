import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type Payload = {
  type: 'CONTACT' | 'QUOTE';
};

type InquiryDeleteDelegate = {
  updateMany: (args: unknown) => Promise<{ count: number }>;
};

const prismaInquiry = prisma as unknown as {
  inquiry: InquiryDeleteDelegate;
};

async function handleClear(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  let payloadType: Payload['type'] | null = null;
  const url = new URL(req.url);
  const typeParam = url.searchParams.get('type');
  if (typeParam === 'CONTACT' || typeParam === 'QUOTE') {
    payloadType = typeParam;
  }

  if (!payloadType && req.method !== 'GET') {
    try {
      const body = (await req.json()) as Payload;
      if (body.type === 'CONTACT' || body.type === 'QUOTE') {
        payloadType = body.type;
      }
    } catch {
      return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
    }
  }

  if (payloadType !== 'CONTACT' && payloadType !== 'QUOTE') {
    return NextResponse.json({ error: 'type gerekli (CONTACT|QUOTE)' }, { status: 400 });
  }

  const result = await prismaInquiry.inquiry.updateMany({
    where: { type: payloadType, status: { not: 'CLOSED' } },
    data: { status: 'CLOSED' },
  });

  return NextResponse.json({ ok: true, count: result.count });
}

export async function DELETE(req: Request) {
  return handleClear(req);
}

export async function POST(req: Request) {
  return handleClear(req);
}

export async function GET(req: Request) {
  return handleClear(req);
}
