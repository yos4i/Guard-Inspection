import honoApp from '@/backend/hono';

// Helper to rewrite URL from /api/* to /*
function rewriteUrl(request: Request): Request {
  const url = new URL(request.url);
  // Remove /api from the path
  url.pathname = url.pathname.replace(/^\/api/, '');
  console.log('[API Route] Original URL:', request.url);
  console.log('[API Route] Rewritten URL:', url.toString());
  console.log('[API Route] Method:', request.method);
  return new Request(url, request);
}

export async function GET(request: Request) {
  console.log('[API Route] GET called');
  try {
    const response = await honoApp.fetch(rewriteUrl(request));
    console.log('[API Route] Response status:', response.status);
    return response;
  } catch (error) {
    console.error('[API Route] Error:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  console.log('[API Route] POST called');
  try {
    const response = await honoApp.fetch(rewriteUrl(request));
    console.log('[API Route] Response status:', response.status);
    return response;
  } catch (error) {
    console.error('[API Route] Error:', error);
    throw error;
  }
}

export async function PUT(request: Request) {
  return honoApp.fetch(rewriteUrl(request));
}

export async function DELETE(request: Request) {
  return honoApp.fetch(rewriteUrl(request));
}

export async function PATCH(request: Request) {
  return honoApp.fetch(rewriteUrl(request));
}
