import { Strategy as StrategyConfig, IndicatorConfig } from '@/types/botforge';

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

function normalize(x: string) {
  return (x || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

// Known aliases to cover legacy/marketing names used by tiles
const KNOWN_ALIAS_MAP: Record<string, string> = {
  'ema crossover': 'ema-crossover',
  'ema crossover pro': 'ema-crossover',
  'rsi mean reversion': 'rsi-mean-reversion',
  'macd confirmation': 'macd-confirmation',
  'bollinger bounce': 'bollinger-bounce',
  'bollinger band bounce': 'bollinger-bounce',
  'stochastic swing': 'stochastic-swing',
  'atr trailing': 'atr-trailing',
  'vwap trend': 'vwap-trend',
};

export async function loadConfigs(): Promise<{ strategies: StrategyConfig[]; indicators: IndicatorConfig[] }> {
  const bust = Date.now();
  const res = await fetch(`/botforge_combined_config.json?v=${bust}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load config JSON: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  
  // Transform the data to match our expected format
  const strategies = data.strategies ? Object.values(data.strategies) as StrategyConfig[] : [];
  const indicators = data.indicators || [];
  
  return { strategies, indicators };
}

function resolveByAliases(input: string, strategies: StrategyConfig[]): string | undefined {
  const normIn = normalize(input);
  const aliased = KNOWN_ALIAS_MAP[normIn];
  if (!aliased) return undefined;
  return strategies.some(s => s.id === aliased) ? aliased : undefined;
}

function resolveByLabel(input: string, strategies: StrategyConfig[]): string | undefined {
  // exact label
  const byExact = strategies.find(s => s.name === input);
  if (byExact) return byExact.id;

  // normalized label equality
  const normIn = normalize(input);
  const byNormEq = strategies.find(s => normalize(s.name) === normIn);
  if (byNormEq) return byNormEq.id;

  // startsWith/contains heuristics on normalized text
  const candidates = strategies
    .map(s => ({ id: s.id, label: s.name, norm: normalize(s.name) }))
    .filter(s => s.norm.startsWith(normIn) || normIn.startsWith(s.norm) || s.norm.includes(normIn));

  if (candidates.length === 1) return candidates[0].id;
  return undefined;
}

function resolveStrategyId(input: string, strategies: StrategyConfig[]): string | undefined {
  // 1) exact id
  if (strategies.some(s => s.id === input)) return input;

  // 2) alias map (covers legacy tile names)
  const viaAlias = resolveByAliases(input, strategies);
  if (viaAlias) return viaAlias;

  // 3) label-based resolution
  const viaLabel = resolveByLabel(input, strategies);
  if (viaLabel) return viaLabel;

  // 4) normalized id fallback (if UI sends a prettified id)
  const normIn = normalize(input);
  const byNormId = strategies.find(s => normalize(s.id) === normIn);
  if (byNormId) return byNormId.id;

  // 5) id contains (last resort)
  const byContains = strategies.find(s => normalize(s.id).includes(normIn));
  if (byContains) return byContains.id;

  return undefined;
}

export function getStrategy(strategies: StrategyConfig[], idOrLabel: string) {
  const resolvedId = resolveStrategyId(idOrLabel, strategies);
  if (!resolvedId) {
    const ids = strategies.map(s => s.id).join(', ');
    console.error('DEBUG Requested strategy (raw):', idOrLabel);
    console.error('DEBUG Available ids:', ids);
    throw new Error(`Strategy not found: "${idOrLabel}". Try one of: ${ids}`);
  }
  const s = strategies.find(x => x.id === resolvedId)!;
  return s;
}

export function filterIndicators(indicators: IndicatorConfig[], allowedIds: string[]) {
  return indicators.filter(x => allowedIds.includes(x.id));
}