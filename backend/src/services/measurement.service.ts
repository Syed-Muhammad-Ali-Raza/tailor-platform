import { REQUIRED_MEASUREMENT_FIELDS } from '../config/constants';
import { AppError, badRequest, notFound } from '../utils/errors';
import * as measurementModel from '../models/measurement.model';
import { PrismaLike } from '../types/deps';

export interface MeasurementInput {
  label: string;
  garmentType: string;
  values: Record<string, number>;
}

export function validateMeasurementValues(garmentType: string, values: Record<string, number>) {
  const required = REQUIRED_MEASUREMENT_FIELDS[garmentType];
  if (!required) throw badRequest(`Unknown garment type: ${garmentType}`);

  const details: { path: string; message: string }[] = [];
  for (const field of required) {
    const value = values[field];
    if (value === undefined || value === null || Number.isNaN(value)) {
      details.push({ path: field, message: `${field} is required` });
      continue;
    }
    if (value < 1 || value > 72) {
      details.push({ path: field, message: `${field} must be between 1 and 72 inches` });
    }
  }
  if (details.length > 0) throw badRequest('Measurement values are invalid', details);
}

export async function listMeasurements(prisma: PrismaLike, customerId: string) {
  const measurements = await measurementModel.listMeasurements(prisma, customerId);
  return { measurements };
}

export async function createMeasurement(prisma: PrismaLike, customerId: string, input: MeasurementInput) {
  validateMeasurementValues(input.garmentType, input.values);
  const measurement = await measurementModel.createMeasurement(prisma, customerId, input);
  return { measurement };
}

export async function updateMeasurement(
  prisma: PrismaLike,
  id: string,
  customerId: string,
  input: { label?: string; values?: Record<string, number> },
) {
  const existing = await measurementModel.findMeasurement(prisma, id, customerId);
  if (!existing) throw notFound('Measurement not found');
  if (input.values) {
    validateMeasurementValues(String(existing.garmentType), input.values);
  }
  const measurement = await measurementModel.updateMeasurement(prisma, id, input);
  return { measurement };
}

export async function deleteMeasurement(prisma: PrismaLike, id: string, customerId: string) {
  const existing = await measurementModel.findMeasurement(prisma, id, customerId);
  if (!existing) throw notFound('Measurement not found');
  await measurementModel.deleteMeasurement(prisma, id);
}

export async function assertOwnedMeasurement(prisma: PrismaLike, id: string, customerId: string) {
  const existing = await measurementModel.findMeasurement(prisma, id, customerId);
  if (!existing) throw new AppError('NOT_FOUND', 'Measurement not found');
  return existing;
}
