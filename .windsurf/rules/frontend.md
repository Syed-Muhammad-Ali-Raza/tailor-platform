# Frontend Rules (Next.js + Tailwind + Zustand)

- Pages in `src/app/**/page.tsx` stay thin: compose components, pass data.
  Rendering and interaction live in `src/components/**`.
- Structure: `components/` (ui/, layout/, catalog/, customize/, measurements/,
  orders/, dashboard/), `hooks/` (data fetching + custom hooks), `helpers/`
  (pure functions incl. `api.ts` client), `store/` (Zustand: auth, locale,
  orderDraft), `i18n/en.ts` + `i18n/ur.ts`.
- **Max 500 lines per component file.** Break large forms into child components.
- Every string uses `t('key')`; add the key to BOTH language files.
- RTL: use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `text-start`) —
  Urdu is right-to-left.
- `helpers/api.ts` is the only place that talks to the network; hooks call it.
  Errors surface as `ApiError { code, message, status }`.
- Prices displayed live are mirrors (`helpers/price.ts`); the order response
  from the server always wins — show server totals after placement.
- Mobile-first: design at 360 px width first, tap targets ≥ 44 px, WhatsApp
  CTA buttons on catalog and order pages.
- Tests: Vitest + RTL under `src/**/__tests__/`; mock `helpers/api.ts`.
