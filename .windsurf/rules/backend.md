# Backend Rules (Express + Prisma)

Layer order is strict: `routers → controllers → services → models → Prisma`.

- `routers/`: path definitions + Zod validation middleware only.
- `controllers/`: read validated input, call one service, shape the HTTP
  response with the envelope `{ success, data }` / `{ success:false, error }`.
- `services/`: all business rules — pricing, status transitions, ownership
  checks, daily try-on quotas. Throw `AppError` (`utils/errors.ts`).
- `models/`: Prisma queries only, no business logic.
- `proxy/`: outbound calls (AI try-on provider, WhatsApp/notification) behind
  small interfaces so they can be swapped or disabled.
- Auth: JWT Bearer tokens; `requireAuth` + `requireRole('TAILOR')` middleware.
- Status flow is locked (never skip states): PLACED → ACCEPTED →
  MEASUREMENTS_CONFIRMED → STITCHING → QUALITY_CHECK → READY → DELIVERED,
  CANCELLED from any pre-delivered state. Rules in `utils/status.ts`.
- Money: always recomputed server-side from design base price + fabric extra +
  option prices, rounded to 2 decimals, stored on OrderItem/Order.
- Every endpoint: API test in `backend/tests/api` (Supertest) using
  `createApp({ prisma: mockPrisma })`. Never run tests against a real DB.
- Indexes on every foreign key and on `orders(customerId, createdAt)`,
  `orders(tailorId, status)`, `designs(tailorId, active)`. Use the TTL cache
  in `utils/cache.ts` for public catalog reads.
