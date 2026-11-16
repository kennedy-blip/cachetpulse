import { Activity, ArrowDownRight, ArrowUpRight, Clock3, Coins, Database, Gauge, Layers3, Zap } from 'lucide-react';
import type { CacheStats } from '../types';
type Props = { stats: CacheStats };
export default function AnalyticsDashboard({ stats }: Props) {
  const total = Math.max(1, stats.hits + stats.misses), hitPct = stats.hits / total * 100;
  const bars = [38, 52, 45, 67, 58, 73, 64, 82, 69, 88, 76, Math.max(12, hitPct)];
  return <section className="panel analytics">
    <div className="panel-heading"><div className="heading-icon violet"><Activity size={16}/></div><div><h2>Live analytics</h2><p>Cache performance and optimization metrics</p></div><span className="refresh-indicator"><i/> LIVE</span></div>
    <div className="metric-grid">
      <div className="metric-card"><div className="metric-label"><span>HIT RATE</span><Gauge size={14}/></div><div className="metric-value">{(stats.hitRate * 100).toFixed(1)}<small>%</small></div><div className="metric-foot positive"><ArrowUpRight size={12}/> Cache efficiency</div><div className="progress"><i style={{width:`${Math.min(100,stats.hitRate*100)}%`}}/></div></div>
      <div className="metric-card"><div className="metric-label"><span>TOKENS SAVED</span><Zap size={14}/></div><div className="metric-value">{stats.tokensSaved.toLocaleString()}</div><div className="metric-foot positive"><ArrowDownRight size={12}/> Zero-token hits</div><div className="metric-footline">~${stats.costSaved.toFixed(4)} model cost avoided</div></div>
      <div className="metric-card"><div className="metric-label"><span>AVG. LATENCY SAVED</span><Clock3 size={14}/></div><div className="metric-value">{stats.avgLatencySavedMs.toLocaleString()}<small>ms</small></div><div className="metric-foot positive"><ArrowDownRight size={12}/> Faster responses</div><div className="metric-footline">vs. simulated 1,240ms miss</div></div>
      <div className="metric-card"><div className="metric-label"><span>ACTIVE ENTRIES</span><Database size={14}/></div><div className="metric-value">{stats.entries}<small> / {stats.maxEntries}</small></div><div className="metric-foot positive"><Layers3 size={12}/> In-memory store</div><div className="progress"><i className="violet-fill" style={{width:`${Math.min(100,stats.entries/stats.maxEntries*100)}%`}}/></div></div>
    </div>
    <div className="chart-grid">
      <div className="chart-card"><div className="chart-title"><div><b>Request distribution</b><span>Cache hits vs. misses</span></div><div className="legend"><i className="legend-hit"/> Hits <i className="legend-miss"/> Misses</div></div><div className="donut-wrap"><div className="donut" style={{background:`conic-gradient(#10b981 0% ${hitPct}%, #f43f5e ${hitPct}% 100%)`}}><div><strong>{hitPct.toFixed(0)}%</strong><span>HIT RATE</span></div></div><div className="donut-legend"><div><i className="legend-hit"/><span>Cache hits</span><b>{stats.hits}</b></div><div><i className="legend-miss"/><span>Cache misses</span><b>{stats.misses}</b></div></div></div></div>
      <div className="chart-card"><div className="chart-title"><div><b>Cache efficiency trend</b><span>Relative hit activity · last 12 intervals</span></div><span className="trend-chip"><ArrowUpRight size={12}/> +{Math.max(1,Math.round(hitPct/12))}%</span></div><div className="bar-chart">{bars.map((v,i)=><div className="bar-column" key={i}><div className="bar-track"><i style={{height:`${v}%`}}/></div><span>{i%3===0 ? `T-${12-i}` : ''}</span></div>)}</div><div className="chart-foot"><span><i className="legend-hit"/> Relative cache hit activity</span><span>12 intervals</span></div></div>
    </div>
    <div className="analytics-footer"><span><Coins size={13}/> Estimated cost model: $0.003 / 1K tokens</span><span><Activity size={13}/> {stats.totalRequests.toLocaleString()} total requests processed</span></div>
  </section>;
}