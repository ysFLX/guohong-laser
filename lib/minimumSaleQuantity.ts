export const LOW_PRICE_MINIMUM_CENTS = 30000;
export const LOW_PRICE_MINIMUM_QUANTITY = 20;

export function getMinimumSaleQuantity(priceCents: number) {
  if (!Number.isFinite(priceCents) || priceCents < 0) return 1;
  return priceCents < LOW_PRICE_MINIMUM_CENTS ? LOW_PRICE_MINIMUM_QUANTITY : 1;
}

export function normalizeSaleQuantity(quantity: number, priceCents: number) {
  const minimum = getMinimumSaleQuantity(priceCents);
  if (!Number.isFinite(quantity)) return minimum;
  return Math.max(minimum, Math.min(999, Math.floor(quantity)));
}
