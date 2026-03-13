import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import { sanitizeSparePartSizeOptions } from '@/lib/sparePartSizeOptions';

type UpdatePayload = {
  imageUrl?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  name?: string;
  description?: string;
  dimensions?: string | null;
  hasSizeOptions?: boolean;
  sizeOptions?: unknown;
  priceCents?: number;
  categoryId?: string;
  stockOnHand?: number;
};

type SparePartUpdateDelegate = {
  findUnique: (args: unknown) => Promise<{ id: string; stockOnHand: number } | null>;
  update: (args: unknown) => Promise<{ id: string; imageUrl: string | null; isFeatured: boolean; isActive: boolean }>;
  delete: (args: unknown) => Promise<{ id: string }>;
};

type StockMovementCreateDelegate = {
  create: (args: unknown) => Promise<unknown>;
};

const prismaSpareParts = prisma as unknown as {
  sparePart: SparePartUpdateDelegate;
  stockMovement: StockMovementCreateDelegate;
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
  }

  const payload = body as UpdatePayload;
  const data: Record<string, unknown> = {};

  if ('imageUrl' in payload) data.imageUrl = payload.imageUrl ?? null;
  if ('isFeatured' in payload && typeof payload.isFeatured === 'boolean') data.isFeatured = payload.isFeatured;
  if ('isActive' in payload && typeof payload.isActive === 'boolean') data.isActive = payload.isActive;

  if ('name' in payload && typeof payload.name === 'string') data.name = payload.name.trim();
  if ('description' in payload && typeof payload.description === 'string') data.description = payload.description;
  if ('dimensions' in payload) data.dimensions = typeof payload.dimensions === 'string' ? payload.dimensions.trim() || null : null;
  if ('priceCents' in payload && typeof payload.priceCents === 'number') data.priceCents = payload.priceCents;
  if ('categoryId' in payload && typeof payload.categoryId === 'string') data.categoryId = payload.categoryId;
  if ('stockOnHand' in payload && typeof payload.stockOnHand === 'number') data.stockOnHand = Math.max(0, Math.floor(payload.stockOnHand));

  if ('hasSizeOptions' in payload) {
    data.hasSizeOptions = payload.hasSizeOptions === true;
    data.sizeOptions = payload.hasSizeOptions === true ? sanitizeSparePartSizeOptions(payload.sizeOptions) : [];

    if (payload.hasSizeOptions === true && Array.isArray(data.sizeOptions) && data.sizeOptions.length === 0) {
      return NextResponse.json({ error: 'Olculu urunler icin en az bir olcu gerekli' }, { status: 400 });
    }
  } else if ('sizeOptions' in payload) {
    const sanitizedSizeOptions = sanitizeSparePartSizeOptions(payload.sizeOptions);
    data.sizeOptions = sanitizedSizeOptions;
    data.hasSizeOptions = sanitizedSizeOptions.length > 0;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Guncellenecek alan yok' }, { status: 400 });
  }

  try {
    const requestedStock = typeof data.stockOnHand === 'number' ? (data.stockOnHand as number) : null;
    const existing = requestedStock !== null
      ? await prismaSpareParts.sparePart.findUnique({ where: { id }, select: { id: true, stockOnHand: true } })
      : null;

    const updated = await prismaSpareParts.sparePart.update({
      where: { id },
      data,
      select: { id: true, imageUrl: true, isFeatured: true, isActive: true },
    });

    if (existing && requestedStock !== null && existing.stockOnHand !== requestedStock) {
      await prismaSpareParts.stockMovement.create({
        data: {
          sparePartId: id,
          delta: requestedStock - existing.stockOnHand,
          reason: 'ADJUSTMENT',
          note: 'admin-stock-adjust',
          createdByUserId: session.user.id,
        },
      });
    }

    return NextResponse.json({ item: updated });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  const { id } = await ctx.params;

  try {
    const deleted = await prismaSpareParts.sparePart.delete({
      where: { id },
      select: { id: true },
    });
    return NextResponse.json({ item: deleted });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
