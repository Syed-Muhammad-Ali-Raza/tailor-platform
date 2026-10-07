type Fn = jest.Mock;

function delegate(): Record<string, Fn> {
  return {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
    upsert: jest.fn(),
  };
}

export type MockPrisma = any;

export function createMockPrisma(): MockPrisma {
  const mock: Record<string, any> = {
    user: delegate(),
    tailor: delegate(),
    design: delegate(),
    fabric: delegate(),
    styleOption: delegate(),
    measurement: delegate(),
    order: delegate(),
    orderItem: delegate(),
    orderStatusEvent: delegate(),
    payment: delegate(),
    tryOnRequest: delegate(),
    review: delegate(),
    $transaction: jest.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return (arg as (tx: unknown) => unknown)(mock);
      if (Array.isArray(arg)) return Promise.all(arg);
      return mock;
    }),
    $queryRaw: jest.fn(),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  return mock;
}

export function resetMockPrisma(mock: MockPrisma): void {
  for (const value of Object.values(mock)) {
    if (value && typeof value === 'object') {
      for (const fn of Object.values(value)) {
        if (typeof fn === 'function' && 'mockClear' in fn) (fn as Fn).mockClear();
      }
    }
  }
}
