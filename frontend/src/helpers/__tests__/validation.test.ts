import { describe, expect, it } from 'vitest';
import {
  isValidPhone,
  validateMeasurementForm,
  validateMeasurementValue,
} from '../validation';

describe('isValidPhone', () => {
  it('accepts local 03XXXXXXXXX format', () => {
    expect(isValidPhone('03001234567')).toBe(true);
  });

  it('accepts international +92 300 XXXXXXX format', () => {
    expect(isValidPhone('+923001234567')).toBe(true);
  });

  it('rejects numbers with wrong digit counts', () => {
    expect(isValidPhone('0300123456')).toBe(false);
    expect(isValidPhone('030012345678')).toBe(false);
    expect(isValidPhone('+92300123456')).toBe(false);
  });

  it('rejects missing or wrong prefixes', () => {
    expect(isValidPhone('3001234567')).toBe(false);
    expect(isValidPhone('923001234567')).toBe(false);
    expect(isValidPhone('0312-3456789')).toBe(false);
  });

  it('rejects non-numeric and empty input', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('abc03001234567')).toBe(false);
  });
});

describe('validateMeasurementValue', () => {
  it('returns an error for empty values', () => {
    expect(validateMeasurementValue('chest', '')).toEqual({
      field: 'chest',
      error: 'err_required',
    });
    expect(validateMeasurementValue('chest', null)).toEqual({
      field: 'chest',
      error: 'err_required',
    });
  });

  it('returns an error for non-numeric values', () => {
    expect(validateMeasurementValue('chest', 'abc')).toEqual({
      field: 'chest',
      error: 'err_number',
    });
  });

  it('returns an error outside the 1–72 inch range', () => {
    expect(validateMeasurementValue('chest', 0)).toEqual({
      field: 'chest',
      error: 'err_range',
    });
    expect(validateMeasurementValue('chest', 73)).toEqual({
      field: 'chest',
      error: 'err_range',
    });
  });

  it('accepts valid numeric values', () => {
    expect(validateMeasurementValue('chest', 30)).toBeNull();
    expect(validateMeasurementValue('length', '50')).toBeNull();
  });
});

describe('validateMeasurementForm', () => {
  it('flags every required field when the form is empty', () => {
    const errors = validateMeasurementForm('MEN_KURTA', {});
    expect(Object.keys(errors)).toHaveLength(7);
    expect(Object.values(errors).every((error) => error === 'err_required')).toBe(
      true,
    );
  });

  it('accepts a fully filled form', () => {
    const values = {
      length: '40',
      chest: '36',
      waist: '32',
      shoulder: '18',
      sleeve: '24',
      neck: '15',
      daman: '48',
    };
    expect(validateMeasurementForm('MEN_KURTA', values)).toEqual({});
  });

  it('reports the specific invalid field', () => {
    const values = {
      length: '40',
      chest: '99',
      waist: '32',
      shoulder: '18',
      sleeve: '24',
      neck: '15',
      daman: '48',
    };
    const errors = validateMeasurementForm('MEN_KURTA', values);
    expect(errors.chest).toBe('err_range');
    expect(errors.length).toBeUndefined();
  });

  it('validates women kameez fields', () => {
    const errors = validateMeasurementForm('WOMEN_KAMEEZ', {
      length: '10',
    });
    expect(errors.bust).toBe('err_required');
    expect(errors.hip).toBe('err_required');
  });
});