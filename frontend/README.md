# Scander frontend

React, Vite, JavaScript and React Router with shared Gather Grounds CSS. Customer menu, checkout and tracking now use the Express API. Admin and kitchen interfaces retain their existing implementations.

## Run locally

```sh
cd frontend
npm ci
npm run dev
```

Use `VITE_API_BASE_URL=/api` in `.env.local` (see `.env.example`). Vite proxies `/api` to the backend on `http://127.0.0.1:5050`, allowing phones to use the same frontend origin. Start the backend separately. For deployed hosting, configure an equivalent reverse proxy or set `VITE_API_BASE_URL` to your hosted backend, with an appropriate backend CORS origin. The Vite proxy exists only during development.

```sh
npm run build
npm run preview
```

## Customer ordering

1. Scan a current database table QR (`/customer/menu?table=01&qr=<table-token>`).
2. The menu loads available Supabase records through `GET /api/menu`. Sample catalog IDs in `src/data/menu.js` are not submitted as database IDs or used as fallback results.
3. Add items, review checkout and click **Place order**.
4. `POST /api/orders` checks the table token, current menu prices, availability and quantity bounds. Supabase saves the order and items atomically. The backend calculates the total with 8% tax; payment is separate.
5. After confirmed success the cart clears and the customer sees a saved receipt. Tracking refreshes the database status every five seconds while active.

The database setup SQL in `database/customer-order-setup.sql` must be installed first. Menu/catalog records must exist in Supabase; the earlier frontend sample catalog is not automatically imported.

After a valid QR is checked with the backend, its table is remembered in the current tab. Customer links without QR parameters restore that context and validate it again. An explicitly different table number is never silently replaced. Checkout remains disabled for absent, invalid or inactive tables and explains why.

Receipt tokens stay in the current tab's sessionStorage and are sent in `X-Order-Token`, never URL parameters. Closing the tab loses access to the stored receipt. The most recent receipt for each table is retained. Do not share receipt tokens.

Pending submissions retain a request ID and receipt token for safe retries after network failures. A retry confirms the original submitted cart, even if the cart was subsequently edited. Validation errors preserve the cart for corrections. Successful saves alone clear it.

## Table QR cards

Connect laptop and phone to the same Wi-Fi and use the frontend Network URL. Export active database tables using the backend credentials:

```sh
cd backend
node scripts/export-table-qrs.js /tmp/scander-active-tables.json
cd ../frontend
npm run qr:tables -- http://YOUR-WIFI-IP:5173 8 /tmp/scander-active-tables.json
```

The exported file is private local data containing table QR tokens; do not commit it. The final JSON argument selects actual database tables, so the count argument is ignored in this mode. Open `/table-qr-codes/index.html` on the frontend origin to print the cards. SVGs and manifest are written to `public/table-qr-codes/` and are ignored by Git. Regenerate after the frontend origin changes.

The printable directory contains all table links; restrict/remove it on public production hosting and distribute printed cards to the restaurant. QR tokens identify a table, not proof that someone is physically seated there.

Without the exported file, `qr:tables` generates numbered preview cards only. Existing admin demo table QRs also browse the menu only; checkout requires a real `qr` token. Do not print old demo cards for live ordering. Rotating a table's QR token or deactivating it prevents new submissions using that code.

Deploy to a stable HTTPS frontend origin before printing permanent restaurant cards. Configure hosting to serve React routes through `index.html`.

## Structure

- `src/routes/AppRoutes.jsx`: all interface routes.
- `src/pages/customer`: database menu, cart, checkout and tracking.
- `src/services/orders.js`: customer API calls.
- `src/context/CartContext.jsx`: shared cart state (resets on reload).
- `src/utils/orderReceipt.js`: tab-scoped receipts and submission retry IDs.
- `src/utils/orderStatus.js`: status display metadata.

## Validation

Production build and backend validation tests pass. Live checks confirmed order/item persistence, database-calculated totals, duplicate retry prevention, rollback on invalid items, receipt isolation and denial of public RPC access. Browser checks cover checkout, receipt reload, real database status polling, mobile overflow and blocking demo QR submissions. Test-created orders were removed afterward.

Kitchen staff UI/API wiring, payment processing and a durable customer receipt recovery flow remain separate work. The current polling reads `customer_order.status`; kitchen updates must maintain that field.
