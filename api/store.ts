export type CacheEntry = {
  key: string; prompt: string; normalized: string; response: string; model: string;
  tokens: number; createdAt: number; expiresAt: number; hits: number;
};
type Store = {
  entries: Map<string, CacheEntry>; hits: number; misses: number; tokensSaved: number; costSaved: number;
  totalRequests: number; totalLatencySaved: number; ttlMs: number; maxEntries: number; algorithm: 'semantic' | 'exact';
};
const seed = [
  { prompt: 'What is semantic caching in LLM applications?', response: 'Semantic caching stores answers to prompts and reuses them for identical or sufficiently similar future questions, reducing repeated model calls, cost, and latency.' },
  { prompt: 'Explain the benefits of vector databases', response: 'Vector databases index embeddings and enable similarity search across unstructured data. They are commonly used for retrieval-augmented generation, recommendations, and semantic search.' },
  { prompt: 'How do I reduce latency in an AI chatbot?', response: 'Reduce chatbot latency with prompt and response caching, streaming, smaller models for simple tasks, parallel retrieval, connection reuse, and efficient context windows.' }
];
const globalStore = globalThis as typeof globalThis & { __cachePulseStore?: Store };
function normalize(prompt: string) { return prompt.toLowerCase().normalize('NFKC').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
export function hash(value: string) { let h = 2166136261; for (let i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);} return (h>>>0).toString(16).padStart(8,'0'); }
export function makeEntry(prompt: string,response: string,model: string,ttlMs: number): CacheEntry {
  const normalized=normalize(prompt); return {key:hash(normalized),prompt,normalized,response,model,tokens:Math.max(8,Math.ceil(prompt.length/4)+Math.ceil(response.length/4)),createdAt:Date.now(),expiresAt:Date.now()+ttlMs,hits:0};
}
function similarity(a:string,b:string) {
  if(a===b)return 1; const grams=(s:string)=>{const p=`  ${s}  `;const set=new Set<string>();for(let i=0;i<p.length-2;i++)set.add(p.slice(i,i+3));return set;};
  const aa=grams(a),bb=grams(b);let overlap=0;aa.forEach(g=>{if(bb.has(g))overlap++;});return aa.size+bb.size?(2*overlap)/(aa.size+bb.size):0;
}
export function getStore(): Store {
  if(!globalStore.__cachePulseStore){const store:Store={entries:new Map(),hits:84,misses:16,tokensSaved:12840,costSaved:.03852,totalRequests:100,totalLatencySaved:104832,ttlMs:3600000,maxEntries:500,algorithm:'semantic'};
    seed.forEach(item=>{const entry=makeEntry(item.prompt,item.response,'gpt-4o-mini',store.ttlMs);store.entries.set(entry.key,entry);});globalStore.__cachePulseStore=store;}
  return globalStore.__cachePulseStore;
}
export function purgeExpired(store:Store){const now=Date.now();for(const [key,entry] of store.entries)if(entry.expiresAt<=now)store.entries.delete(key);}
export function findMatch(store:Store,prompt:string,threshold:number){
  const normalized=normalize(prompt);if(!normalized)return null;purgeExpired(store);let best:{entry:CacheEntry;score:number}|null=null;
  for(const entry of store.entries.values()){const score=store.algorithm==='exact'?(entry.normalized===normalized?1:0):similarity(normalized,entry.normalized);if(!best||score>best.score)best={entry,score};}
  return best&&best.score>=threshold?best:null;
}
export function stats(store:Store){purgeExpired(store);const requests=store.hits+store.misses;return{hits:store.hits,misses:store.misses,totalRequests:requests,hitRate:requests?store.hits/requests:0,tokensSaved:store.tokensSaved,costSaved:Number(store.costSaved.toFixed(5)),avgLatencySavedMs:store.hits?Math.round(store.totalLatencySaved/store.hits):0,entries:store.entries.size,ttlMs:store.ttlMs,maxEntries:store.maxEntries,algorithm:store.algorithm};}
export function clearStore(store:Store){store.entries.clear();store.hits=0;store.misses=0;store.tokensSaved=0;store.costSaved=0;store.totalRequests=0;store.totalLatencySaved=0;}
