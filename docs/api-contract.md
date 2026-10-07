# API Contract (v1)

Both workspaces MUST match this file exactly. Base path: `/api/v1`.
The frontend calls same-origin `/api/v1/*`; Next.js rewrites proxy to the
backend (`API_PROXY_TARGET`). Backend may also be called directly on `:4000`.

## Envelope

Success: `{ "success": true, "data": <T> }`
Error:   `{ "success": false, "error": { "code": "<CODE>", "message": "...", "details"?: [...] } }`

| HTTP | codes                                                       |
| ---- | ----------------------------------------------------------- |
| 400  | `VALIDATION_ERROR` (details = zod issues)                    |
| 401  | `UNAUTHORIZED`                                               |
| 403  | `FORBIDDEN`                                                  |
| 404  | `NOT_FOUND`                                                  |
| 409  | `CONFLICT`                                                   |
| 429  | `RATE_LIMITED`                                               |
| 501  | `FEATURE_DISABLED` (try-on stub)                             |
| 500  | `INTERNAL`                                                   |

Money: JSON number rounded to 2 decimals (PKR). Dates: ISO-8601 strings. IDs: cuid.

## Auth

`Authorization: Bearer <jwt>`. JWT payload: `{ sub, role, name }`, HS256,
`JWT_SECRET`, expiry `JWT_EXPIRES_IN` (default `7d`).
Roles: `CUSTOMER | TAILOR | ADMIN`.

## Enums (strings everywhere)

- audiences: `MEN`, `WOMEN`
- categories: `SHALWAR_KAMEEZ`, `KURTA`, `WAISTCOAT`, `KAMEEZ_SHALWAR`, `SUIT`, `TROUSER`, `OTHER`
- garment types (measurements): `MEN_SHALWAR_KAMEEZ`, `MEN_KURTA`, `MEN_TROUSER`, `WOMEN_KAMEEZ`, `WOMEN_BOTTOM`
- option types: `COLLAR`, `CUFF`, `FRONT`, `POCKET`, `TROUSER_STYLE`, `NECKLINE`, `SLEEVE`, `SHAPE`, `BOTTOM_STYLE`, `EXTRA`
- fabric names: free string (e.g. `Cotton`, `Wash & Wear`, `Linen`, `Khaddar`)
- order statuses: `PLACED`, `ACCEPTED`, `MEASUREMENTS_CONFIRMED`, `STITCHING`, `QUALITY_CHECK`, `READY`, `DELIVERED`, `CANCELLED`
- delivery type: `DELIVERY`, `PICKUP`
- payment method: `COD`, `PAY_AT_PICKUP`
- payment status: `PENDING`, `PAID`, `REFUNDED`

Status transitions (only these; `CANCELLED` allowed from anything except
`DELIVERED`):

```
PLACED → ACCEPTED → MEASUREMENTS_CONFIRMED → STITCHING → QUALITY_CHECK → READY → DELIVERED
```

## Endpoints

### Health (public)
`GET /health` → `data: { status: "ok", uptime: number, version: string }`

### Auth
- `POST /auth/register` body `{ name, phone, password, email?, role?: "CUSTOMER"|"TAILOR" }`
  → 201 `data: { token, user: { id, name, phone, email, role } }`
  (409 `CONFLICT` if phone/email taken; password ≥ 8 chars; phone: `+923XXXXXXXXX` or `03XXXXXXXXX`)
- `POST /auth/login` body `{ identifier, password }` (phone or email)
  → `data: { token, user }` (401 `UNAUTHORIZED` on bad credentials)
- `GET /auth/me` (auth) → `data: { user }`

### Tailors (public)
- `GET /tailors?city=Lahore&q=` → `data: { tailors: Tailor[] }`
- `GET /tailors/:id` → `data: { tailor }` incl. portfolio images

`Tailor = { id, userId, shopName, address, city, area, whatsapp, bio, rating, servesWomen, femaleStaff, portfolioImages: string[] }`

