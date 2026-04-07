import { createRequire } from 'node:module';
import { runExpressHandler } from './_lib/runExpressHandler.mjs';

const require = createRequire(import.meta.url);
const { getInventorySummary } = require('../backend/src/controllers/inventoryController');

export async function GET(request) {
  return runExpressHandler(request, getInventorySummary);
}
