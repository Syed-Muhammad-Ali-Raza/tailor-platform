---
name: add-api-endpoint
description: Use when adding or changing a backend API endpoint in backend/src (routers, controllers, services, models, tests) so the new route follows the Tailor Platform layering, envelope, and test conventions.
---

# Adding a backend endpoint

Follow this order; every layer has a fixed job.

1. **Contract first** — update `docs/api-contract.md` with method, path, body,
   response `data` shape, and error codes.
2. **Router** (`src/routers/<feature>.router.ts`):
   `router.post('/path', requireAuth, requireRole('TAILOR'), validateBody(schema), controller.fn)`.
   Zod schemas live in this file. Validation never happens in controllers.
3. **Controller** (`src/controllers/<feature>.controller.ts`):
   read validated input, call exactly one service, respond
   `res.status(201).json({ success: true, data })` (or 200/204). No business rules.
4. **Service** (`src/services/<feature>.service.ts`):
   ownership checks, pricing, status-transition rules (`utils/status.ts`),
   quotas. Throw `AppError('NOT_FOUND', ...)` etc. from `utils/errors.ts`.
5. **Model** (`src/models/<feature>.model.ts`) only when new Prisma queries
   are needed; models contain no rules and no HTTP.
6. **Tests**:
   - `tests/api/<feature>.test.ts` — happy path + 401 (no token) + 403 (wrong
     role) + validation failure, using `createApp({ prisma: mockPrisma })`.
   - Unit test for any new pure helper.
7. Run `npm test && npm run lint && npm run typecheck` from the repo root.

Registration: add the router to `src/routers/index.ts` under `/api/v1`.

Rules that are never negotiable: 500-line file max, no comments, server-side
price calculation, status flow cannot skip states, i18n keys added to both
language files for any new UI string.
