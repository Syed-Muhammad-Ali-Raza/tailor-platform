import { TtlCache } from '../../src/utils/cache';

describe('TtlCache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('stores and returns values before expiry', () => {
    const cache = new TtlCache();
    cache.set('a', 1, 1000);
    expect(cache.get<number>('a')).toBe(1);
    jest.advanceTimersByTime(500);
    expect(cache.get<number>('a')).toBe(1);
  });

  it('expires values after ttl', () => {
    const cache = new TtlCache();
    cache.set('a', 1, 1000);
    jest.advanceTimersByTime(1001);
    expect(cache.get('a')).toBeUndefined();
  });

  it('getOrSet computes only on miss and invalidates by prefix', async () => {
    const cache = new TtlCache();
    const fn = jest.fn().mockResolvedValue('value');
    await expect(cache.getOrSet('designs:1', 1000, fn)).resolves.toBe('value');
    await expect(cache.getOrSet('designs:1', 1000, fn)).resolves.toBe('value');
    expect(fn).toHaveBeenCalledTimes(1);

    cache.invalidate('designs:');
    await expect(cache.getOrSet('designs:1', 1000, fn)).resolves.toBe('value');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('evicts oldest entries beyond max size', () => {
    const cache = new TtlCache(2);
    cache.set('a', 1, 10_000);
    cache.set('b', 2, 10_000);
    cache.set('c', 3, 10_000);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('c')).toBe(3);
  });
});
