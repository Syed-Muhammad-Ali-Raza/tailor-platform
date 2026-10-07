export function round2(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Number((value * 100).toPrecision(15))) / 100;
}

export interface ItemPriceInput {
  basePrice: number;
  fabricExtraCharge?: number;
  optionExtraPrices?: number[];
  quantity?: number;
}

export function calculateItemPrice({
  basePrice,
  fabricExtraCharge = 0,
  optionExtraPrices = [],
  quantity = 1,
}: ItemPriceInput): number {
  const optionsTotal = optionExtraPrices.reduce((sum, price) => sum + price, 0);
  const unitPrice = basePrice + fabricExtraCharge + optionsTotal;
  return round2(round2(unitPrice) * quantity);
}
