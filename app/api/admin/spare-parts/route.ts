import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  buildSparePartSizeOptionImagesMap,
  buildSparePartSizeOptionPricesMap,
  normalizePriceCentsForCurrency,
  sanitizeSparePartSizeOptionEntries,
  sanitizeSparePartSizeOptions,
} from '@/lib/sparePartSizeOptions';

type CreatePayload = {
  name?: string;
  description?: string;
  dimensions?: string | null;
  hasSizeOptions?: boolean;
  sizeOptions?: unknown;
  sizeOptionEntries?: unknown;
  priceCents?: number;
  priceCurrency?: string;
  stockOnHand?: number;
  categoryId?: string;
  isFeatured?: boolean;
  isActive?: boolean;
};

type SparePartCreateDelegate = {
  create: (args: unknown) => Promise<{ id: string }>;
};

type StockMovementCreateDelegate = {
  create: (args: unknown) => Promise<unknown>;
};

const prismaSpareParts = prisma as unknown as {
  sparePart: SparePartCreateDelegate;
  stockMovement: StockMovementCreateDelegate;
};

function normalizePriceCurrency(value: unknown, fallback = 'TRY') {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toUpperCase();
  if (normalized === 'USD' || normalized === 'TRY') return normalized;
  return fallback;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Yetersiz yetki' }, { status: 403 });
  }

  let body: CreatePayload;
  try {
    body = (await req.json()) as CreatePayload;
  } catch {
    return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' ? body.description : '';
  const dimensions = typeof body.dimensions === 'string' ? body.dimensions.trim() : '';
  const hasSizeOptions = body.hasSizeOptions === true;
  const priceCents = typeof body.priceCents === 'number' ? body.priceCents : NaN;
  const priceCurrency = normalizePriceCurrency(body.priceCurrency, 'TRY');
  const fallbackPriceCents = Number.isFinite(priceCents)
    ? normalizePriceCentsForCurrency(Math.max(0, Math.round(priceCents)), priceCurrency)
    : 0;
  const sizeOptionEntries = hasSizeOptions
    ? sanitizeSparePartSizeOptionEntries(body.sizeOptionEntries, fallbackPriceCents, priceCurrency)
    : [];
  const sizeOptions =
    sizeOptionEntries.length > 0
      ? sizeOptionEntries.map((entry) => entry.value)
      : hasSizeOptions
      ? sanitizeSparePartSizeOptions(body.sizeOptions)
      : [];
  const sizeOptionPrices =
        sizeOptionEntries.length > 0
          ? buildSparePartSizeOptionPricesMap(sizeOptionEntries)
          : Object.fromEntries(
          sizeOptions.map((option) => [option, { priceCents: fallbackPriceCents, currency: priceCurrency }]),
        );
  const sizeOptionImages =
    sizeOptionEntries.length > 0 ? buildSparePartSizeOptionImagesMap(sizeOptionEntries) : {};
  const stockOnHand = typeof body.stockOnHand === 'number' ? Math.max(0, Math.floor(body.stockOnHand)) : NaN;
  const categoryId = typeof body.categoryId === 'string' ? body.categoryId : '';
  const isFeatured = typeof body.isFeatured === 'boolean' ? body.isFeatured : false;
  const isActive = typeof body.isActive === 'boolean' ? body.isActive : true;

  if (!name) {
    return NextResponse.json({ error: 'Urun adi gerekli' }, { status: 400 });
  }

  if (!categoryId) {
    return NextResponse.json({ error: 'Kategori gerekli' }, { status: 400 });
  }

  if (!Number.isFinite(priceCents) || priceCents < 0) {
    return NextResponse.json({ error: 'Fiyat gecersiz' }, { status: 400 });
  }

  if (!Number.isFinite(stockOnHand) || stockOnHand < 0) {
    return NextResponse.json({ error: 'Stok gecersiz' }, { status: 400 });
  }

  if (hasSizeOptions && sizeOptions.length === 0) {
    return NextResponse.json({ error: 'Olculu urunler icin en az bir olcu gerekli' }, { status: 400 });
  }

  try {
    const created = await prismaSpareParts.sparePart.create({
      data: {
        name,
        description,
        dimensions: dimensions || null,
        hasSizeOptions,
        sizeOptions,
        sizeOptionPrices,
        sizeOptionImages,
        priceCents: normalizePriceCentsForCurrency(priceCents, priceCurrency),
        currency: priceCurrency,
        stockOnHand,
        categoryId,
        isFeatured,
        isActive,
      },
      select: { id: true },
    });

    if (stockOnHand > 0) {
      await prismaSpareParts.stockMovement.create({
        data: {
          sparePartId: created.id,
          delta: stockOnHand,
          reason: 'INITIAL',
          note: 'admin-create',
          createdByUserId: session.user.id,
        },
      });
    }

    return NextResponse.json({ item: created });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Urun olusturulamadi';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
