'use client';
import * as React from 'react';
import { useCommunityBots } from '../hooks/useCommunityBots';
import CommunityCard from '../components/bot-community/CommunityCard';
import FiltersBar, { Filters } from '../components/bot-community/FiltersBar';
import type { CommunityBot } from '../types/bot-community';

// Import into My Bots local store if present:
function importToMyBots(bot: CommunityBot) {
  try {
    const KEY = 'botforge.mybots';
    const raw = localStorage.getItem(KEY);
    const current = raw ? JSON.parse(raw) : [];
    const id = `imp_${bot.id}`;
    const newBot = {
      id,
      name: bot.name,
      strategyId: bot.strategyId,
      strategyLabel: bot.strategyLabel,
      status: 'draft',
      tags: bot.tags ?? [],
      pinned: false,
      latest: {
        id: 'community',
        ranAtISO: bot.updatedAtISO,
        equityCurve: bot.equityCurve ?? [],
        roiPct: bot.roiPct ?? 0,
        winratePct: bot.winratePct ?? 0,
        maxDrawdownPct: bot.maxDrawdownPct ?? 0,
        trades: bot.trades ?? 0,
      },
      versions: [],
    };
    localStorage.setItem(KEY, JSON.stringify([newBot, ...current]));
    alert('Imported to My Bots');
  } catch (e) {
    console.error(e);
    alert('Failed to import');
  }
}

export default function BotCommunity() {
  const { bots } = useCommunityBots();

  // derive unique strategies/tags for filters
  const strategyOptions = React.useMemo(() => Array.from(new Set(bots.map(b => b.strategyLabel))).sort(), [bots]);
  const tagOptions = React.useMemo(() => Array.from(new Set(bots.flatMap(b => b.tags ?? []))).sort(), [bots]);

  const [filters, setFilters] = React.useState<Filters>({ q:'', strategy:'', tag:'', minROI: undefined, minWinrate: undefined, sort:'updated' });

  const filtered = React.useMemo(() => {
    let list = [...bots];

    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(b => [b.name, b.strategyLabel, b.author.name, ...(b.tags ?? [])].join(' ').toLowerCase().includes(q));
    }
    if (filters.strategy) list = list.filter(b => b.strategyLabel === filters.strategy);
    if (filters.tag) list = list.filter(b => b.tags?.includes(filters.tag));
    if (filters.minROI !== undefined) list = list.filter(b => (b.roiPct ?? -Infinity) >= (filters.minROI ?? -Infinity));
    if (filters.minWinrate !== undefined) list = list.filter(b => (b.winratePct ?? -Infinity) >= (filters.minWinrate ?? -Infinity));

    switch (filters.sort) {
      case 'roi': list.sort((a,b)=> (b.roiPct ?? -1) - (a.roiPct ?? -1)); break;
      case 'winrate': list.sort((a,b)=> (b.winratePct ?? -1) - (a.winratePct ?? -1)); break;
      case 'drawdown': list.sort((a,b)=> (a.maxDrawdownPct ?? 999) - (b.maxDrawdownPct ?? 999)); break;
      case 'downloads': list.sort((a,b)=> (b.downloads ?? 0) - (a.downloads ?? 0)); break;
      case 'likes': list.sort((a,b)=> (b.likes ?? 0) - (a.likes ?? 0)); break;
      case 'updated':
      default: list.sort((a,b)=> new Date(b.updatedAtISO).getTime() - new Date(a.updatedAtISO).getTime()); break;
    }
    return list;
  }, [bots, filters]);

  const [detailsId, setDetailsId] = React.useState<string | null>(null);

  return (
    <div className="p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="text-xl font-semibold">Bot Community</div>
      </div>

      <FiltersBar value={filters} onChange={setFilters} strategies={strategyOptions} tags={tagOptions} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(b => (
          <CommunityCard
            key={b.id}
            bot={b}
            onImport={(id)=> importToMyBots(b)}
            onOpenDetails={(id)=> setDetailsId(id)}
            onLike={(id)=> console.log('like', id)}
          />
        ))}
      </div>

      {/* Minimal details overlay (reuse card content for now) */}
      {detailsId ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={()=> setDetailsId(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold">Community Bot</div>
              <button onClick={()=> setDetailsId(null)} className="text-sm px-2 py-1 rounded border">Close</button>
            </div>
            <pre className="text-xs bg-gray-50 rounded p-3 overflow-auto">{JSON.stringify(filtered.find(x=>x.id===detailsId), null, 2)}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}