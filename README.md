# Ubepari PC

A responsive computer storefront for Ubepari PC, built with React and Vite, an Express REST API, and PostgreSQL.

## Run locally

Requirements: Node.js 18 or later, npm, and a PostgreSQL database.

Set `DATABASE_URL` to a PostgreSQL connection string before starting the API. For local development, copy `.env.example` to `.env` and set the URL to your local PostgreSQL instance; the API loads this file automatically.

```sh
npm install
npm run dev
```

Open the Vite URL printed by the command (normally `http://localhost:5173`). The API runs on `http://localhost:4000` and is proxied through Vite at `/api`.

```sh
npm run build
npm start
```

After building, `npm start` serves both the API and the frontend on port 4000. Set `PORT` to change the API port. On first start, the app creates the catalog and demo savings-goals tables in PostgreSQL and seeds the ten example products.

## What's included

- Product catalog seeded with ten example laptops, searchable by product, brand, and category.
- Product detail views, current-price display, and savings-pace calculator.
- Demo savings goals saved to PostgreSQL, with input validation and a saved-goals drawer.
- Responsive storefront, store-location link, community section, and mobile navigation.
- WhatsApp-assisted checkout with customer contact details, Tanzania delivery address or map pin, order summary, and review links.
- Checkout name, phone, and email are remembered in the current browser only and can be cleared from the checkout form.

Catalog names, prices, specifications, availability, and photography are illustrative and should be confirmed or replaced with Ubepari PC's approved business data and assets.

## API

- `GET /api/health` checks the API.
- `GET /api/products?brand=Apple&category=workstation&search=Mac` lists matching products. All filters are optional.
- `GET /api/products/:id` returns one product.
- `GET /api/goals` lists locally saved demo goals.
- `POST /api/goals` saves a goal. JSON body: `{ "productId": "macbook-pro-m4", "months": 6, "provider": "M-Pesa", "phone": "0712345678" }`.

The savings flow is a planning demo. It does not initiate mobile-money/USSD payments, hold escrow funds, verify NIDA identities, or provide financial services. Connect a licensed payment and compliance provider before using any real-money flow.

The storefront checkout is also a handoff demo, not a payment service. It opens a pre-filled order request to Ubepari PC in WhatsApp; the customer must review and send it there. The website does not process or verify payments, publish bank/Lipa instructions, or transmit receipt files. Any selected receipt remains on the customer's device and must be attached manually in WhatsApp. The wallet-points figure is an illustrative, non-redeemable estimate. Customer name, phone, and email are stored only in browser local storage on that device; they are not sent to this app's API.

## Deploy to Railway

The Railway infrastructure definition is in `.railway/railway.ts`. It creates a managed PostgreSQL service and a storefront service connected to the GitHub `main` branch, builds with `npm run build`, starts with `npm start`, checks `/api/health`, and passes the private PostgreSQL `DATABASE_URL` to the app. Both services are configured for Railway's Singapore region. The app uses TLS for Railway PostgreSQL connections (the platform-generated database certificate is not CA-verified). The health endpoint checks database connectivity before reporting ready.

1. Push this repository to `https://github.com/emmanuelste/ubepari-pc` on the `main` branch.
2. Install the Railway CLI, authenticate with `railway login`, and create/link a Railway project from this directory with `railway init`.
3. Review the proposed resources with `railway config plan`, then apply with `railway config apply`. Authorize Railway's GitHub integration for the repository if prompted.
4. Generate a Railway public domain for the `ubepari-pc` service in the Railway dashboard (Settings → Networking → Public Networking → Generate Domain), then wait for the first deployment to pass `/api/health`.

The public Railway domain is created in the Railway workspace rather than hard-coded in this repository. Railway usage and managed PostgreSQL may incur charges depending on the workspace plan. The local `.env` files and legacy/local `data/` database files are excluded from Git. Local demo savings-goal records are not migrated to production.