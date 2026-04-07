'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');

const { PORT, ENV } = require('./config/serverConfig');
const connectDB = require('./config/db');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// ── Middleware ──────────────────────────────────────────────────────────────

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// ── Health / Test Route ─────────────────────────────────────────────────────
// Registered before express.static so it returns JSON, not index.html

app.get('/', (req, res) => {
  res.json({
    message: 'Backend is running',
    environment: ENV,
    timestamp: new Date().toISOString(),
  });
});

const supplierRoutes = require('./routes/supplierRoutes');
const { searchInventory } = require('./controllers/inventoryController');

// ── API Routes ──────────────────────────────────────────────────────────────

app.use('/supplier', supplierRoutes);
app.use('/inventory', inventoryRoutes);
app.get('/search', searchInventory);

// ── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Start Server ─────────────────────────────────────────────────────────────
// src/app.js is the single entry point — no need for a separate root app.js

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Test route:  GET http://localhost:${PORT}/`);
  console.log(`Search API:  GET http://localhost:${PORT}/search`);
});

module.exports = app;
