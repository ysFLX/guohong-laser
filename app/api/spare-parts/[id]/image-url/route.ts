import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type ImageUrlPayload = {
  url?: string;
};

type SparePartImageCreateResult = {
  id: string;
  url: string;
  sparePartId: string;
};

type SparePartFindResult = {
  id: string;
  imageUrl: string | null;
};

const prismaSpareParts = prisma as unknown as {
  sparePart: {
    findUnique: (args: unknown) => Promise<SparePartFindResult | null>;
    update: (args: unknown) => Promise<SparePartFindResult>;
  };
  sparePartImage: {
    create: (args: unknown) => Promise<SparePartImageCreateResult>;
  };
};

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  let body: ImageUrlPayload;
  try {
    body = (await req.json()) as ImageUrlPayload;
  } catch {
    return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
  }

  const url = typeof body.url === 'string' ? body.url.trim() : '';
  if (!url) {
    return NextResponse.json({ error: 'url gerekli' }, { status: 400 });
  }

  const { id } = await ctx.params;

  const created = await prismaSpareParts.sparePartImage.create({
    data: {
      sparePartId: id,
      url,
    },
    select: { id: true, url: true, sparePartId: true },
  });

  const part = await prismaSpareParts.sparePart.findUnique({
    where: { id },
    select: { id: true, imageUrl: true },
  });

  if (part && !part.imageUrl) {
    await prismaSpareParts.sparePart.update({
      where: { id },
      data: { imageUrl: url },
      select: { id: true, imageUrl: true },
    });
  }

  return NextResponse.json({ item: created });
}
