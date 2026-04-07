'use strict';

const app = require('./src/app');
const { PORT } = require('./src/config/serverConfig');

// ── Start Server ─────────────────────────────────────────────────────────────
// All Express configuration lives in src/app.js
// This file is solely responsible for binding the server to a port.

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Test route:  GET http://localhost:${PORT}/`);
  console.log(`Search API:  GET http://localhost:${PORT}/search`);
});
