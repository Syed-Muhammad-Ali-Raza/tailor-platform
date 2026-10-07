import { createApp } from '../../src/app';
import { createMockPrisma, MockPrisma } from './mock-prisma';
import { TryOnProvider } from '../../src/types/deps';

export interface TestApp {
  app: any;
  prisma: MockPrisma;
  tryOnProvider: { generatePreview: jest.Mock };
}

export function makeApp(): TestApp {
  const prisma = createMockPrisma();
  const tryOnProvider: { generatePreview: jest.Mock } = {
    generatePreview: jest.fn().mockResolvedValue({ imageUrl: '/uploads/preview.svg' }),
  };
  const app = createApp({ prisma, tryOnProvider: tryOnProvider as TryOnProvider });
  return { app, prisma, tryOnProvider };
}
