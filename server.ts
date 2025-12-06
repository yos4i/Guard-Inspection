import { serve } from '@hono/node-server';
import app from './backend/hono';

const port = 3000;

console.log(`🚀 Backend server starting on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Backend server running on http://localhost:${port}`);
console.log(`📡 tRPC endpoint: http://localhost:${port}/trpc`);
