# Tailor Platform — General Rules

Read `AGENTS.md` (repo root) and `docs/api-contract.md` before editing code.

- Monorepo: `backend` = Express 5 + TypeScript + Prisma 6 + PostgreSQL 16.
  `frontend` = Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + Zustand 5.
- **Hard limit: 500 lines per file** (ESLint `max-lines`). Split files near 400.
- No code comments unless asked.
- Named exports; default exports only in `frontend/src/app/**/page.tsx` and
  Next.js special files.
- No secrets in code — use env variables documented in `.env.example`.
- Server is the source of truth for all prices and order status transitions.
- Verify with: `npm test`, `npm run lint`, `npm run typecheck`.
