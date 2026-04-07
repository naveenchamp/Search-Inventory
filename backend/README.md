# Inventory Management API

A production-ready REST API backend for an inventory management system using **Node.js, Express, and MongoDB Atlas (via Mongoose)**.

It uses an MVC architectural pattern mapping Suppliers (1) to Inventory Items (N) using MongoDB relational `ObjectIds`, with rich aggregation features and strict data validation boundaries.

---

## Getting Started

### 1. Configure MongoDB Atlas
Open the `backend/.env` file. You will see a placeholder for `MONGO_URI`.
Replace it with your actual MongoDB Atlas connection string.

```env
MONGO_URI="mongodb+srv://yourUser:yourPass@cluster0.abcde.mongodb.net/surplus?retryWrites=true&w=majority"
PORT=3000
NODE_ENV=development
```

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

### 3. (Optional) Seed the Database in Development
For development, you can populate test Suppliers and Inventory items instantly.

```bash
cd backend
npm run seed
```
*(Warning: This will clear the existing collections before seeding).*

---

## API Endpoints Reference

### Suppliers

#### `POST /supplier`
Create a new supplier.
- **Body Requirement:** `{ "name": "String", "city": "String" }`
- **Response:** `201 Created` with the full Supplier object (including `_id`).

---

### Inventory

#### `POST /inventory`
Create a new inventory item mapping directly to a Supplier.
- **Body Requirement:**
  ```json
  {
    "supplier": "ObjectId (must exist in Suppliers)",
    "productName": "String",
    "category": "String",
    "quantity": "Number (Must be >= 0)",
    "price": "Number (Must be > 0)"
  }
  ```
- **Validation:** Will return a `400 Bad Request` explaining exact schema validation failures if quantity is negative, price is 0, or supplier doesn't exist.

#### `GET /inventory`
Fetch all inventory items.
- Eagerly populates the referenced `supplier` document inside the JSON payload, making it easy for the frontend to show `item.supplier.name`.

#### `GET /inventory/summary`
Calculates high-level portfolio metrics. Grouped by supplier, it runs a powerful MongoDB Aggregation pipeline to do the heavy lifting at the database layer.
- Computes `totalItems` count.
- Computes `totalValue` by multiplying `price * quantity` simultaneously per item.
- Uses `$lookup` to join the real Supplier name and city.
- Returns the results sorted by `totalValue` descending.

#### `GET /search`
A dynamic inventory search engine exactly as previously configured, returning items directly populated with suppliers.
- **Query Params:** `q` (Name regex), `category`, `minPrice` (`$gte`), `maxPrice` (`$lte`).

---

## Architecture & Design Decisions

### Why MongoDB?
MongoDB was chosen for several specific cloud-native advantages:
1. **Serverless Deployment Safety:** Unlike SQLite (`.db` files), MongoDB allows easy deployment to Ephemeral functions (like AWS Lambda or Vercel edge networks) since the data connection string is just an environment variable routing to Atlas.
2. **Flexible Schema Upgrades:** Document structures expand gracefully without extensive DDL migrations.
3. **Powerful Aggregation:** The `$group`, `$lookup`, and `$sum` mathematics shown in the `/inventory/summary` endpoint are deeply optimized natively in MongoDB (C++ code), taking memory load entirely off the Node.js server.

### Relationships (`ObjectId`)
Rather than redundantly typing "ABC Traders" 10,000 times into strings (denormalization), we implemented **normalization**. The Inventory Schema requires a strict `supplier: mongoose.Schema.Types.ObjectId`. This preserves absolute data integrity. If "ABC Traders" changes their name later, it instantly updates across all inventory globally.

### Performance Optimization Ideas
To optimize this application at scale (1,000,000+ items):
We highly recommend creating indexes inside MongoDB. 
- **Indexing Foreign Keys:** A Compound Index matching `{ supplier: 1 }` allows the `/inventory/summary` aggregation to instantly lookup joins.
- **Indexing Queries:** A `{ price: 1 }` index allows the `$gte` and `$lte` bounds resolving in `GET /search` to process sequentially without performing full-collection scans.
