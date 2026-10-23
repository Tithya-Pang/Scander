# Scander frontend

React + Vite + JavaScript + React Router. Existing shared CSS provides the Gather Grounds green palette; Tailwind is not required for this foundation.

## Run locally

From the repository root:

```sh
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173; it chooses another port if occupied).

```sh
npm run build
npm run preview
```

## Structure

- `src/main.jsx`: the single React entry and BrowserRouter provider.
- `src/App.jsx`: application root.
- `src/routes/AppRoutes.jsx`: customer, admin, kitchen and staff login routes.
- `src/pages/{customer,admin,kitchen,auth}`: interface pages.
- `src/components`: reusable layout, common UI and feature components.
- `src/styles`: shared variables, global rules and interface styles.
- `src/services/api.js`: fetch wrapper for the future Express REST API.

Existing `/customer/*`, `/admin/*` and `/kitchen/*` routes remain available. `/menu`, `/cart` and `/orders` redirect to their customer equivalents, preserving query parameters and fragments. Customer navigation preserves query parameters such as `?table=04`; table identity is not yet validated.

## API configuration

`.env.example` defines `VITE_API_BASE_URL=http://localhost:5000/api`. Copy it to `.env.local` and restart Vite after changes. Only public client configuration belongs in `VITE_*` variables.

Feature services can call `apiRequest('menu')` or `apiRequest('orders', { method: 'POST', body: order })`. The wrapper serializes JSON, throws on HTTP failures (with `error.status`), and supports empty/204 responses. Pages do not call it yet. The future Express server must allow the frontend origin through its CORS configuration.

## Current limitations and next work

Pages use sample data or placeholders. The login form validates required email/password fields locally and reports that authentication is unconnected; it does not send or store credentials. Admin and kitchen routes remain public previews.

Keep role-specific routes grouped under their existing layout routes when adding an authenticated account provider and role guards. Account roles must come from verified authentication, and the backend must enforce authorization independently of frontend routing.

Next: implement authenticated accounts and backend authorization, then connect menu data, shared cart state, order submission and kitchen updates incrementally. No backend or database setup is included here.

## Foundation validation

Dependency installation and the production build passed. All 15 content routes were rendered with React server rendering in a temporary in-memory check, including table-query retention in customer navigation. Vite started and returned the application HTML over HTTP. Browser interaction and responsive visual checks still need manual verification.

The temporary Vite SSR check encountered a CommonJS interoperability issue with React Router, so the render check used an in-memory esbuild bundle instead. This application uses browser rendering and does not configure SSR.

## Customer interface update

The customer menu now follows the supplied three-column reference: table/navigation sidebar, searchable category menu, and order panel. Use `/customer/menu?table=12` to preview the table context shown in the reference. Without a table URL parameter, the page asks the customer to scan their table QR.

`src/context/CartContext.jsx` shares cart quantities and kitchen instructions across customer routes. Cart state lasts while navigating within the customer workspace; reloads reset it. The displayed 8% tax is a preview assumption copied from the reference, pending restaurant configuration. Checkout provides a review only, with no order submission or payment. Category filters with no matching preview products display an empty state.

Browser verification passed for all six local photos, category/search filters, quantity controls, calculated totals, notes, clear cart, checkout navigation, query parameter retention, mobile overflow, and admin/kitchen/login routes. Desktop (1600px) and mobile (390px) screenshots were visually inspected. No application dependencies were added.
