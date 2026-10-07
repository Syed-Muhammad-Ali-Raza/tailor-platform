import { Db } from '../types/deps';
import { Pagination } from '../utils/pagination';

export interface DesignFilters {
  audience?: string;
  category?: string;
  tailorId?: string;
  q?: string;
}

export function listDesigns(db: Db, filters: DesignFilters, pagination: Pagination) {
  const where = {
    active: true,
    ...(filters.audience ? { audience: filters.audience as 'MEN' | 'WOMEN' } : {}),
    ...(filters.category ? { category: filters.category as any } : {}),
    ...(filters.tailorId ? { tailorId: filters.tailorId } : {}),
    ...(filters.q
      ? { name: { contains: filters.q, mode: 'insensitive' as const } }
      : {}),
  };
  return db.design.findMany({
    where,
    include: { tailor: { select: { shopName: true } } },
    orderBy: { createdAt: 'desc' },
    skip: pagination.skip,
    take: pagination.take,
  });
}

export function countDesigns(db: Db, filters: DesignFilters) {
  const where = {
    active: true,
    ...(filters.audience ? { audience: filters.audience as 'MEN' | 'WOMEN' } : {}),
    ...(filters.category ? { category: filters.category as any } : {}),
    ...(filters.tailorId ? { tailorId: filters.tailorId } : {}),
    ...(filters.q ? { name: { contains: filters.q, mode: 'insensitive' as const } } : {}),
  };
  return db.design.count({ where });
}

export function findDesignById(db: Db, id: string) {
  return db.design.findUnique({
    where: { id },
    include: {
      tailor: true,
      fabrics: true,
      options: true,
    },
  });
}

export function findOwnedDesign(db: Db, id: string, tailorId: string) {
  return db.design.findFirst({ where: { id, tailorId } });
}

export function listTailorDesigns(db: Db, tailorId: string) {
  return db.design.findMany({
    where: { tailorId },
    include: { fabrics: true, options: true, tailor: true },
    orderBy: { createdAt: 'desc' },
  });
}

export function createDesign(
  db: Db,
  tailorId: string,
  data: {
    name: string;
    audience: string;
    category: string;
    basePrice: number;
    images?: string[];
    description?: string;
    active?: boolean;
  },
) {
  return db.design.create({
    data: {
      tailorId,
      name: data.name,
      audience: data.audience as 'MEN' | 'WOMEN',
      category: data.category as any,
      basePrice: data.basePrice,
      images: data.images ?? [],
      description: data.description,
      active: data.active ?? true,
    },
  });
}

export function updateDesign(db: Db, id: string, data: Record<string, unknown>) {
  return db.design.update({
    where: { id },
    data: data as never,
  });
}

export function deleteDesign(db: Db, id: string) {
  return db.design.delete({ where: { id } });
}

export function createFabric(
  db: Db,
  data: { designId: string; tailorId: string; name: string; pricePerMeter: number; extraCharge?: number; image?: string },
) {
  return db.fabric.create({ data: { ...data, extraCharge: data.extraCharge ?? 0 } });
}

export function findFabric(db: Db, id: string, tailorId: string) {
  return db.fabric.findFirst({ where: { id, tailorId } });
}

export function deleteFabric(db: Db, id: string) {
  return db.fabric.delete({ where: { id } });
}

export function createOption(
  db: Db,
  data: { designId: string; tailorId: string; type: string; name: string; extraPrice?: number },
) {
  return db.styleOption.create({
    data: { ...data, type: data.type as any, extraPrice: data.extraPrice ?? 0 },
  });
}

export function findOption(db: Db, id: string, tailorId: string) {
  return db.styleOption.findFirst({ where: { id, tailorId } });
}

export function deleteOption(db: Db, id: string) {
  return db.styleOption.delete({ where: { id } });
}
