# Scander backend

## First customer milestone: read the menu

The endpoint `GET /api/menu` follows the existing structure:

1. `src/routes/menu.js` registers the public GET route.
2. `src/controllers/menu.js` validates the configured restaurant and sends HTTP responses.
3. `src/services/menu.js` queries Supabase using the publishable client and maps database fields to the frontend card format.

Staff authentication remains at `/auth`; this change does not rename existing authentication routes.

## Configure locally

From the repository root:

```sh
cd backend
npm ci
```

If `backend/.env` does not exist, copy `.env.example` to `.env`. If it already exists, add only missing variables; do not overwrite working credentials.

Set:

- `SUPABASE_URL`: your project URL.
- `SUPABASE_PUBLISHABLE_KEY`: the project's publishable API key.
- `SUPABASE_SECRET_KEY`: the server-only key used by the existing staff-auth module. Never put this in a frontend variable or commit it.
- `RESTAURANT_ID`: the ID of Gather Grounds from the `restaurant` table.
- `FRONTEND_URL`: the exact Vite origin, including its port.
- `PORT=5000` and `NODE_ENV=development`.

Find the restaurant ID using Supabase SQL Editor:

```sql
select restaurant_id, name, is_active from public.restaurant;
```

The endpoint expects the table and column names in `database/scehma_v1.1.sql`, and its public-read grants and RLS policies. Do not rerun that installation script on an existing database. This step makes no database changes.

## Run and check

```sh
node test_supabase.js
npm run dev
```

In another terminal:

```sh
curl -i http://localhost:5000/health
curl -i http://localhost:5000/api/menu
```

Successful response shape:

```json
{
  "data": {
    "restaurant": { "id": 1, "name": "Gather Grounds" },
    "categories": [{ "id": 1, "name": "Coffee" }],
    "items": [{ "id": 1, "categoryId": 1, "category": "Coffee", "name": "Latte", "description": "", "price": 2.95, "image": "/images/menu/iced-latte.jpg" }]
  }
}
```

IDs above are examples. An empty `items` array means no visible menu items are available yet; the hardcoded frontend catalog is not automatically copied into the database.

- `503` configuration message: supply a valid positive `RESTAURANT_ID`.
- `404`: the configured restaurant is missing, inactive, or hidden by RLS.
- `503` menu-unavailable message: inspect the backend log and database configuration; clients are not sent internal database details.

This first endpoint uses Supabase's default result limit; paginate before supporting a catalog larger than the project's API row limit.

## Automated checks

```sh
node --test tests/menu.test.js
```

These mock database HTTP responses and test mapping, restaurant scoping, public-key usage, missing/empty data, and failure handling. They do not confirm a live database connection.

## Next step

Verify the live endpoint first. Then add `frontend/src/services/menu.js` using the existing `apiRequest('menu')` helper and consume `response.data` in the customer page with loading, error, and empty states. Keep the frontend design. Do not replace database results with sample menu data on request failures.

## Customer order submission (now connected)

Use port 5050 to avoid the local macOS/Docker port conflicts. Install `database/customer-order-setup.sql` once in the existing Scander database; it adds nullable columns for new order receipts/idempotency and a server-only transactional function. Existing orders remain unchanged. This setup was verified on the live database.

Endpoints:

- `GET /api/orders/table/:token` resolves an active table belonging to the configured restaurant.
- `POST /api/orders` accepts `{ tableToken, requestId, receiptToken, items: [{ itemId, quantity, priceCents }], instructions }`. IDs and tokens are validated. Prices are checked against locked database records; totals come from the database, including 8% tax.
- `GET /api/orders/:id` requires `X-Order-Token` and returns that receipt's order only. No customer status-update endpoint is exposed.

`scander_submit_order` uses SECURITY INVOKER, an empty search path and an explicit EXECUTE grant for service_role only. No privileged key is shipped to the frontend. The request ID is unique per restaurant, serialized during submission, and tied to a payload fingerprint and hashed receipt token. Retrying a completed request returns the same order. A failed insert rolls back the order and all items. In-memory submission limiting allows ten attempts per client IP per minute; production deployments must configure trusted proxies carefully and use shared rate limiting if multiple backend instances run.

The customer menu now uses database IDs. Do not substitute sample frontend menu IDs. To print real table QRs, run `node scripts/export-table-qrs.js /tmp/scander-active-tables.json` here, then use the frontend QR generator with that file. Old numbered demo QRs do not authorize submissions.

Run all local checks with `node --test tests/*.test.js`. `scripts/verify-order-connection.js` performs an optional **live** integration check using the exported table file: it creates a marked test order, checks retries/receipt access/rollback/public RPC denial, then deletes only its own temporary records. Do not run it as a routine production startup check.

Customer tracking polls `customer_order.status`. Kitchen and admin order APIs still need implementation by the relevant developers; this change does not make their sample UI records live. Payment collection is not included.
