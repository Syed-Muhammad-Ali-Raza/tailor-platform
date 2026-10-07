import {
  GARMENT_FIELDS,
  MEASUREMENT_MAX,
  MEASUREMENT_MIN,
} from './constants';
import type { GarmentType } from '@/types';

export function isValidPhone(value: string): boolean {
  return /^(\+923|03)\d{9}$/.test(String(value ?? '').trim());
}

export interface FieldValidation {
  field: string;
  error: string;
}

export function validateMeasurementValue(
  field: string,
  value: unknown,
): FieldValidation | null {
  if (value === null || value === undefined || String(value).trim() === '') {
    return { field, error: 'err_required' };
  }

  const parsed = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(parsed)) {
    return { field, error: 'err_number' };
  }

  if (parsed < MEASUREMENT_MIN || parsed > MEASUREMENT_MAX) {
    return { field, error: 'err_range' };
  }

  return null;
}

export function validateMeasurementForm(
  garmentType: GarmentType,
  values: Record<string, string | number | undefined>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const fields = GARMENT_FIELDS[garmentType] ?? [];

  for (const field of fields) {
    const result = validateMeasurementValue(field.key, values[field.key]);
    if (result) errors[result.field] = result.error;
  }

  return errors;
}
