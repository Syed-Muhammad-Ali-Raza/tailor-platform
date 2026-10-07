import type { Prisma } from '@prisma/client';
import { Db } from '../types/deps';

export function findUserByIdentifier(db: Db, identifier: string) {
  return db.user.findFirst({
    where: { OR: [{ phone: identifier }, { email: identifier }] },
  });
}

export function findUserById(db: Db, id: string) {
  return db.user.findUnique({ where: { id } });
}

export function findUserByPhone(db: Db, phone: string) {
  return db.user.findUnique({ where: { phone } });
}

export function findUserByEmail(db: Db, email: string) {
  return db.user.findUnique({ where: { email } });
}

export function createUser(
  db: Db,
  data: Prisma.UserCreateInput | { name: string; phone: string; email?: string; passwordHash: string; role: string },
) {
  return db.user.create({ data: data as Prisma.UserCreateInput });
}

export function publicUser(user: {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
}) {
  return { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role };
}
