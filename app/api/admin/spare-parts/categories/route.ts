import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

type CategoryCreate = {
  name?: string;
  slug?: string;
  isActive?: boolean;
};

const prismaCategories = prisma as unknown as {
  sparePartCategory: {
    create: (args: unknown) => Promise<{ id: string }>;
  };
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  let body: CategoryCreate;
  try {
    body = (await req.json()) as CategoryCreate;
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const isActive = typeof body.isActive === 'boolean' ? body.isActive : true;

  if (!name) {
    return NextResponse.json({ error: 'Kategori adı gerekli' }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: 'Slug gerekli' }, { status: 400 });
  }

  try {
    const created = await prismaCategories.sparePartCategory.create({
      data: {
        name,
        slug,
        isActive,
      },
      select: { id: true },
    });

    return NextResponse.json({ item: created });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Kategori oluşturulamadı';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
