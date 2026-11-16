import { getStore, clearStore, stats } from './store';
export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
  const store = getStore();
  clearStore(store);
  return new Response(JSON.stringify({ ok: true, message: 'Cache cleared', stats: stats(store) }), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}