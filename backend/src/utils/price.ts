export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export interface ItemPriceInput {
  basePrice: number;
  fabricExtraCharge?: number | null;
  optionExtraPrices: number[];
  quantity: number;
}

export function calculateItemPrice(input: ItemPriceInput): number {
  const optionsSum = input.optionExtraPrices.reduce((sum, p) => sum + p, 0);
  const unit = input.basePrice + (input.fabricExtraCharge ?? 0) + optionsSum;
  return round2(unit * input.quantity);
}

export function toMoney(value: unknown): number {
  if (typeof value === 'number') return round2(value);
  if (typeof value === 'string') return round2(Number(value));
  return 0;
}
