export function sanitizeSparePartSizeOptions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of value) {
    if (typeof item !== 'string') continue;
    const normalized = item.trim();
    if (!normalized) continue;

    const dedupeKey = normalized.toLocaleLowerCase('tr-TR');
    if (seen.has(dedupeKey)) continue;

    seen.add(dedupeKey);
    result.push(normalized);

    if (result.length >= 100) break;
  }

  return result;
}

export type SparePartSizeOptionEntry = {
  value: string;
  priceCents: number;
  priceCurrency: string;
  imageUrl: string | null;
  imageUrls: string[];
};

export type SparePartSizeOptionPriceValue = {
  priceCents: number;
  currency: string;
};

function clampPriceCents(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function coercePriceCents(value: unknown) {
  if (typeof value === 'number') return clampPriceCents(value);
  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return null;
    return clampPriceCents(parsed * 100);
  }
  return null;
}

function normalizeCurrency(value: unknown, fallback = 'USD') {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toUpperCase();
  return normalized || fallback;
}

function coercePriceValue(value: unknown, fallback: SparePartSizeOptionPriceValue): SparePartSizeOptionPriceValue {
  if (typeof value === 'number') {
    return {
      priceCents: clampPriceCents(value),
      currency: fallback.currency,
    };
  }

  if (!value || typeof value !== 'object') return fallback;

  const row = value as Record<string, unknown>;
  const currency = normalizeCurrency(row.currency ?? row.priceCurrency, fallback.currency);
  const priceCents =
    coercePriceCents(row.priceCents) ??
    coercePriceCents(row.amountCents) ??
    coercePriceCents(row.valueCents) ??
    coercePriceCents(row.price);

  if (priceCents === null) return fallback;

  return { priceCents, currency };
}

function coerceImageUrl(value: unknown) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function coerceImageUrlList(value: unknown) {
  if (typeof value === 'string') {
    const normalized = coerceImageUrl(value);
    return normalized ? [normalized] : [];
  }

  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of value) {
    const normalized = coerceImageUrl(item);
    if (!normalized) continue;
    const dedupeKey = normalized.toLocaleLowerCase('tr-TR');
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    result.push(normalized);
    if (result.length >= 50) break;
  }
  return result;
}

export function sanitizeSparePartSizeOptionEntries(
  value: unknown,
  fallbackPriceCents: number,
  fallbackCurrency = 'USD',
): SparePartSizeOptionEntry[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const result: SparePartSizeOptionEntry[] = [];

  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const rawValue = typeof row.value === 'string' ? row.value : typeof row.size === 'string' ? row.size : '';
    const normalizedValue = rawValue.trim();
    if (!normalizedValue) continue;

    const dedupeKey = normalizedValue.toLocaleLowerCase('tr-TR');
    if (seen.has(dedupeKey)) continue;

    const parsedPrice = coercePriceValue(
      row.priceValue ??
        (row.priceTry !== undefined || row.priceTl !== undefined || row.priceTRY !== undefined
          ? {
              priceCents:
                coercePriceCents(row.priceTry) ??
                coercePriceCents(row.priceTl) ??
                coercePriceCents(row.priceTRY) ??
                clampPriceCents(fallbackPriceCents),
              currency: 'TRY',
            }
          : {
              priceCents:
                coercePriceCents(row.priceUsd) ??
                coercePriceCents(row.priceInput) ??
                coercePriceCents(row.priceCents) ??
                clampPriceCents(fallbackPriceCents),
              currency: normalizeCurrency(row.priceCurrency, fallbackCurrency),
            }),
      { priceCents: clampPriceCents(fallbackPriceCents), currency: fallbackCurrency },
    );

    seen.add(dedupeKey);
    result.push({
      value: normalizedValue,
      priceCents: parsedPrice.priceCents,
      priceCurrency: parsedPrice.currency,
      imageUrl:
        coerceImageUrl(row.imageUrl) ??
        coerceImageUrl(row.variantImageUrl) ??
        coerceImageUrl(row.sizeImageUrl) ??
        coerceImageUrl(row.image),
      imageUrls: coerceImageUrlList(
        row.imageUrls ?? row.variantImageUrls ?? row.sizeImageUrls ?? row.images,
      ),
    });

    if (result.length >= 100) break;
  }

  return result;
}

export function buildSparePartSizeOptionPricesMap(entries: SparePartSizeOptionEntry[]) {
  const map: Record<string, SparePartSizeOptionPriceValue> = {};
  for (const entry of entries) {
    map[entry.value] = {
      priceCents: clampPriceCents(entry.priceCents),
      currency: normalizeCurrency(entry.priceCurrency, 'USD'),
    };
  }
  return map;
}

export function buildSparePartSizeOptionImagesMap(entries: SparePartSizeOptionEntry[]) {
  const map: Record<string, string[]> = {};
  for (const entry of entries) {
    if (entry.imageUrl) {
      map[entry.value] = [entry.imageUrl];
    }
  }
  return map;
}

export function normalizeSparePartSizeOptionPricesMap(
  value: unknown,
  sizeOptions: string[],
  fallbackPriceCents: number,
  fallbackCurrency = 'USD',
) {
  const map: Record<string, SparePartSizeOptionPriceValue> = {};
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  for (const option of sizeOptions) {
    const raw = source[option];
    map[option] = coercePriceValue(raw, { priceCents: clampPriceCents(fallbackPriceCents), currency: fallbackCurrency });
  }

  return map;
}

export function normalizeSparePartSizeOptionImagesMap(value: unknown, sizeOptions: string[]) {
  const map: Record<string, string[]> = {};
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  for (const option of sizeOptions) {
    map[option] = coerceImageUrlList(source[option]);
  }

  return map;
}

export function buildSparePartSizeOptionEntries(
  sizeOptions: string[],
  sizeOptionPrices: unknown,
  sizeOptionImages: unknown,
  fallbackPriceCents: number,
  fallbackCurrency = 'USD',
) {
  const map = normalizeSparePartSizeOptionPricesMap(
    sizeOptionPrices,
    sizeOptions,
    fallbackPriceCents,
    fallbackCurrency,
  );
  const imageMap = normalizeSparePartSizeOptionImagesMap(sizeOptionImages, sizeOptions);
  return sizeOptions.map((value) => ({
    value,
    priceCents: map[value]?.priceCents ?? clampPriceCents(fallbackPriceCents),
    priceCurrency: map[value]?.currency ?? fallbackCurrency,
    imageUrl: imageMap[value]?.[0] ?? null,
    imageUrls: imageMap[value] ?? [],
  }));
}

export function buildSparePartVariantName(name: string, sizeValue?: string | null) {
  const normalizedSize = typeof sizeValue === 'string' ? sizeValue.trim() : '';
  if (!normalizedSize) return name;
  return `${name} - ${normalizedSize}`;
}

export function buildSparePartCartLineId(productId: string, sizeValue?: string | null) {
  const normalizedSize = typeof sizeValue === 'string' ? sizeValue.trim() : '';
  if (!normalizedSize) return productId;
  return `${productId}::${normalizedSize}`;
}

export function getSparePartProductIdFromCartLineId(lineId: string) {
  const [productId] = lineId.split('::');
  return productId || lineId;
}
