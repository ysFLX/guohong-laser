import { getServerSession } from 'next-auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

const BUCKET = 'spare-parts';

type Payload = {
  sizeValue?: string;
  url?: string | null;
};

const prismaSpareParts = prisma as unknown as {
  sparePart: {
    findUnique: (args: unknown) => Promise<{ id: string; sizeOptions: string[]; sizeOptionImages: unknown } | null>;
    update: (args: unknown) => Promise<{ id: string }>;
  };
};

function extractObjectPath(url: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return '';
  return url.slice(idx + marker.length);
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  return null;
}

function normalizeImagesMap(value: unknown) {
  if (!value || typeof value !== 'object') return {} as Record<string, string[]>;

  const source = value as Record<string, unknown>;
  const next: Record<string, string[]> = {};
  for (const [key, raw] of Object.entries(source)) {
    const values = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : [];
    const seen = new Set<string>();
    const normalizedValues: string[] = [];

    for (const value of values) {
      if (typeof value !== 'string') continue;
      const normalized = value.trim();
      if (!normalized) continue;
      const dedupeKey = normalized.toLocaleLowerCase('tr-TR');
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      normalizedValues.push(normalized);
    }

    if (normalizedValues.length > 0) {
      next[key] = normalizedValues;
    }
  }
  return next;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
  }

  const sizeValue = typeof body.sizeValue === 'string' ? body.sizeValue.trim() : '';
  const url = typeof body.url === 'string' ? body.url.trim() : '';

  if (!sizeValue) {
    return NextResponse.json({ error: 'Ölçü secimi gerekli' }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ error: 'Gorsel url gerekli' }, { status: 400 });
  }

  const { id } = await ctx.params;
  const part = await prismaSpareParts.sparePart.findUnique({
    where: { id },
    select: { id: true, sizeOptions: true, sizeOptionImages: true },
  });

  if (!part) {
    return NextResponse.json({ error: 'Ürün bulunamadi' }, { status: 404 });
  }

  if (!part.sizeOptions.includes(sizeValue)) {
    return NextResponse.json({ error: 'Secilen ölçü bu üründe yok' }, { status: 400 });
  }

  const nextMap = normalizeImagesMap(part.sizeOptionImages);
  const currentImages = nextMap[sizeValue] ?? [];
  const nextImages = [...currentImages];
  const dedupeKey = url.toLocaleLowerCase('tr-TR');
  if (!nextImages.some((item) => item.toLocaleLowerCase('tr-TR') === dedupeKey)) {
    nextImages.push(url);
  }
  nextMap[sizeValue] = nextImages;

  await prismaSpareParts.sparePart.update({
    where: { id },
    data: { sizeOptionImages: nextMap },
    select: { id: true },
  });

  revalidateTag('spare-parts', 'max');
  revalidatePath('/');
  revalidatePath('/spare-parts');
  revalidatePath(`/spare-parts/${id}`);
  revalidatePath(`/admin/spare-parts/${id}`);

  return NextResponse.json({ ok: true, sizeValue, url, imageCount: nextMap[sizeValue].length });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const sizeValue = (searchParams.get('sizeValue') || '').trim();
  const url = (searchParams.get('url') || '').trim();

  if (!sizeValue) {
    return NextResponse.json({ error: 'Ölçü secimi gerekli' }, { status: 400 });
  }

  const part = await prismaSpareParts.sparePart.findUnique({
    where: { id },
    select: { id: true, sizeOptions: true, sizeOptionImages: true },
  });

  if (!part) {
    return NextResponse.json({ error: 'Ürün bulunamadi' }, { status: 404 });
  }

  const nextMap = normalizeImagesMap(part.sizeOptionImages);
  const existingUrls = nextMap[sizeValue] ?? [];
  const remainingUrls = url
    ? existingUrls.filter((item) => item !== url)
    : [];

  if (remainingUrls.length > 0) {
    nextMap[sizeValue] = remainingUrls;
  } else {
    delete nextMap[sizeValue];
  }

  await prismaSpareParts.sparePart.update({
    where: { id },
    data: { sizeOptionImages: nextMap },
    select: { id: true },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const urlsToDelete = url ? [url] : existingUrls;

  if (supabaseUrl && serviceRoleKey) {
    for (const candidateUrl of urlsToDelete) {
      const objectPath = extractObjectPath(candidateUrl);
      if (!objectPath) continue;
      const deleteUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${BUCKET}/${objectPath}`;
      await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
      });
    }
  }

  revalidateTag('spare-parts', 'max');
  revalidatePath('/');
  revalidatePath('/spare-parts');
  revalidatePath(`/spare-parts/${id}`);
  revalidatePath(`/admin/spare-parts/${id}`);

  return NextResponse.json({ ok: true, removedCount: urlsToDelete.length });
}

