import { serve } from '@hono/node-server';
import app from './backend/hono';

// Use PORT from environment (Render, Railway, etc.) or default to 3000
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`🚀 Backend server starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ Backend server running on port ${port}`);
console.log(`📡 tRPC endpoint available at /trpc`);
