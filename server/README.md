# NexShop API (dev)

A tiny Express server to serve product data during frontend development.

Requirements

- Node.js 18+ recommended

Install

```bash
cd server
npm install
```

Run

```bash
# dev (auto-reload)
npm run dev

# production
npm start
```

Endpoints

- GET /api/health → { status: 'ok' }
- GET /api/products → Array of product objects (same shape as `data/products.json`)
- GET /api/products/:id → Single product by id

Notes

- The server serves the project root statically by default (for local testing) — adjust `index.js` if you want to serve frontend differently.
- For integration, update frontend fetch calls from `data/products.json` to `/api/products` and add a fallback to the static data file if offline.
