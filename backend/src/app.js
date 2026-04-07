'use strict';

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { PORT, ENV } = require('./config/serverConfig');
const connectDB = require('./config/db');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');
const hasFrontendBuild = fs.existsSync(frontendIndexPath);

// Connect to MongoDB
connectDB().catch((error) => {
  console.error(`Database bootstrap error: ${error.message}`);
});

// ── Middleware ──────────────────────────────────────────────────────────────

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// ── Health Route ────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
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

if (ENV === 'production' && hasFrontendBuild) {
  app.use(express.static(frontendDistPath));
}

// ── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  const isApiRoute = ['/api', '/supplier', '/inventory', '/search'].some((prefix) => (
    req.path === prefix || req.path.startsWith(`${prefix}/`)
  ));
  const acceptsHtml = (req.headers.accept || '').includes('text/html');

  if (ENV === 'production' && hasFrontendBuild && req.method === 'GET' && !isApiRoute && acceptsHtml) {
    return res.sendFile(frontendIndexPath);
  }

  if (!isApiRoute) {
    return res.status(404).send(`Route ${req.method} ${req.originalUrl} not found`);
  }

  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// ── Start Server ─────────────────────────────────────────────────────────────

function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Health API:   GET http://localhost:${PORT}/api/health`);
    console.log(`Search API:  GET http://localhost:${PORT}/search`);

    if (ENV === 'production' && hasFrontendBuild) {
      console.log(`Frontend:    serving ${frontendDistPath}`);
    }
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
