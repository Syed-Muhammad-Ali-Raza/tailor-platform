import { describe, expect, it } from 'vitest';
import { calculateItemPrice, round2 } from '../price';

describe('round2', () => {
  it('rounds to two decimals', () => {
    expect(round2(10.234)).toBe(10.23);
    expect(round2(10.235)).toBe(10.24);
    expect(round2(10.236)).toBe(10.24);
    expect(round2(5)).toBe(5);
  });

  it('rounds half-up for 0.005 edge cases', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.675)).toBe(2.68);
    expect(round2(33.335)).toBe(33.34);
  });

  it('handles whole numbers and large values', () => {
    expect(round2(2999.97)).toBe(2999.97);
    expect(round2(0)).toBe(0);
  });
});

describe('calculateItemPrice', () => {
  it('returns base price when there are no extras and quantity is 1', () => {
    expect(calculateItemPrice({ basePrice: 850, quantity: 1 })).toBe(850);
  });

  it('adds fabric extra charge and all option extras to the unit price', () => {
    const result = calculateItemPrice({
      basePrice: 1000,
      fabricExtraCharge: 200,
      optionExtraPrices: [50, 25],
      quantity: 1,
    });
    expect(result).toBe(1275);
  });

  it('multiplies the unit price by quantity', () => {
    const result = calculateItemPrice({
      basePrice: 1000,
      fabricExtraCharge: 200,
      optionExtraPrices: [50, 25],
      quantity: 2,
    });
    expect(result).toBe(2550);
  });

  it('rounds the final result to two decimals', () => {
    expect(calculateItemPrice({ basePrice: 10.005, quantity: 1 })).toBe(10.01);
    expect(calculateItemPrice({ basePrice: 999.99, quantity: 3 })).toBe(2999.97);
  });

  it('works with zero extras and big quantity', () => {
    expect(calculateItemPrice({ basePrice: 999.99, quantity: 20 })).toBe(
      19999.8,
    );
  });
});