### Designs (public catalog)
- `GET /designs?audience=MEN|WOMEN&category=&tailorId=&q=&page=1&limit=20`
  → `data: { designs: DesignSummary[], page, limit, total }`
- `GET /designs/:id` → `data: { design: DesignDetail }`
  DesignDetail incl. `fabrics: Fabric[]`, `styleOptions: StyleOption[]`

```
DesignSummary = { id, tailorId, name, audience, category, basePrice, images: string[], active, tailorName? }
Fabric        = { id, name, pricePerMeter, extraCharge, image? }
StyleOption   = { id, type, name, extraPrice }
```

### Tailor catalog management (role TAILOR, own rows only)
- `POST /tailor/designs` body `{ name, audience, category, basePrice, images?, description?, active? }` → 201 `{ design }`
- `PUT /tailor/designs/:id` body partial → `{ design }`
- `DELETE /tailor/designs/:id` → 204
- `POST /tailor/designs/:id/fabrics` body `{ name, pricePerMeter, extraCharge, image? }` → 201 `{ fabric }`
- `DELETE /tailor/fabrics/:id` → 204
- `POST /tailor/designs/:id/options` body `{ type, name, extraPrice }` → 201 `{ styleOption }`
- `DELETE /tailor/options/:id` → 204
- `GET /tailor/designs` → `data: { designs: DesignDetail[] }` (own, incl. inactive)

### Measurements (auth)
- `GET /measurements` → `data: { measurements }` (own; `values` is a JSON record of inch numbers)
- `POST /measurements` body `{ label, garmentType, values }` → 201 `{ measurement }`
  (required keys per garmentType validated server-side; values 1–72 inches)
- `PUT /measurements/:id` body partial → `{ measurement }`
- `DELETE /measurements/:id` → 204

`Measurement = { id, customerId, label, garmentType, values: Record<string, number>, createdAt }`

Required `values` keys:

```
MEN_SHALWAR_KAMEEZ: length, chest, waist, shoulder, sleeve, neck, daman, shalwarLength, shalwarWaist, bottomWidth
MEN_KURTA:          length, chest, waist, shoulder, sleeve, neck, daman
MEN_TROUSER:        length, waist, bottomWidth
WOMEN_KAMEEZ:       length, bust, waist, hip, shoulder, sleeve, armhole, neckFront, neckBack, daman
WOMEN_BOTTOM:       waist, hip, length, bottomWidth
```

### Orders (auth)
- `POST /orders` body:
```
{
  designId: string,
  fabricId?: string,
  optionIds: string[],
  measurementId?: string,
  quantity: number (1..20),
  deliveryType: "DELIVERY" | "PICKUP",
  paymentMethod: "COD" | "PAY_AT_PICKUP",
  notes?: string,
  referencePhotoUrl?: string,
  dueDate?: ISO string,
  offeredPrice?: number (positive, ≤ 1000000)
}
```
  → 201 `data: { order: OrderDetail }`. Server computes every price; unknown
  ids or tailor mismatch → 404/400. Creates `Order` + `OrderItem[]` + `Payment(PENDING)` + status event `PLACED`.
  `offeredPrice` is a **non-binding customer proposal** stored on the order
  (`order.offeredPrice`); it never replaces the server-computed total. The
  tailor confirms (or counters) via `PATCH /orders/:id/quote` (`order.finalPrice`).
- `GET /orders?status=` → `data: { orders: OrderSummary[] }` (own)
- `GET /orders/:id` → `data: { order: OrderDetail }` (owner or that tailor)
- `POST /orders/:id/cancel` body `{ reason? }` → `{ order }` (customer, before DELIVERED)
- `PATCH /orders/:id/status` body `{ status, note? }` → `{ order }` (owning tailor; transition validated)
- `PATCH /orders/:id/quote` body `{ finalPrice }` → `{ order }` (owning tailor; sets `order.finalPrice`, `quotedAt`)
- `POST /orders/:id/review` body `{ rating: 1..5, comment? }` → 201 `{ review }` (customer who
  owns the order; only after `DELIVERED`, once per order — 409 `CONFLICT` otherwise)
