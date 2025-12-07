import { serve } from '@hono/node-server';
import app from '../backend/hono';

export default async function handler(req: Request) {
  return app.fetch(req);
}
