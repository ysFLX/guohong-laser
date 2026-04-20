import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

const BUCKET = 'spare-parts';

type SparePartImageRecord = {
  id: string;
  url: string;
  sparePartId: string;
};

type SparePartImageList = Array<{ id: string; url: string }>;

const prismaSpareParts = prisma as unknown as {
  sparePartImage: {
    findUnique: (args: unknown) => Promise<SparePartImageRecord | null>;
    delete: (args: unknown) => Promise<{ id: string }>;
    findMany: (args: unknown) => Promise<SparePartImageList>;
  };
  sparePart: {
    findUnique: (args: unknown) => Promise<{ id: string; imageUrl: string | null } | null>;
    update: (args: unknown) => Promise<{ id: string; imageUrl: string | null }>;
  };
};

function extractObjectPath(url: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return '';
  return url.slice(idx + marker.length);
}

export async function DELETE(req: Request, ctx: { params: Promise<{ imageId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '';

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Supabase env eksik. NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.' },
      { status: 500 },
    );
  }

  const { imageId } = await ctx.params;

  const image = await prismaSpareParts.sparePartImage.findUnique({
    where: { id: imageId },
    select: { id: true, url: true, sparePartId: true },
  });

  if (!image) {
    return NextResponse.json({ error: 'Görsel bulunamadı' }, { status: 404 });
  }

  const objectPath = extractObjectPath(image.url);
  if (objectPath) {
    const deleteUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${BUCKET}/${objectPath}`;
    await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
    });
  }

  await prismaSpareParts.sparePartImage.delete({
    where: { id: imageId },
    select: { id: true },
  });

  const part = await prismaSpareParts.sparePart.findUnique({
    where: { id: image.sparePartId },
    select: { id: true, imageUrl: true },
  });

  if (part?.imageUrl === image.url) {
    const remaining = await prismaSpareParts.sparePartImage.findMany({
      where: { sparePartId: image.sparePartId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, url: true },
    });
    const nextUrl = remaining[0]?.url ?? null;
    await prismaSpareParts.sparePart.update({
      where: { id: image.sparePartId },
      data: { imageUrl: nextUrl },
      select: { id: true, imageUrl: true },
    });
  }

  revalidateTag('spare-parts', 'max');
  revalidatePath('/');
  revalidatePath('/spare-parts');
  revalidatePath(`/spare-parts/${image.sparePartId}`);
  revalidatePath(`/admin/spare-parts/${image.sparePartId}`);

  return NextResponse.json({ ok: true });
}