- `PUT /orders/:id/review` body partial `{ rating?, comment? }` → `{ review }` (update own review)

```
OrderSummary = { id, status, totalPrice, finalPrice?, offeredPrice?, deliveryType, dueDate?, createdAt,
                 customerName?, tailorShopName?, itemCount }
OrderDetail   = OrderSummary & {
  notes, referencePhotoUrl?, quotedAt?, cancelReason?,
  items: [{ id, designName, fabricName?, quantity, price, selectedOptions: [{name, extraPrice}], measurementId? }],
  payment: { method, amount, status },
  review: { id, rating, comment?, createdAt } | null,
  statusEvents: [{ id, from, to, note?, createdAt }]
}
Review = { id, orderId, rating, comment?, createdAt, customerName?, designName? }
```

### Design reviews (public)
- `GET /designs/:id/reviews?page=&limit=`
  → `data: { reviews: Review[], averageRating: number (0..5, 2dp), total, page, limit }`
  (404 `NOT_FOUND` if the design does not exist)

### Tailor dashboard (role TAILOR)
- `GET /dashboard/summary` → `data: { newToday, activeOrders, readyOrders, deliveredThisMonth, expectedRevenue, ordersByStatus: Record<string, number> }`
- `GET /dashboard/orders?status=&page=` → `data: { orders: OrderSummary[], page, limit, total }`

### Try-on (auth, Phase 2)
- `POST /tryon/preview` body `{ designId, photoBase64? }`
  → 501 `FEATURE_DISABLED` while `TRYON_ENABLED=false`.
  `TRYON_PROVIDER`: `disabled` (501), `mock` (returns `/images/style-preview.svg`),
  `http` (posts to `AI_API_URL` with retries).
  When enabled: 429 `RATE_LIMITED` over `TRYON_FREE_DAILY_LIMIT` per user/day.
  When enabled: → 201 `data: { preview: { id, designId, imageUrl, createdAt, label: "Style Preview" } }`
  (label is always "Style Preview" — never "Exact Fit").

### Order notifications (internal)
- On order create, cancel, and accepted status transitions, the backend
  fire-and-forgets an outbound notification (WhatsApp message build + optional
  HTTP webhook) via `src/proxy/notification.proxy.ts`. Never blocks or fails a
  request; webhook deliveries are best-effort and logged.
  Webhook `POST` payload:
```
{ event: "order_status", orderNumber, shopName, customerName, status, totalPrice }
```

### Uploads (auth)
- `POST /uploads` multipart field `file` (jpg/png/webp ≤ 5 MB) → 201
  `data: { url: "/uploads/<uuid>.<ext>" }`. Files are stored in a **private**
  dir, never on the public static route.
- `GET /uploads/:name` (bearer) → 200 image or `404 NOT_FOUND`. Only the
  order's customer, its tailor, or an ADMIN may fetch a photo, and only if it
  is referenced by an order's `referencePhotoUrl`. `Cache-Control: private`.
- `referencePhotoUrl` values are API-relative paths (`/uploads/<name>`) that
  resolve against `/api/v1`; render them only through authenticated fetches
  (blob fetch + object URL), never a bare `<img src>`.

## Env

Backend (`backend/.env.example` → copy to `.env`, local overrides in `.env.local`):

```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://tailor:tailor_dev_password@localhost:15433/tailor
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX=300
RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=25
TRYON_ENABLED=false
TRYON_FREE_DAILY_LIMIT=5
TRYON_PROVIDER=disabled
AI_API_URL=
AI_API_KEY=
NOTIFY_WEBHOOK_URL=
MAX_UPLOAD_MB=5
```

Frontend (`frontend/.env.example`):

```
API_PROXY_TARGET=http://localhost:4000
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_APP_NAME=Tailor Platform
```
