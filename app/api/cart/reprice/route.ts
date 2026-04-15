import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { convertUsdCentsToTryCents, getUsdTryExchangeRate } from '@/lib/exchangeRates';
import { normalizeSaleQuantity } from '@/lib/minimumSaleQuantity';
import {
  getSparePartProductIdFromCartLineId,
  normalizeSparePartSizeOptionPricesMap,
} from '@/lib/sparePartSizeOptions';

type CartItemPayload = {
  id?: string;
  quantity?: number;
  name?: string;
  imageUrl?: string | null;
  variantValue?: string | null;
};

type SparePartRow = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  hasSizeOptions: boolean;
  sizeOptions: string[];
  sizeOptionPrices: unknown;
};

export async function POST(req: Request) {
  let payload: { items?: CartItemPayload[] };
  try {
    payload = (await req.json()) as { items?: CartItemPayload[] };
  } catch {
    return NextResponse.json({ error: 'Gecersiz JSON' }, { status: 400 });
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  const cleanItems = items
    .filter((x) => x && typeof x.id === 'string' && typeof x.quantity === 'number')
    .map((x) => ({
      id: String(x.id).trim(),
      productId: getSparePartProductIdFromCartLineId(String(x.id).trim()),
      quantity: Math.max(1, Math.min(50, Math.floor(x.quantity || 1))),
      name: typeof x.name === 'string' ? x.name.trim() : '',
      imageUrl: typeof x.imageUrl === 'string' ? x.imageUrl : null,
      variantValue: typeof x.variantValue === 'string' ? x.variantValue.trim() : '',
    }))
    .filter((x) => x.id.length > 0);

  if (!cleanItems.length) {
    return NextResponse.json({ items: [], subtotalCents: 0 });
  }

  const ids = Array.from(new Set(cleanItems.map((item) => item.productId)));
  const parts = (await prisma.sparePart.findMany({
    where: { id: { in: ids }, isActive: true },
    select: {
      id: true,
      name: true,
      priceCents: true,
      currency: true,
      imageUrl: true,
      hasSizeOptions: true,
      sizeOptions: true,
      sizeOptionPrices: true,
    },
  })) as SparePartRow[];

  const exchangeRate = await getUsdTryExchangeRate();
  const partMap = new Map(parts.map((part) => [part.id, part]));

  const repricedItems = cleanItems
    .map((item) => {
      const part = partMap.get(item.productId);
      if (!part) return null;

      const sizeOptionPrices = normalizeSparePartSizeOptionPricesMap(
        part.sizeOptionPrices,
        part.sizeOptions,
        part.priceCents,
        part.currency,
      );

      if (part.hasSizeOptions) {
        const normalizedOptions = part.sizeOptions.map((option) => option.trim());
        if (!item.variantValue || !normalizedOptions.includes(item.variantValue)) {
          return null;
        }
      }

      const resolvedBasePriceCents =
        part.currency === 'USD' ? convertUsdCentsToTryCents(part.priceCents, exchangeRate.rate) : part.priceCents;

      return {
        id: item.id,
        productId: part.id,
        name: item.name || part.name,
        imageUrl: item.imageUrl || part.imageUrl,
        quantity: item.quantity,
        variantValue: item.variantValue || null,
        priceCents:
          part.hasSizeOptions && item.variantValue && sizeOptionPrices[item.variantValue]?.currency === 'USD'
            ? convertUsdCentsToTryCents(sizeOptionPrices[item.variantValue].priceCents, exchangeRate.rate)
            : part.hasSizeOptions && item.variantValue
              ? sizeOptionPrices[item.variantValue]?.priceCents ?? resolvedBasePriceCents
              : resolvedBasePriceCents,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (repricedItems.length !== cleanItems.length) {
    return NextResponse.json({ error: 'Sepette gecersiz veya pasif urun var.' }, { status: 400 });
  }

  const normalizedItems = repricedItems.map((item) => ({
    ...item,
    quantity: normalizeSaleQuantity(item.quantity, item.priceCents),
  }));

  const subtotalCents = normalizedItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  return NextResponse.json({ items: normalizedItems, subtotalCents });
}
