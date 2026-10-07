import { cache } from '../src/utils/cache';

afterEach(() => {
  jest.restoreAllMocks();
  cache.clear();
});
