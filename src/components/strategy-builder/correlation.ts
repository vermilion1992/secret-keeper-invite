import { StrategyConfig, IndicatorConfig } from './types';
import { STRATEGY_ALIASES, STRATEGY_OVERLAY, normalize } from './configOverlay';

export interface Rule {
  id: string;
  operator: string;
  left: any;
  right: any;
}

export interface StrategyState {
  strategyId?: string;
  direction?: string;
  indicatorParams?: Record<string, any>;
  ruleGroup?: {
    rules: Rule[];
  };
}

export async function loadConfigs(): Promise<{ strategies: StrategyConfig[]; indicators: IndicatorConfig[] }> {
  const bust = Date.now();
  const res = await fetch(`/botforge_combined_config.json?v=${bust}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load config JSON: ${res.status}`);
  const data = await res.json();

  const strategies: StrategyConfig[] = (data?.strategies ?? data ?? []).map((s: StrategyConfig) => {
    const id = s.id;
    const overlay = STRATEGY_OVERLAY[id] ?? {};
    return {
      ...s,
      allowedIndicators: s.allowedIndicators?.length ? s.allowedIndicators : (overlay.allowedIndicators ?? []),
      allowedOperators: s.allowedOperators?.length ? s.allowedOperators : (overlay.allowedOperators ?? []),
      exitDefaults: { ...(overlay.exitDefaults ?? {}), ...(s.exitDefaults ?? {}) },
    } as StrategyConfig;
  });

  const indicators: IndicatorConfig[] = data?.indicators ?? data?.Indicators ?? [];

  return { strategies, indicators };
}

function resolveId(input: string, strategies: StrategyConfig[]): string | undefined {
  if (!input) return undefined;
  // exact id
  if (strategies.some(s => s.id === input)) return input;

  // alias map
  const aliased = STRATEGY_ALIASES[normalize(input)];
  if (aliased && strategies.some(s => s.id === aliased)) return aliased;

  // exact label
  const byLabel = strategies.find(s => s.name === input);
  if (byLabel) return byLabel.id;

  // normalized label
  const norm = normalize(input);
  const byNormLabel = strategies.find(s => normalize(s.name) === norm);
  if (byNormLabel) return byNormLabel.id;

  // normalized id contains
  const byContains = strategies.find(s => normalize(s.id).includes(norm));
  if (byContains) return byContains.id;

  return undefined;
}

export function getStrategy(strategies: StrategyConfig[], idOrLabel: string) {
  const resolved = resolveId(idOrLabel, strategies);
  if (!resolved) {
    const ids = strategies.map(s => s.id).join(', ');
    throw new Error(`Strategy not found: "${idOrLabel}". Known: ${ids}`);
  }
  const s = strategies.find(x => x.id === resolved)!;
  return s;
}

export function filterIndicators(indicators: IndicatorConfig[], allowedIds: string[]) {
  return indicators.filter(x => allowedIds.includes(x.id));
}