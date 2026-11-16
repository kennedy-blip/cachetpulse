import type { CacheResult, CacheStats } from '../types';
const initial: CacheStats = { hits: 84, misses: 16, totalRequests: 100, hitRate: .84, tokensSaved: 12840, costSaved: .03852, avgLatencySavedMs: 1248, entries: 3, ttlMs: 3600000, maxEntries: 500, algorithm: 'semantic' };
let localStats = { ...initial };
const localCache = new Map<string, { response: string; tokens: number; prompt: string }>([
  ['what is semantic caching in llm applications', { prompt: 'What is semantic caching in LLM applications?', response: 'Semantic caching stores answers to prompts and reuses them for identical or sufficiently similar future questions, reducing repeated model calls, cost, and latency.', tokens: 58 }],
  ['explain the benefits of vector databases', { prompt: 'Explain the benefits of vector databases', response: 'Vector databases index embeddings and enable similarity search across unstructured data. They are commonly used for retrieval-augmented generation, recommendations, and semantic search.', tokens: 52 }]
]);
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
function similarity(a: string, b: string) {
  const wordsA = new Set(normalize(a).split(' ')), wordsB = new Set(normalize(b).split(' '));
  const intersection = [...wordsA].filter(x => wordsB.has(x)).length;
  return intersection / Math.max(1, new Set([...wordsA, ...wordsB]).size);
}
export async function getStats(): Promise<CacheStats> {
  try { const r = await fetch('/api/cache'); if (!r.ok) throw new Error(); const d = await r.json(); if (d.stats) return d.stats as CacheStats; } catch { /* local preview fallback */ }
  return { ...localStats };
}
export async function runPrompt(prompt: string, model: string, threshold: number, config?: { ttlMs: number; maxEntries: number; algorithm: 'semantic' | 'exact' }): Promise<{ result: CacheResult; stats: CacheStats }> {
  try {
    const r = await fetch('/api/cache', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt, model, threshold, ...config }) });
    if (!r.ok) throw new Error('API unavailable');
    const data = await r.json(); if (data.result && data.stats) return data;
  } catch { /* use browser-local demo cache */ }
  const started = performance.now(), normalized = normalize(prompt);
  let best: { key: string; value: { response: string; tokens: number; prompt: string }; score: number } | undefined;
  for (const [key, value] of localCache) {
    const score = config?.algorithm === 'exact' ? (normalize(value.prompt) === normalized ? 1 : 0) : similarity(prompt, value.prompt);
    if (!best || score > best.score) best = { key, value, score };
  }
  const isHit = !!best && best.score >= threshold;
  const response = isHit ? best!.value.response : `Demo response: ${prompt} — this is a locally simulated model completion. Deploy with Vercel Functions to use the server-side demo cache.`;
  const tokens = Math.max(12, Math.ceil(prompt.length / 3.7) + 72);
  const result: CacheResult = { status: isHit ? 'hit' : 'miss', response, latencyMs: isHit ? Math.max(2, Math.round(performance.now() - started)) : 1240, tokensSaved: isHit ? best!.value.tokens : 0, tokensUsed: isHit ? undefined : tokens, similarity: isHit ? best!.score : 0, cacheKey: isHit ? best!.key : btoa(normalized).slice(0, 8), model };
  if (!isHit) localCache.set(normalized, { prompt, response, tokens });
  localStats = { ...localStats, hits: localStats.hits + (isHit ? 1 : 0), misses: localStats.misses + (isHit ? 0 : 1), totalRequests: localStats.totalRequests + 1, tokensSaved: localStats.tokensSaved + result.tokensSaved, costSaved: localStats.costSaved + result.tokensSaved * .000003, entries: localCache.size };
  localStats.hitRate = localStats.hits / Math.max(1, localStats.totalRequests);
  return { result, stats: localStats };
}
export async function clearCache() {
  try { const r = await fetch('/api/clear', { method: 'POST' }); if (!r.ok) throw new Error(); const d = await r.json(); if (d.stats) { localStats = d.stats; return localStats; } } catch { /* local fallback */ }
  localCache.clear(); localStats = { ...localStats, hits: 0, misses: 0, totalRequests: 0, hitRate: 0, tokensSaved: 0, costSaved: 0, entries: 0 }; return localStats;
}