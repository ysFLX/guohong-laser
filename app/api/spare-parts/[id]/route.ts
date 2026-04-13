import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  buildSparePartSizeOptionImagesMap,
  buildSparePartSizeOptionPricesMap,
  sanitizeSparePartSizeOptionEntries,
  sanitizeSparePartSizeOptions,
} from '@/lib/sparePartSizeOptions';

type UpdatePayload = {
  imageUrl?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  name?: string;
  description?: string;
  dimensions?: string | null;
  hasSizeOptions?: boolean;
  sizeOptions?: unknown;
  sizeOptionEntries?: unknown;
  priceCents?: number;
  categoryId?: string;
  stockOnHand?: number;
};

type SparePartUpdateDelegate = {
  findUnique: (args: unknown) => Promise<{
    id: string;
    stockOnHand: number;
    sizeOptions?: string[];
    sizeOptionImages?: unknown;
  } | null>;
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

function normalizeExistingSizeOptionImages(value: unknown, allowedSizeOptions: string[]) {
  if (!value || typeof value !== 'object') return {} as Record<string, string[]>;

  const allowed = new Set(allowedSizeOptions);
  const source = value as Record<string, unknown>;
  const next: Record<string, string[]> = {};

  for (const [key, rawValue] of Object.entries(source)) {
    if (!allowed.has(key)) continue;

    const values = Array.isArray(rawValue) ? rawValue : typeof rawValue === 'string' ? [rawValue] : [];
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
  if ('priceCents' in payload && typeof payload.priceCents === 'number') {
    data.priceCents = payload.priceCents;
    data.currency = 'USD';
  }
  if ('categoryId' in payload && typeof payload.categoryId === 'string') data.categoryId = payload.categoryId;
  if ('stockOnHand' in payload && typeof payload.stockOnHand === 'number') data.stockOnHand = Math.max(0, Math.floor(payload.stockOnHand));

  if ('hasSizeOptions' in payload) {
    const fallbackPriceCents =
      typeof payload.priceCents === 'number' && Number.isFinite(payload.priceCents)
        ? Math.max(0, Math.round(payload.priceCents))
        : 0;
    const sizeOptionEntries = sanitizeSparePartSizeOptionEntries(payload.sizeOptionEntries, fallbackPriceCents);
    const sizeOptionsFromEntries = sizeOptionEntries.map((entry) => entry.value);
    const sizeOptionsFromStrings = sanitizeSparePartSizeOptions(payload.sizeOptions);
    const resolvedSizeOptions =
      sizeOptionsFromEntries.length > 0 ? sizeOptionsFromEntries : sizeOptionsFromStrings;

    data.hasSizeOptions = payload.hasSizeOptions === true;
    data.currency = 'USD';
    data.sizeOptions = payload.hasSizeOptions === true ? resolvedSizeOptions : [];
    data.sizeOptionPrices =
      payload.hasSizeOptions === true
        ? sizeOptionEntries.length > 0
          ? buildSparePartSizeOptionPricesMap(sizeOptionEntries)
          : Object.fromEntries(resolvedSizeOptions.map((option) => [option, fallbackPriceCents]))
        : {};
    data.sizeOptionImages =
      payload.hasSizeOptions === true && sizeOptionEntries.length > 0
        ? buildSparePartSizeOptionImagesMap(sizeOptionEntries)
        : {};

    if (payload.hasSizeOptions === true && Array.isArray(data.sizeOptions) && data.sizeOptions.length === 0) {
      return NextResponse.json({ error: 'Olculu urunler icin en az bir olcu gerekli' }, { status: 400 });
    }
  } else if ('sizeOptionEntries' in payload) {
    const fallbackPriceCents =
      typeof payload.priceCents === 'number' && Number.isFinite(payload.priceCents)
        ? Math.max(0, Math.round(payload.priceCents))
        : 0;
    const sizeOptionEntries = sanitizeSparePartSizeOptionEntries(payload.sizeOptionEntries, fallbackPriceCents);
    const sizeOptions = sizeOptionEntries.map((entry) => entry.value);
    data.sizeOptions = sizeOptions;
    data.sizeOptionPrices = buildSparePartSizeOptionPricesMap(sizeOptionEntries);
    data.sizeOptionImages = buildSparePartSizeOptionImagesMap(sizeOptionEntries);
    data.hasSizeOptions = sizeOptions.length > 0;
    data.currency = 'USD';
  } else if ('sizeOptions' in payload) {
    const sanitizedSizeOptions = sanitizeSparePartSizeOptions(payload.sizeOptions);
    data.sizeOptions = sanitizedSizeOptions;
    if (sanitizedSizeOptions.length === 0) {
      data.sizeOptionPrices = {};
      data.sizeOptionImages = {};
    }
    data.hasSizeOptions = sanitizedSizeOptions.length > 0;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Guncellenecek alan yok' }, { status: 400 });
  }

  try {
    const requestedStock = typeof data.stockOnHand === 'number' ? (data.stockOnHand as number) : null;
    const shouldLoadExisting =
      requestedStock !== null || 'hasSizeOptions' in payload || 'sizeOptionEntries' in payload || 'sizeOptions' in payload;
    const existing = shouldLoadExisting
      ? await prismaSpareParts.sparePart.findUnique({
          where: { id },
          select: { id: true, stockOnHand: true, sizeOptions: true, sizeOptionImages: true },
        })
      : null;

    if (existing && 'sizeOptionImages' in data && Array.isArray(data.sizeOptions)) {
      const resolvedSizeOptions = data.sizeOptions as string[];
      const nextImages = data.sizeOptionImages as Record<string, unknown>;
      const hasIncomingImageAssignments = Object.keys(nextImages).length > 0;

      data.sizeOptionImages = hasIncomingImageAssignments
        ? nextImages
        : normalizeExistingSizeOptionImages(existing.sizeOptionImages, resolvedSizeOptions);
    }

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

    revalidateTag('spare-parts', 'max');
    revalidatePath('/');
    revalidatePath('/spare-parts');
    revalidatePath(`/spare-parts/${id}`);
    revalidatePath(`/admin/spare-parts/${id}`);

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
