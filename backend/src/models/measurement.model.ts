import { Db } from '../types/deps';

export function listMeasurements(db: Db, customerId: string) {
  return db.measurement.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  });
}

export function findMeasurement(db: Db, id: string, customerId: string) {
  return db.measurement.findFirst({ where: { id, customerId } });
}

export function createMeasurement(
  db: Db,
  customerId: string,
  data: { label: string; garmentType: string; values: Record<string, number> },
) {
  return db.measurement.create({
    data: {
      customerId,
      label: data.label,
      garmentType: data.garmentType as never,
      values: data.values,
    },
  });
}

export function updateMeasurement(
  db: Db,
  id: string,
  data: { label?: string; values?: Record<string, number> },
) {
  return db.measurement.update({ where: { id }, data: data as never });
}

export function deleteMeasurement(db: Db, id: string) {
  return db.measurement.delete({ where: { id } });
}
