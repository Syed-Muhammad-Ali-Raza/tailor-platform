import { calculateItemPrice, round2, toMoney } from '../../src/utils/price';

describe('round2', () => {
  it('rounds to two decimals', () => {
    expect(round2(10.005)).toBe(10.01);
    expect(round2(10.004)).toBe(10);
    expect(round2(0)).toBe(0);
  });
});

describe('calculateItemPrice', () => {
  it('computes base price with no extras', () => {
    expect(calculateItemPrice({ basePrice: 2800, optionExtraPrices: [], quantity: 1 })).toBe(2800);
  });

  it('adds fabric extra charge and option prices', () => {
    const price = calculateItemPrice({
      basePrice: 3400,
      fabricExtraCharge: 300,
      optionExtraPrices: [150, 100, 200],
      quantity: 1,
    });
    expect(price).toBe(4150);
  });

  it('multiplies by quantity and rounds', () => {
    const price = calculateItemPrice({
      basePrice: 999.99,
      fabricExtraCharge: 0.01,
      optionExtraPrices: [0.5],
      quantity: 3,
    });
    expect(price).toBe(3001.5);
  });

  it('treats null fabric charge as zero', () => {
    expect(
      calculateItemPrice({ basePrice: 100, fabricExtraCharge: null, optionExtraPrices: [], quantity: 2 }),
    ).toBe(200);
  });
});

describe('toMoney', () => {
  it('converts decimal strings and numbers', () => {
    expect(toMoney('2800.555')).toBe(2800.56);
    expect(toMoney(42)).toBe(42);
    expect(toMoney(undefined)).toBe(0);
  });
});
