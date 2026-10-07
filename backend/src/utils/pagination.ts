export interface Pagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export function parsePagination(query: unknown): Pagination {
  const q = (query ?? {}) as Record<string, unknown>;
  const rawPage = Number(q.page);
  const rawLimit = Number(q.limit);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit >= 1
      ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
      : DEFAULT_LIMIT;
  return { page, limit, skip: (page - 1) * limit, take: limit };
}
