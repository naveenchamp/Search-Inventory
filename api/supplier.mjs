import { createRequire } from 'node:module';
import { runExpressHandler } from './_lib/runExpressHandler.mjs';

const require = createRequire(import.meta.url);
const { createSupplier } = require('../backend/src/controllers/supplierController');

export async function POST(request) {
  return runExpressHandler(request, createSupplier);
}
