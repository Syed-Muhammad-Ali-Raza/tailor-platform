export {};

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; role: string; name: string };
      validated?: { query?: unknown };
    }
  }
}
