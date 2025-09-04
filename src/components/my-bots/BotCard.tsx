'use client';
import * as React from 'react';
import Sparkline from './Sparkline';
import type { BotRecord } from '@/types/my-bots';

type Props = {
  bot: BotRecord;
  onRebacktest?: (id: string) => void;
  onExport?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string, next: boolean) => void;
  onOpenDetails?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string, next: boolean) => void;
};

const statusColor: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  backtested: 'bg-accent text-accent-foreground',
  ready_to_export: 'bg-success/10 text-success',
};

export default function BotCard({
  bot, onRebacktest, onExport, onEdit, onDuplicate, onDelete, onTogglePin,
  onOpenDetails, selectable, selected, onToggleSelect,
}: Props) {
  const v = bot.latest;
  return (
    <div className="group relative frosted rounded-2xl p-4 shadow-sm hover:shadow transition">
      {/* Pin + Select */}
      <div className="absolute right-3 top-3 flex items-center gap-2">
        {selectable ? (
          <button
            onClick={() => onToggleSelect?.(bot.id, !selected)}
            className={`h-6 w-6 rounded border text-xs flex items-center justify-center ${selected ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
            aria-label="Select bot"
            title="Select"
          >
            {selected ? '✓' : ''}
          </button>
        ) : null}
        <button
          onClick={() => onTogglePin?.(bot.id, !bot.pinned)}
          className={`h-6 w-6 rounded ${bot.pinned ? 'bg-yellow-300' : 'bg-muted'} text-foreground text-xs`}
          aria-label="Pin bot"
          title={bot.pinned ? 'Unpin' : 'Pin'}
        >★</button>
      </div>

      {/* Header */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <div className="text-base font-semibold truncate">{bot.name}</div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor[bot.status] ?? statusColor.draft}`}>
            {bot.status.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="text-xs opacity-70">{bot.strategyLabel} <span className="opacity-50">({bot.strategyId})</span></div>
      </div>

      {/* Sparkline + quick stats */}
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground">
          <Sparkline data={v?.equityCurve ?? []} />
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div><span className="opacity-60">ROI</span> {v ? `${v.roiPct.toFixed(1)}%` : '—'}</div>
          <div><span className="opacity-60">Winrate</span> {v ? `${v.winratePct.toFixed(1)}%` : '—'}</div>
          <div><span className="opacity-60">Max DD</span> {v ? `${v.maxDrawdownPct.toFixed(1)}%` : '—'}</div>
          <div><span className="opacity-60">Trades</span> {v?.trades ?? '—'}</div>
        </div>
      </div>

      {/* Tags */}
      {bot.tags && bot.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {bot.tags.map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
          ))}
        </div>
      ) : null}

      {/* Footer actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="px-2.5 py-1 rounded-md border border-border text-sm hover:bg-muted" onClick={() => onRebacktest?.(bot.id)}>▶ Re-run</button>
        <button className="px-2.5 py-1 rounded-md border border-border text-sm hover:bg-muted" onClick={() => onExport?.(bot.id)}>📤 Export</button>
        <button className="px-2.5 py-1 rounded-md border border-border text-sm hover:bg-muted" onClick={() => onEdit?.(bot.id)}>✎ Edit</button>
        <button className="px-2.5 py-1 rounded-md border border-border text-sm hover:bg-muted" onClick={() => onDuplicate?.(bot.id)}>⧉ Duplicate</button>
        <button className="px-2.5 py-1 rounded-md border border-border text-sm text-destructive hover:bg-destructive/10" onClick={() => onDelete?.(bot.id)}>🗑 Delete</button>
        <button className="ml-auto px-2.5 py-1 rounded-md border border-border text-sm hover:bg-muted" onClick={() => onOpenDetails?.(bot.id)}>Details</button>
      </div>
    </div>
  );
}