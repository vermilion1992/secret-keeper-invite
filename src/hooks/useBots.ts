'use client';
import * as React from 'react';
import type { BotRecord } from '@/types/my-bots';

// TODO wire to real storage/API. For now, read from localStorage with a fallback.
const KEY = 'botforge.mybots';

const fallback: BotRecord[] = [
  {
    id: 'bot_ema_1',
    name: 'EMA Cross L1',
    strategyId: 'ema_crossover_pro',
    strategyLabel: 'EMA Crossover Pro',
    status: 'backtested',
    tags: ['Scalping', 'Momentum'],
    pinned: true,
    latest: {
      id: 'v1', ranAtISO: new Date().toISOString(),
      equityCurve: [1, 1.02, 0.98, 1.05, 1.10, 1.08, 1.15],
      roiPct: 15.2, winratePct: 54.0, maxDrawdownPct: 7.5, trades: 126, sharpe: 1.3,
    },
    versions: [],
  },
  {
    id: 'bot_rsi_1',
    name: 'RSI Breakout Beta',
    strategyId: 'rsi_breakout',
    strategyLabel: 'RSI Breakout',
    status: 'ready_to_export',
    tags: ['Swing'],
    latest: {
      id: 'v3', ranAtISO: new Date().toISOString(),
      equityCurve: [1, 0.99, 1.04, 1.06, 1.09, 1.12, 1.18],
      roiPct: 18.4, winratePct: 48.0, maxDrawdownPct: 6.1, trades: 84, sharpe: 1.1,
    },
    versions: [],
  },
  {
    id: 'bot_psar_1',
    name: 'PSAR Flip X',
    strategyId: 'psar_flip_trend',
    strategyLabel: 'PSAR Flip Trend',
    status: 'draft',
    tags: ['Experimental'],
    latest: undefined,
  },
];

export function useBots() {
  const [bots, setBots] = React.useState<BotRecord[]>([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setBots(raw ? JSON.parse(raw) : fallback);
    } catch {
      setBots(fallback);
    }
  }, []);

  const persist = (next: BotRecord[]) => {
    setBots(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const byId = (id: string) => bots.find(b => b.id === id);

  const update = (id: string, fn: (b: BotRecord) => BotRecord) =>
    persist(bots.map(b => (b.id === id ? fn(b) : b)));

  return {
    bots,
    setBots: persist,
    byId,
    rebacktest: (id: string) => console.log('re-run backtest', id),
    exportPy: (id: string) => console.log('export python', id),
    edit: (id: string) => console.log('edit bot', id),
    duplicate: (id: string) => {
      const b = byId(id); if (!b) return;
      const copy: BotRecord = { ...b, id: `${b.id}_copy`, name: `${b.name} (copy)`, pinned: false };
      persist([copy, ...bots]);
    },
    remove: (id: string) => persist(bots.filter(b => b.id !== id)),
    togglePin: (id: string) => update(id, b => ({ ...b, pinned: !b.pinned })),
  };
}