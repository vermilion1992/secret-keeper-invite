import { StrategyConfig, IndicatorConfig } from './types';

function normalize(x: string) {
  return (x || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

// Known aliases to cover legacy/marketing names used by tiles
// LEFT = what the tile might send; RIGHT = our canonical strategy id
const KNOWN_ALIAS_MAP: Record<string, string> = {
  'ema crossover': 'ema_crossover_pro',
  'ema crossover pro': 'ema_crossover_pro',
  'ema 200 pullback': 'ema200_pullback',
  'macd momentum': 'macd_momentum_shift',
  'rsi mean reversion': 'rsi_breakout',
  'rsi breakout': 'rsi_breakout',
  'bollinger mean reversion': 'bb_mean_revert',
  'donchian breakout': 'donchian_breakout',
  'keltner trend': 'keltner_trend',
  'supertrend follow': 'supertrend_follow',
  'ichimoku baseline': 'ichimoku_baseline',
  'adx swing': 'adx_swing',
  'vwap reclaim': 'vwap_reclaim',
  'psar flip': 'psar_flip_trend',
  'roc momentum': 'roc_momo',
  'williams r reversal': 'wr_reversal',
  'cci turbo': 'cci_turbo',
  'atr channel break': 'atr_channel_break',
  'triple ema ribbon': 'triple_ema_ribbon',
  'vcb nr7': 'vcb_nr7',
  'obv trend confirm': 'obv_trend_confirm',
  'breadth tilt hybrid': 'breadth_tilt_hybrid',
};

export async function loadConfigs(): Promise<{ strategies: StrategyConfig[]; indicators: IndicatorConfig[] }> {
  const bust = Date.now();
  const res = await fetch(`/botforge_combined_config.json?v=${bust}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load config JSON: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  // Basic sanity check
  if (!Array.isArray(data?.strategies) || !Array.isArray(data?.indicators)) {
    throw new Error('Invalid botforge_combined_config.json: expected { strategies:[], indicators:[] }');
  }
  return data;
}

function resolveByAliases(input: string, strategies: StrategyConfig[]): string | undefined {
  const normIn = normalize(input);
  const aliased = KNOWN_ALIAS_MAP[normIn];
  if (!aliased) return undefined;
  return strategies.some(s => s.id === aliased) ? aliased : undefined;
}

function resolveByLabel(input: string, strategies: StrategyConfig[]): string | undefined {
  // exact label
  const byExact = strategies.find(s => s.label === input);
  if (byExact) return byExact.id;

  // normalized label equality
  const normIn = normalize(input);
  const byNormEq = strategies.find(s => normalize(s.label) === normIn);
  if (byNormEq) return byNormEq.id;

  // startsWith/contains heuristics on normalized text
  const candidates = strategies
    .map(s => ({ id: s.id, label: s.label, norm: normalize(s.label) }))
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