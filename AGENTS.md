# Tailor Platform — Agent Rules

Local tailor website (Lahore): design catalog, custom stitching orders, saved
measurements, tailor dashboard. **Phase 1 = working ordering business, no AI.**
Full product plan lives in `PRODUCT-PLAN.md`. API contract lives in
`docs/api-contract.md` (backend and frontend must match it exactly).

## Stack

| Layer    | Tech                                                          |
| -------- | ------------------------------------------------------------- |
| Frontend | Next.js 15 (App Router, TS) + Tailwind CSS 4 + Zustand 5      |
| Backend  | Express 5 (TS) + Prisma 6 + PostgreSQL 16                     |
| Tests    | Backend: Jest 30 + Supertest · Frontend: Vitest 5 + RTL 16    |
| Tooling  | npm workspaces, Prettier, ESLint 9 (flat config), Docker      |

## Repo layout

```
backend/src/
  config/       env loader (zod-validated), prisma client, constants
  models/       data access only (Prisma queries, no business rules)
  services/     business logic (pricing, status flow, auth, quotas)
  controllers/  HTTP request/response handling only
  routers/      route definitions + validation middleware
  middleware/   auth, roles, validation, rate limit, error handling
  proxy/        outbound integrations (AI try-on, WhatsApp notify)
  utils/        pure helpers (errors, logger, cache, pagination, price, status)
frontend/src/
  components/   UI only (ui/, layout/, catalog/, customize/, measurements/, orders/, dashboard/)
  hooks/        custom React hooks (data fetching, auth, debounce, ...)
  helpers/      pure functions (api client, format, validation, whatsapp, price)
  store/        Zustand stores (auth, locale, orderDraft)
  i18n/         en.ts + ur.ts dictionaries (both must define the same keys)
  app/          App Router pages (thin — logic lives in components/hooks)
```

## Hard rules

1. **Max 500 lines per file** (enforced by ESLint `max-lines`). If a file
   approaches ~400 lines, split it. Components especially.
2. **No comments in code** unless the user explicitly asks for them.
3. **Server is the source of truth for money.** The frontend may mirror price
   math for live display, but the backend always recalculates and stores prices.
4. **Every new endpoint needs a test** (Supertest API test). Every new helper
   needs a unit test. Run `npm test` before finishing.
5. **i18n:** any user-facing string goes through `t('key')`. Add the key to
   BOTH `frontend/src/i18n/en.ts` and `ur.ts`.
6. **Urdu is RTL.** Never hardcode `left/right` margins in components that are
   visible in Urdu; use logical properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`).
7. **No secrets in code.** JWT secrets, DB URLs, API keys come from env only.
   Customer photos are private: never expose them with public URLs.
8. **Order status flow is locked:** `PLACED → ACCEPTED →
   MEASUREMENTS_CONFIRMED → STITCHING → QUALITY_CHECK → READY → DELIVERED`,
   plus `CANCELLED` allowed from any state before DELIVERED. Never skip states.
   Rules live in `backend/src/utils/status.ts`.
9. **Label try-on as "Style Preview", never "Exact Fit".** (Phase 2 feature —
   stubbed with 501 in Phase 1.)
10. Prefer named exports. Default exports only in `frontend/src/app/**/page.tsx`
    and Next.js special files (`layout.tsx`, `middleware.ts`).

## Commands

```bash
npm install            # root, installs both workspaces
npm run db:up          # start Postgres (docker)
npm run db:migrate     # prisma migrate dev
npm run db:seed        # demo tailor + designs
npm run dev            # backend :4000 + frontend :3000
npm test               # backend Jest + frontend Vitest
npm run lint           # ESLint both workspaces
npm run typecheck      # tsc --noEmit both workspaces
```

## Conventions

- API is versioned: `/api/v1/...`. Responses use the envelope from
  `docs/api-contract.md` (`{ success, data }` / `{ success:false, error }`).
- IDs are cuid strings. Dates are ISO-8601 strings in JSON. Money is a
  JS number rounded to 2 decimals (PKR).
- Validation: Zod schemas live next to the route/controller they serve;
  middleware parses, controllers never re-parse.
- Tailors are `role: TAILOR` users owning a `Tailor` row; ownership checks
  happen in services (a tailor may only edit their own designs/orders).
