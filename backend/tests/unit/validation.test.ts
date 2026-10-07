import { parsePagination } from '../../src/utils/pagination';
import { validateMeasurementValues } from '../../src/services/measurement.service';
import { AppError } from '../../src/utils/errors';

describe('parsePagination', () => {
  it('defaults page 1 limit 20', () => {
    expect(parsePagination(undefined)).toEqual({ page: 1, limit: 20, skip: 0, take: 20 });
    expect(parsePagination({})).toEqual({ page: 1, limit: 20, skip: 0, take: 20 });
  });

  it('clamps limit to 50 and floors page', () => {
    expect(parsePagination({ page: '3', limit: '999' })).toEqual({
      page: 3,
      limit: 50,
      skip: 100,
      take: 50,
    });
  });

  it('falls back on invalid input', () => {
    expect(parsePagination({ page: 'abc', limit: '-2' })).toEqual({
      page: 1,
      limit: 20,
      skip: 0,
      take: 20,
    });
  });
});

describe('validateMeasurementValues', () => {
  const fullMenValues = {
    length: 40,
    chest: 40,
    waist: 38,
    shoulder: 18,
    sleeve: 23,
    neck: 15,
    daman: 24,
    shalwarLength: 42,
    shalwarWaist: 32,
    bottomWidth: 14,
  };

  it('accepts complete valid values', () => {
    expect(() => validateMeasurementValues('MEN_SHALWAR_KAMEEZ', fullMenValues)).not.toThrow();
  });

  it('rejects missing fields with details', () => {
    try {
      validateMeasurementValues('MEN_SHALWAR_KAMEEZ', { length: 40 });
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      const appErr = err as AppError;
      expect(appErr.code).toBe('VALIDATION_ERROR');
      expect((appErr.details as { path: string }[]).length).toBeGreaterThan(1);
    }
  });

  it('rejects out-of-range values', () => {
    expect(() =>
      validateMeasurementValues('MEN_KURTA', {
        ...fullMenValues,
        chest: 999,
      }),
    ).toThrow(AppError);
  });

  it('rejects unknown garment types', () => {
    expect(() => validateMeasurementValues('ALIEN_SUIT', {})).toThrow(AppError);
  });
});
