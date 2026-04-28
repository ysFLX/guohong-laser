export const VAT_RATE = 0.2;
export const VAT_PERCENTAGE = 20;

type VatLine = {
  priceCents: number;
  quantity: number;
};

export function calculateVatCents(netCents: number) {
  return Math.round(Math.max(0, netCents) * VAT_RATE);
}

export function calculateGrossCents(netCents: number) {
  return Math.max(0, netCents) + calculateVatCents(netCents);
}

export function calculateVatTotals(lines: VatLine[]) {
  return lines.reduce(
    (totals, line) => {
      const quantity = Math.max(0, Math.floor(line.quantity));
      const subtotalCents = Math.max(0, line.priceCents) * quantity;
      const vatCents = calculateVatCents(line.priceCents) * quantity;

      return {
        subtotalCents: totals.subtotalCents + subtotalCents,
        vatCents: totals.vatCents + vatCents,
        totalCents: totals.totalCents + subtotalCents + vatCents,
      };
    },
    { subtotalCents: 0, vatCents: 0, totalCents: 0 },
  );
}
