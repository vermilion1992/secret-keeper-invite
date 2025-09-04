'use client';
import React from 'react';
import { loadConfigs, getStrategy, filterIndicators } from './correlation';
import { previewStrategy } from './nlPreview';
import type { StrategyConfig, IndicatorConfig, StrategyState, Rule } from './types';

type Props = {
  // Optional: if the page already has state/context, you can pass it in.
  state?: StrategyState;
  // Optional: backtest inputs if available on the page
  pairs?: string[];
  timeframe?: string;
  dataRange?: { from?: string; to?: string };
};

function readStateFallback(): StrategyState | null {
  // Fallback: common place we store builder state; safe no-throw
  try {
    const raw = localStorage.getItem('botforge.builder.state');
    return raw ? JSON.parse(raw) as StrategyState : null;
  } catch { return null; }
}

function PrettyRuleList({ rules, indicators }: { rules: Rule[]; indicators: IndicatorConfig[] }) {
  const prettyOp: Record<string, string> = {
    crosses_above: 'crosses above',
    crosses_below: 'crosses below',
    rising: 'is rising',
    falling: 'is falling',
    within: 'is within',
    outside: 'is outside',
  };
  const prettyRef = (ref: any) => {
    switch (ref?.kind) {
      case 'price.close': return 'Close';
      case 'price.open': return 'Open';
      case 'price.high': return 'High';
      case 'price.low': return 'Low';
      case 'constant.number': return String(ref.value ?? '?');
      default: {
        const ind = indicators.find(i => i.id === ref?.indicatorId);
        const label = ind ? ind.label : (ref?.indicatorId ?? 'Indicator');
        return ref?.path ? `${label} (${ref.path})` : label;
      }
    }
  };
  if (!rules?.length) return <div>No entry rules configured yet (you can add up to 5).</div>;
  return (
    <ol className="list-decimal ml-5 space-y-1">
      {rules.map((r, i) => (
        <li key={r.id ?? i}>
          {prettyRef(r.left)} {prettyOp[r.operator] ?? r.operator} {prettyRef(r.right)}
        </li>
      ))}
    </ol>
  );
}

export default function StrategyReviewSummary(props: Props) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<{
    state: StrategyState;
    strategy: StrategyConfig;
    indicators: IndicatorConfig[];
    preview: string;
  } | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const local = props.state ?? readStateFallback();
        if (!local?.strategyId) throw new Error('No strategy selected yet.');
        const { strategies, indicators } = await loadConfigs();
        const strategy = getStrategy(strategies, indicators, local.strategyId);
        const allowedIndicators = filterIndicators(indicators, strategy.allowedIndicators || []);
        const preview = previewStrategy(local, strategy, allowedIndicators);
        if (!alive) return;
        setSummary({ state: local, strategy, indicators: allowedIndicators, preview });
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'Failed to build summary');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [props.state]);

  if (loading) return <div className="text-sm opacity-70">Building summary…</div>;
  if (error) return <div className="text-sm text-red-500">Summary unavailable: {error}</div>;
  if (!summary) return null;

  const { state, strategy, indicators, preview } = summary;

  // Assemble display pieces
  const indicatorParamRows = Object.entries(state.indicatorParams ?? {})
    .filter(([id]) => indicators.some(ind => ind.id === id))
    .map(([id, params]) => {
      const found = indicators.find(ind => ind.id === id);
      return { id, label: found?.label ?? id, params };
    });

  const exits = { useATRStop: true, atrMult: 2.0, trailingTPPct: 0.7 }; // Default exits

  return (
    <div className="rounded-xl border border-gray-200/60 p-4 mb-4">
      <div className="text-lg font-semibold mb-1">Review strategy & settings</div>
      <div className="text-sm opacity-70 mb-3">
        Confirm your configuration before running the backtest.
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium">Selected Strategy</div>
          <div className="text-sm">{strategy.label} <span className="opacity-60">({strategy.id})</span></div>
          <div className="text-xs opacity-70">{strategy.blurb}</div>
        </div>

        <div>
          <div className="text-sm font-medium">Entry Logic (plain English)</div>
          <div className="text-sm">{preview}</div>
        </div>

        <div>
          <div className="text-sm font-medium">Entry Rules</div>
          <PrettyRuleList rules={state.ruleGroup?.rules ?? []} indicators={indicators} />
        </div>

        <div>
          <div className="text-sm font-medium">Indicator Settings</div>
          {indicatorParamRows.length === 0 ? (
            <div className="text-sm">No indicator overrides — using defaults.</div>
          ) : (
            <ul className="list-disc ml-5 space-y-1">
              {indicatorParamRows.map(r => (
                <li key={r.id} className="text-sm">
                  <span className="font-medium">{r.label}:</span>{' '}
                  {Object.entries(r.params).map(([k, v]) => `${k}=${v}`).join(', ')}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <div className="text-sm font-medium">Direction</div>
            <div className="text-sm">{state.direction ?? 'long'}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Pairs</div>
            <div className="text-sm">{(props.pairs && props.pairs.length) ? props.pairs.join(', ') : '—'}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Timeframe</div>
            <div className="text-sm">{props.timeframe ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm font-medium">Data Range</div>
            <div className="text-sm">
              {props.dataRange?.from || props.dataRange?.to
                ? `${props.dataRange?.from ?? '…'} → ${props.dataRange?.to ?? '…'}`
                : '—'}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Exits</div>
            <div className="text-sm">
              {exits.useATRStop ? `ATR×${exits.atrMult ?? 2.0}` : '—'}
              {exits.trailingTPPct ? `; Trailing TP ${exits.trailingTPPct}%` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}