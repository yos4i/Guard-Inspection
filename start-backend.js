import { serve } from '@hono/node-server';
import honoApp from './backend/hono.ts';

const port = 3000;

console.log(`Starting backend server on port ${port}...`);

serve({
  fetch: honoApp.fetch,
  port,
}, (info) => {
  console.log(`Backend server is running on http://localhost:${info.port}`);
});
