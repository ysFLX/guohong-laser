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
