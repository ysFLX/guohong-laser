export function normalizeSaleQuantity(quantity: number, _priceCents: number) {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(999, Math.floor(quantity)));
}
