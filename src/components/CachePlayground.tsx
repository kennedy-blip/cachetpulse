import { useState } from 'react';
import { ArrowUpRight, ChevronDown, Clock3, Copy, CornerDownLeft, Cpu, Loader2, Play, Sparkles, Terminal } from 'lucide-react';
import type { PlaygroundResult } from '../types';
type Props={onRun:(prompt:string,threshold:number,model:string)=>Promise<void>;result:PlaygroundResult|null;loading:boolean};
const examples=['What is semantic caching in LLM applications?','Explain the benefits of vector databases','How do I reduce latency in an AI chatbot?'];
export default function CachePlayground({onRun,result,loading}:Props){
 const[prompt,setPrompt]=useState(examples[0]);const[threshold,setThreshold]=useState(.85);const[model,setModel]=useState('gpt-4o-mini');const[copied,setCopied]=useState(false);
 const submit=()=>{if(prompt.trim()&&!loading)void onRun(prompt.trim(),threshold,model);};
 const copy=async()=>{if(!result)return;await navigator.clipboard?.writeText(result.response);setCopied(true);window.setTimeout(()=>setCopied(false),1400);};
 return <section className="panel playground"><div className="panel-heading"><div className="heading-icon cyan"><Terminal size={16}/></div><div><h2>Cache playground</h2><p>Test prompt similarity and inspect cache behavior</p></div><span className="heading-tag">INTERACTIVE</span></div>
 <div className="prompt-label"><span>INPUT PROMPT</span><span className="mono muted">{prompt.length}/4000</span></div>
 <textarea className="prompt-input" maxLength={4000} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Enter a prompt to test against your cache..." onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')submit();}}/>
 <div className="prompt-bottom"><div className="examples"><span className="muted">TRY:</span>{examples.map(x=><button key={x} onClick={()=>setPrompt(x)} title={x}>{x.length>26?x.slice(0,24)+'…':x}</button>)}</div><span className="shortcut"><kbd>⌘</kbd> + <kbd>↵</kbd></span></div>
 <div className="play-controls"><div className="control-field"><label>SIMILARITY THRESHOLD <b className="cyan-text">{threshold.toFixed(2)}</b></label><input type="range" min=".85" max=".99" step=".01" value={threshold} onChange={e=>setThreshold(Number(e.target.value))}/><div className="range-ends"><span>0.85 · Flexible</span><span>0.99 · Strict</span></div></div>
 <div className="control-field model-field"><label>MODEL TARGET</label><div className="select-wrap"><Cpu size={14}/><select value={model} onChange={e=>setModel(e.target.value)}><option value="gpt-4o-mini">GPT-4o mini</option><option value="gpt-4o">GPT-4o</option><option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option><option value="llama-3.1-70b">Llama 3.1 70B</option></select><ChevronDown size={13}/></div></div>
 <button className="btn btn-run" onClick={submit} disabled={loading||!prompt.trim()}>{loading?<Loader2 className="spin" size={16}/>:<Play size={15} fill="currentColor"/>}{loading?'Evaluating…':'Run prompt'}<CornerDownLeft size={13}/></button></div>
 {result?<div className="result-area"><div className="result-top"><div className="result-state"><span className={result.status==='hit'?'result-badge hit':'result-badge miss'}><span className="badge-dot"/>{result.status==='hit'?'CACHE HIT':'CACHE MISS'}</span><span className="result-time"><Clock3 size={13}/>{result.latencyMs.toLocaleString()}ms</span></div><span className="mono muted">KEY / {result.cacheKey}</span></div>
 <div className="result-metrics"><div><span>SIMILARITY</span><strong className="cyan-text">{(result.similarity*100).toFixed(1)}%</strong></div><div><span>TOKENS SAVED</span><strong className="green-text">{result.tokensSaved.toLocaleString()}</strong></div><div><span>MODEL</span><strong>{result.model}</strong></div><div><span>LATENCY</span><strong className={result.status==='hit'?'green-text':'amber-text'}>{result.latencyMs} ms</strong></div></div>
 <div className="response-box"><div className="response-head"><span><Sparkles size={13}/> RESPONSE PREVIEW</span><button onClick={()=>void copy()}><Copy size={12}/>{copied?'Copied':'Copy'}</button></div><p>{result.response}</p></div></div>
 :<div className="empty-result"><div className="empty-icon"><ZapIcon/></div><div><b>Awaiting prompt execution</b><span>Run a prompt to see cache matching results, latency and token savings.</span></div><ArrowUpRight size={16}/></div>}</section>;
}
function ZapIcon(){return <Sparkles size={17}/>;}
