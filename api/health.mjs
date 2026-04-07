export function GET() {
  return Response.json({
    message: 'Backend is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
}
