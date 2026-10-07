import type { Prisma, PrismaClient } from '@prisma/client';

export type PrismaLike = PrismaClient;
export type Db = PrismaLike | Prisma.TransactionClient;

export interface AppDeps {
  prisma: PrismaLike;
  tryOnProvider?: TryOnProvider;
}

export interface TryOnProvider {
  generatePreview(input: {
    customerId: string;
    designId: string;
    photoBase64?: string;
  }): Promise<{ imageUrl: string }>;
}
