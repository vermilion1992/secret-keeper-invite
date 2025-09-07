'use client';
import * as React from 'react';
import type { StrategyState } from './types';

// Canonical key:
const KEY = 'botforge.builder.state';

// Legacy keys we'll migrate:
const LEGACY_KEYS = [
  'builder.state',
  'strategyBuilder.state',
  'botforge_state',
  'sb_state',
  'selectedStrategy',
  'strategy' // some apps saved the whole object here
];

function coerceStrategyId(raw:any): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') {
    return raw.strategyId || raw.id || raw.label || '';
  }
  return '';
}

export async function upgradeLocalState(): Promise<void> {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) {
      // Check if existing state has a label instead of ID and migrate
      const parsed = JSON.parse(existing);
      if (parsed.strategyId) {
        try {
          const { loadConfigs, resolveStrategyId } = await import('./correlation');
          const { strategies } = await loadConfigs();
          const resolvedId = resolveStrategyId(parsed.strategyId, strategies);
          if (resolvedId && resolvedId !== parsed.strategyId) {
            parsed.strategyId = resolvedId;
            localStorage.setItem(KEY, JSON.stringify(parsed));
          }
        } catch {}
      }
      return; // existing canonical or migrated
    }

    // Look for any legacy value and convert
    for (const k of LEGACY_KEYS) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;

      let parsed:any = null;
      try { parsed = JSON.parse(raw); } catch { parsed = raw; }

      let strategyId = '';
      if (k === 'selectedStrategy') strategyId = String(parsed);
      else if (k === 'strategy') strategyId = coerceStrategyId(parsed);
      else if (typeof parsed === 'object') strategyId = coerceStrategyId(parsed);

      // Resolve label to canonical ID
      try {
        const { loadConfigs, resolveStrategyId } = await import('./correlation');
        const { strategies } = await loadConfigs();
        strategyId = resolveStrategyId(strategyId, strategies) || strategyId;
      } catch {}

      const state: StrategyState = {
        strategyId: strategyId || '',
        direction: 'long',
        indicatorParams: (parsed && parsed.indicatorParams) || {},
        ruleGroup: (parsed && parsed.ruleGroup) || { joiner:'AND', rules:[] },
      };
      localStorage.setItem(KEY, JSON.stringify(state));
      return;
    }
  } catch {}
}

export function readBuilderState(): StrategyState | null {
  try { 
    // Try sessionStorage first (for navigation persistence)
    let raw = sessionStorage.getItem('bf:builderState');
    if (raw) return JSON.parse(raw) as StrategyState;
    
    // Fallback to localStorage
    raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as StrategyState : null;
  } catch { return null; }
}

export function writeBuilderState(s: StrategyState) {
  try { 
    localStorage.setItem(KEY, JSON.stringify(s)); 
    sessionStorage.setItem('bf:builderState', JSON.stringify(s));
  } catch {}
}

export function useBuilderState() {
  const [state, setState] = React.useState<StrategyState>(() => {
    // Hydrate from storage before first render
    const stored = readBuilderState();
    return stored ?? ({ strategyId:'', direction:'long', indicatorParams:{}, ruleGroup:{ joiner:'AND', rules:[] } });
  });
  
  React.useEffect(() => {
    upgradeLocalState();
  }, []);
  
  React.useEffect(()=> { writeBuilderState(state); }, [state]);
  return { state, setState };
}