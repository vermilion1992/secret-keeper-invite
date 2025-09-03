'use client';
import * as React from 'react';
import type { BotRecord } from '@/types/my-bots';

type Props = {
  open: boolean;
  bot?: BotRecord | null;
  onClose: () => void;
};

export default function BotDetailsDrawer({ open, bot, onClose }: Props) {
  if (!open || !bot) return null;
  const v = bot.latest;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">{bot.name}</div>
          <button onClick={onClose} className="text-sm px-2 py-1 rounded border">Close</button>
        </div>
        <div className="text-sm opacity-70 mb-2">{bot.strategyLabel} ({bot.strategyId})</div>
        {bot.notes ? <div className="text-sm mb-3"><span className="font-medium">Notes:</span> {bot.notes}</div> : null}

        <div className="space-y-3">
          <div className="text-sm font-medium">Latest Backtest</div>
          <div className="text-sm">
            ROI {v ? `${v.roiPct.toFixed(1)}%` : '—'} ·
            Winrate {v ? `${v.winratePct.toFixed(1)}%` : '—'} ·
            Max DD {v ? `${v.maxDrawdownPct.toFixed(1)}%` : '—'} ·
            Trades {v?.trades ?? '—'} {v?.sharpe !== undefined ? `· Sharpe ${v.sharpe.toFixed(2)}` : ''}
          </div>

          {bot.versions && bot.versions.length > 1 ? (
            <div>
              <div className="text-sm font-medium mb-1">Versions</div>
              <ul className="text-sm list-disc ml-5 space-y-1">
                {bot.versions.map(ver => (
                  <li key={ver.id}>
                    {new Date(ver.ranAtISO).toLocaleString()} — ROI {ver.roiPct.toFixed(1)}%, DD {ver.maxDrawdownPct.toFixed(1)}%, Trades {ver.trades}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="text-xs opacity-60">
            Entry logic summary can be injected here later (from NL preview).
          </div>
        </div>
      </div>
    </div>
  );
}