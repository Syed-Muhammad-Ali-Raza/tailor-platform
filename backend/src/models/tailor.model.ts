import { Db } from '../types/deps';

export function findTailorByUserId(db: Db, userId: string) {
  return db.tailor.findUnique({ where: { userId } });
}

export function findTailorById(db: Db, id: string) {
  return db.tailor.findUnique({ where: { id } });
}

export function listTailors(db: Db, filters: { city?: string; q?: string }) {
  const where = {
    ...(filters.city ? { city: { equals: filters.city, mode: 'insensitive' as const } } : {}),
    ...(filters.q
      ? {
          OR: [
            { shopName: { contains: filters.q, mode: 'insensitive' as const } },
            { area: { contains: filters.q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
  return db.tailor.findMany({ where, orderBy: { rating: 'desc' }, take: 50 });
}

export function createTailor(
  db: Db,
  data: {
    userId: string;
    shopName: string;
    address: string;
    city: string;
    area: string;
    whatsapp: string;
    bio?: string;
    servesWomen?: boolean;
    femaleStaff?: boolean;
  },
) {
  return db.tailor.create({ data });
}
