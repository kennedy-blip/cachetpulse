import { Activity, Flame, RefreshCw, Zap } from 'lucide-react';
import type { CacheStats } from '../types';
type Props = { stats: CacheStats; onClear: () => void; onBurst: () => void; busy?: boolean };
export default function CacheHeader({stats,onClear,onBurst,busy}:Props){return <header className="topbar">
  <div className="brand"><div className="brand-mark"><Activity size={19}/></div><div><div className="brand-name">cache<span>pulse</span></div><div className="brand-caption">LLM CACHE WORKBENCH <i>•</i> v1.0.0</div></div></div>
  <div className="top-status"><span className="live-dot"/><span>ENGINE ACTIVE</span><span className="status-divider"/><span className="muted">HIT RATE</span><strong>{(stats.hitRate*100).toFixed(1)}%</strong></div>
  <div className="top-actions"><div className="saved-chip"><Zap size={14}/><span><b>${stats.costSaved.toFixed(4)}</b> saved</span></div><button className="btn btn-ghost" onClick={onClear} disabled={busy}><RefreshCw size={14}/> Flush cache</button><button className="btn btn-primary" onClick={onBurst} disabled={busy}><Flame size={14}/> Traffic burst</button></div>
</header>;}