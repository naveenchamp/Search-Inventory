import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const connectDB = require('../../backend/src/config/db');

async function parseBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return {};
  }

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const rawBody = await request.text();
    return rawBody ? JSON.parse(rawBody) : {};
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(await request.text()));
  }

  return await request.text();
}

function createResponseAdapter() {
  let statusCode = 200;
  const headers = new Headers();
  let payload;

  const res = {
    status(code) {
      statusCode = code;
      return res;
    },
    json(value) {
      payload = JSON.stringify(value);
      headers.set('content-type', 'application/json; charset=utf-8');
      return res;
    },
    send(value) {
      if (value !== null && typeof value === 'object' && !(value instanceof Uint8Array)) {
        return res.json(value);
      }

      payload = value == null ? '' : String(value);
      if (!headers.has('content-type')) {
        headers.set('content-type', 'text/plain; charset=utf-8');
      }

      return res;
    },
    end(value = '') {
      if (payload === undefined) {
        res.send(value);
      }
      return res;
    },
    set(name, value) {
      headers.set(name, value);
      return res;
    },
    setHeader(name, value) {
      headers.set(name, value);
    },
    getHeader(name) {
      return headers.get(name);
    },
  };

  return {
    res,
    toResponse() {
      if (payload === undefined) {
        return new Response(null, { status: statusCode, headers });
      }

      return new Response(payload, { status: statusCode, headers });
    },
  };
}

export async function runExpressHandler(request, handler) {
  try {
    await connectDB();
  } catch (error) {
    return Response.json({ message: 'Database connection failed' }, { status: 500 });
  }

  const url = new URL(request.url);
  let body = {};

  try {
    body = await parseBody(request);
  } catch {
    return Response.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const req = {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    query: Object.fromEntries(url.searchParams.entries()),
    body,
    params: {},
    path: url.pathname,
    originalUrl: `${url.pathname}${url.search}`,
  };

  const { res, toResponse } = createResponseAdapter();

  try {
    await handler(req, res);
    return toResponse();
  } catch (error) {
    console.error('Vercel handler bridge error:', error);
    return Response.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
