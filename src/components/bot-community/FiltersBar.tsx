'use client';
import * as React from 'react';

export type Filters = {
  q: string;
  strategy: string;       // '' means all
  tag: string;            // '' means all
  minROI?: number;
  minWinrate?: number;
  sort: 'updated' | 'roi' | 'winrate' | 'drawdown' | 'downloads' | 'likes';
};

export default function FiltersBar({ value, onChange, strategies, tags }: {
  value: Filters;
  onChange: (next: Filters) => void;
  strategies: string[];
  tags: string[];
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <input
        className="px-3 py-2 rounded-md border w-56"
        placeholder="Search community bots…"
        value={value.q}
        onChange={e => set({ q: e.target.value })}
      />
      <select className="px-2 py-2 rounded-md border" value={value.strategy} onChange={e => set({ strategy: e.target.value })}>
        <option value="">All strategies</option>
        {strategies.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="px-2 py-2 rounded-md border" value={value.tag} onChange={e => set({ tag: e.target.value })}>
        <option value="">All tags</option>
        {tags.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <input className="px-2 py-2 rounded-md border w-28" type="number" step="0.1" placeholder="Min ROI %" value={value.minROI ?? ''} onChange={e => set({ minROI: e.target.value === '' ? undefined : Number(e.target.value) })} />
      <input className="px-2 py-2 rounded-md border w-32" type="number" step="0.1" placeholder="Min Winrate %" value={value.minWinrate ?? ''} onChange={e => set({ minWinrate: e.target.value === '' ? undefined : Number(e.target.value) })} />
      <select className="px-2 py-2 rounded-md border" value={value.sort} onChange={e => set({ sort: e.target.value as Filters['sort'] })}>
        <option value="updated">Recently updated</option>
        <option value="roi">Top ROI</option>
        <option value="winrate">Top Winrate</option>
        <option value="drawdown">Lowest Drawdown</option>
        <option value="downloads">Most Downloads</option>
        <option value="likes">Most Likes</option>
      </select>
      <button className="ml-auto px-3 py-2 rounded-md border" onClick={() => onChange({ q: '', strategy: '', tag: '', minROI: undefined, minWinrate: undefined, sort: 'updated' })}>
        Reset
      </button>
    </div>
  );
}