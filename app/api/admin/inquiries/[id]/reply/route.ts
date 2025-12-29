import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type Payload = {
  adminResponse?: string;
  status?: 'NEW' | 'READ' | 'CLOSED';
};

type InquiryUpdateDelegate = {
  update: (args: unknown) => Promise<{ id: string; adminResponse: string | null; respondedAt: Date | null }>;
  findUnique: (args: unknown) => Promise<{ id: string; userId: string | null } | null>;
};

const prismaInquiry = prisma as unknown as {
  inquiry: InquiryUpdateDelegate;
};

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  const { id } = await ctx.params;

  const inquiry = await prismaInquiry.inquiry.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!inquiry) {
    return NextResponse.json({ error: 'Talep bulunamadi' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
  }

  const payload = body as Payload;

  const data: Record<string, unknown> = {
    respondedAt: new Date(),
    respondedByUserId: session.user.id,
  };

  if (typeof payload.adminResponse === 'string') {
    if (!inquiry.userId) {
      return NextResponse.json({ error: 'Kullanicinin uyeligi bulunmamaktadir' }, { status: 400 });
    }
    data.adminResponse = payload.adminResponse.trim() ? payload.adminResponse.trim() : null;
  }

  if (payload.status === 'NEW' || payload.status === 'READ' || payload.status === 'CLOSED') {
    data.status = payload.status;
  }

  try {
    if (payload.status === 'CLOSED') {
      await prismaInquiry.inquiry.update({
        where: { id },
        data,
        select: { id: true },
      });
      await prismaInquiry.inquiry.deleteMany({ where: { id } });
      return NextResponse.json({ item: { id, status: 'CLOSED' } });
    }

    const updated = await prismaInquiry.inquiry.update({
      where: { id },
      data,
      select: { id: true, adminResponse: true, respondedAt: true },
    });

    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
