import {
  assertTransition,
  canTransition,
  isOrderStatus,
  allowedNext,
} from '../../src/utils/status';
import { AppError } from '../../src/utils/errors';

describe('status transitions', () => {
  it('allows the full happy path chain', () => {
    const chain = [
      'PLACED',
      'ACCEPTED',
      'MEASUREMENTS_CONFIRMED',
      'STITCHING',
      'QUALITY_CHECK',
      'READY',
      'DELIVERED',
    ] as const;
    for (let i = 0; i < chain.length - 1; i++) {
      expect(canTransition(chain[i], chain[i + 1])).toBe(true);
    }
  });

  it('allows cancelling from every pre-delivered state', () => {
    const states = ['PLACED', 'ACCEPTED', 'MEASUREMENTS_CONFIRMED', 'STITCHING', 'QUALITY_CHECK', 'READY'];
    for (const s of states) {
      expect(canTransition(s as never, 'CANCELLED')).toBe(true);
    }
  });

  it('forbids skipping states', () => {
    expect(canTransition('PLACED', 'STITCHING')).toBe(false);
    expect(canTransition('ACCEPTED', 'READY')).toBe(false);
    expect(canTransition('STITCHING', 'DELIVERED')).toBe(false);
  });

  it('treats DELIVERED and CANCELLED as terminal', () => {
    expect(allowedNext('DELIVERED')).toEqual([]);
    expect(allowedNext('CANCELLED')).toEqual([]);
    expect(canTransition('DELIVERED', 'CANCELLED')).toBe(false);
    expect(canTransition('CANCELLED', 'STITCHING')).toBe(false);
  });

  it('assertTransition throws CONFLICT AppError on invalid moves', () => {
    expect(() => assertTransition('PLACED', 'STITCHING')).toThrow(AppError);
    try {
      assertTransition('PLACED', 'STITCHING');
    } catch (err) {
      expect((err as AppError).code).toBe('CONFLICT');
      expect((err as AppError).status).toBe(409);
    }
    expect(() => assertTransition('PLACED', 'ACCEPTED')).not.toThrow();
  });

  it('isOrderStatus narrows correctly', () => {
    expect(isOrderStatus('STITCHING')).toBe(true);
    expect(isOrderStatus('BOGUS')).toBe(false);
  });
});
