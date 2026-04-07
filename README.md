# Inventory Search Project

A full-stack surplus inventory search system built with **Node.js + Express** on the backend and **React + Vite** on the frontend. Buyers can search and filter products by name, category, and price range in real time.

---

## Project Structure

```
ZerostockAssignment/
├── backend/
│   ├── app.js                         ← Server entry point
│   ├── package.json
│   └── src/
│       ├── app.js                     ← Express app (middleware, routes, server start)
│       ├── config/
│       │   └── serverConfig.js        ← PORT and environment config
│       ├── controllers/
│       │   └── inventoryController.js ← Filtering logic for GET /search
│       ├── data/
│       │   └── inventory.js           ← 15 in-memory product records
│       └── routes/
│           └── inventoryRoutes.js     ← Route definitions
└── frontend/
    ├── vite.config.js                 ← Vite config + /search proxy to backend
    └── src/
        ├── App.jsx                    ← Root layout
        ├── main.jsx                   ← React entry point
        ├── index.css                  ← Global design system
        ├── context/
        │   └── SearchContext.jsx      ← Global state via Context API + useSearch()
        └── components/
            ├── Navbar.jsx
            ├── SearchForm.jsx         ← Controlled form with all filter inputs
            └── ResultsTable.jsx       ← Renders table, loading, error, empty states
```

---

## Getting Started

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev       # nodemon src/app.js — auto-restarts on file changes
```

The Express API runs at **http://localhost:3000**.

Available scripts:

| Script | Command | Description |
|---|---|---|
| `npm start` | `node src/app.js` | Production server |
| `npm run dev` | `nodemon src/app.js` | Development with auto-restart |

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev       # Vite dev server on http://localhost:5173
```

Vite proxies all `/search` requests to `http://localhost:3000` — no CORS configuration needed.

---

## API Reference

### `GET /search`

Returns a JSON array of matching inventory items. All parameters are optional.

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Partial, case-insensitive product name match |
| `category` | string | Exact category match (case-insensitive) |
| `minPrice` | number | Items with `price >= minPrice` |
| `maxPrice` | number | Items with `price <= maxPrice` |

**Example requests:**

```
GET /search
GET /search?q=chair
GET /search?category=Electronics
GET /search?minPrice=50&maxPrice=200
GET /search?q=desk&category=Furniture&minPrice=100&maxPrice=400
```

**Error response (invalid price range):**

```json
HTTP 400
{ "message": "Invalid price range" }
```

**No matches:**

```json
HTTP 200
[]
```

---

## How Search Filtering Works

Filtering is handled in `backend/src/controllers/inventoryController.js`. All filters are **optional** and applied **sequentially** — each step narrows the result set from the previous one. An item must satisfy every active condition to appear in the final output.

```
Start: all 15 inventory items
  │
  ▼
Step 1 → Filter by name (q)         if q is provided
  │
  ▼
Step 2 → Filter by category         if category is provided
  │
  ▼
Step 3 → Filter by minPrice         if minPrice is provided
  │
  ▼
Step 4 → Filter by maxPrice         if maxPrice is provided
  │
  ▼
Return: filtered results as JSON ([] if nothing matched)
```

Missing parameters are simply skipped — the pipeline continues with whatever items remain.

---

## How Case-Insensitive Search Is Implemented

Product name search (`q`) is case-insensitive. Both the user's query and the item's `productName` are converted to lowercase using `.toLowerCase()` before comparison:

```js
// inventoryController.js — Step 1
if (q && q.trim() !== '') {
  const searchTerm = q.trim().toLowerCase();
  results = results.filter(item =>
    item.productName.toLowerCase().includes(searchTerm)
  );
}
```

This means `"CHAIR"`, `"chair"`, and `"Chair"` all return the same records — the comparison is purely lowercase on both sides so original casing in the data is irrelevant.

---

## Performance Improvement

The current approach uses `Array.filter()` over 15 in-memory records, which is instant at this scale. For a production system with tens of thousands of inventory items, two improvements would make the biggest difference:

### 1. Database Full-Text Search Indexing

Replace the in-memory array with a database (PostgreSQL or MongoDB) and create a **full-text search index** on the `productName` field.

**PostgreSQL example:**

```sql
-- Create a GIN index for fast full-text search
CREATE INDEX idx_product_name_fts
  ON inventory
  USING GIN (to_tsvector('english', "productName"));

-- Query using the index instead of a full table scan
SELECT * FROM inventory
WHERE to_tsvector('english', "productName") @@ plainto_tsquery('english', 'chair');
```

Without an index, a `LIKE '%chair%'` query scans every row. With a GIN index, the engine jumps directly to matching documents — dramatically faster at scale.

### 2. Pagination

Instead of returning all matching items in one response, limit results per page using `limit` and `offset` (SQL) or Mongoose `.skip().limit()`:

```js
// Backend: add page & limit query params
const page  = Number(req.query.page)  || 1;
const limit = Number(req.query.limit) || 20;
const offset = (page - 1) * limit;

// SQL equivalent
SELECT * FROM inventory WHERE ... LIMIT 20 OFFSET 0;
```

```js
// Frontend: respond to scroll or "Load more" button
fetch(`/search?q=desk&page=2&limit=20`)
```

This reduces payload size and memory usage dramatically — instead of sending 10,000 rows at once, only 20 are sent per request.

---

## Frontend Architecture

The React frontend uses the **Context API** for global search state instead of prop drilling.

```
SearchProvider (SearchContext.jsx)
│   state: results, loading, error, searched
│   action: runSearch(filters) → fetch /search → update state
│
├── SearchForm.jsx
│   Local state: filters (q, category, minPrice, maxPrice)
│   On submit: calls runSearch(filters) from context
│
└── ResultsTable.jsx
    Reads: results, loading, error, searched from context
    Renders: spinner | error | "No results found" | table
```
