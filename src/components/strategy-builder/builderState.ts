'use client';
import * as React from 'react';
import type { StrategyState } from './types';

const KEY = 'botforge.builder.state';

export function readBuilderState(): StrategyState | null {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) as StrategyState : null; } catch { return null; }
}
export function writeBuilderState(s: StrategyState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
export function useBuilderState() {
  const [state, setState] = React.useState<StrategyState>(() =>
    readBuilderState() ?? ({ strategyId: '', direction: 'long', indicatorParams: {}, ruleGroup: { joiner:'AND', rules:[] } })
  );
  React.useEffect(()=> { writeBuilderState(state); }, [state]);
  return { state, setState };
}