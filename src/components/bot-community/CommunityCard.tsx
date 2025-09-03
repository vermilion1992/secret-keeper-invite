'use client';
import * as React from 'react';
import Sparkline from './Sparkline';
import type { CommunityBot } from '../../types/bot-community';

export default function CommunityCard({
  bot, onImport, onOpenDetails, onLike,
}: {
  bot: CommunityBot;
  onImport?: (id: string) => void;
  onOpenDetails?: (id: string) => void;
  onLike?: (id: string) => void;
}) {
  const v = bot;
  // Base card look matches My Bots; subtle purple highlight on hover/focus
  return (
    <div
      className="group relative rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm hover:shadow transition
                 hover:ring-1 hover:ring-purple-200/60 focus-within:ring-2 focus-within:ring-purple-300/70"
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-base font-semibold truncate">{v.name}</div>
          <div className="text-xs opacity-70 truncate">{v.strategyLabel} <span className="opacity-50">({v.strategyId})</span></div>
        </div>
        <button
          className="ml-3 text-xs px-2 py-1 rounded-md border hover:bg-purple-50"
          onClick={() => onImport?.(v.id)}
          title="Import to My Bots"
        >
          Import
        </button>
      </div>

      {/* Author + updated */}
      <div className="text-xs opacity-70 mb-2">
        by <span className="font-medium">{v.author.name}</span> · {new Date(v.updatedAtISO).toLocaleDateString()}
      </div>

      {/* Sparkline + quick stats */}
      <div className="flex items-center gap-4">
        <div className="text-gray-700"><Sparkline data={v.equityCurve ?? []} /></div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div><span className="opacity-60">ROI</span> {v.roiPct !== undefined ? `${v.roiPct.toFixed(1)}%` : '—'}</div>
          <div><span className="opacity-60">Winrate</span> {v.winratePct !== undefined ? `${v.winratePct.toFixed(1)}%` : '—'}</div>
          <div><span className="opacity-60">Max DD</span> {v.maxDrawdownPct !== undefined ? `${v.maxDrawdownPct.toFixed(1)}%` : '—'}</div>
          <div><span className="opacity-60">Trades</span> {v.trades ?? '—'}</div>
        </div>
      </div>

      {/* Tags */}
      {v.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {v.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100">{t}</span>)}
        </div>
      ) : null}

      {/* Footer */}
      <div className="mt-4 flex items-center gap-2">
        <button className="px-2.5 py-1 rounded-md border text-sm" onClick={() => onOpenDetails?.(v.id)}>Details</button>
        <button className="px-2.5 py-1 rounded-md border text-sm" onClick={() => onLike?.(v.id)}>👍 {v.likes ?? 0}</button>
        <div className="ml-auto text-xs opacity-60">⬇ {v.downloads ?? 0}</div>
      </div>
    </div>
  );
}