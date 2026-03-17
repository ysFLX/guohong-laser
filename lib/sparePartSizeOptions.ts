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

export function sanitizeSparePartSizeOptionEntries(
  value: unknown,
  fallbackPriceCents: number,
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

    const parsedPrice =
      coercePriceCents(row.priceCents) ??
      coercePriceCents(row.priceTry) ??
      clampPriceCents(fallbackPriceCents);

    seen.add(dedupeKey);
    result.push({
      value: normalizedValue,
      priceCents: parsedPrice,
    });

    if (result.length >= 100) break;
  }

  return result;
}

export function buildSparePartSizeOptionPricesMap(entries: SparePartSizeOptionEntry[]) {
  const map: Record<string, number> = {};
  for (const entry of entries) {
    map[entry.value] = clampPriceCents(entry.priceCents);
  }
  return map;
}

export function normalizeSparePartSizeOptionPricesMap(
  value: unknown,
  sizeOptions: string[],
  fallbackPriceCents: number,
) {
  const map: Record<string, number> = {};
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

  for (const option of sizeOptions) {
    const raw = source[option];
    const parsed = coercePriceCents(raw);
    map[option] = parsed ?? clampPriceCents(fallbackPriceCents);
  }

  return map;
}

export function buildSparePartSizeOptionEntries(
  sizeOptions: string[],
  sizeOptionPrices: unknown,
  fallbackPriceCents: number,
) {
  const map = normalizeSparePartSizeOptionPricesMap(sizeOptionPrices, sizeOptions, fallbackPriceCents);
  return sizeOptions.map((value) => ({
    value,
    priceCents: map[value] ?? clampPriceCents(fallbackPriceCents),
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
