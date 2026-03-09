function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function isSparePartPriceVisible() {
  const raw = normalize(process.env.NEXT_PUBLIC_SPARE_PART_PRICE_VISIBILITY || '');
  return raw === 'visible';
}

export function isSparePartDirectPurchaseEnabled() {
  const raw = normalize(process.env.NEXT_PUBLIC_SPARE_PART_DIRECT_PURCHASE || '');
  return raw === '1' || raw === 'true' || raw === 'enabled' || raw === 'active';
}
