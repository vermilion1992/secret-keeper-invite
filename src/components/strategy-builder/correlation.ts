import { StrategyConfig, IndicatorConfig } from './types';

function normalize(x: string) {
  return (x || '').toLowerCase().replace(/[^a-z0-9\s_-]/g,'').replace(/\s+/g,'_').trim();
}

// Legacy/alias labels → canonical IDs
const ALIASES: Record<string,string> = {
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
  'breadth tilt hybrid': 'breadth_tilt_hybrid'
};

export async function loadConfigs(): Promise<{ strategies: StrategyConfig[]; indicators: IndicatorConfig[] }> {
  const bust = Date.now();
  const res = await fetch(`/botforge_combined_config.json?v=${bust}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load config JSON: ${res.status}`);
  const data = await res.json();
  const strategies: StrategyConfig[] = data?.strategies ?? [];
  const indicators: IndicatorConfig[] = data?.indicators ?? [];
  if (!Array.isArray(strategies) || !Array.isArray(indicators)) {
    throw new Error('Invalid botforge_combined_config.json: expected { strategies:[], indicators:[] }');
  }
  return { strategies, indicators };
}

function resolveStrategyId(input: string, strategies: StrategyConfig[]): string | undefined {
  if (!input) return undefined;

  // 1) exact id
  if (strategies.some(s => s.id === input)) return input;

  // 2) alias by normalized label
  const aliased = ALIASES[normalize(input)];
  if (aliased && strategies.some(s => s.id === aliased)) return aliased;

  // 3) exact label
  const byLabel = strategies.find(s => s.label === input);
  if (byLabel) return byLabel.id;

  // 4) normalized label
  const norm = normalize(input);
  const byNormLabel = strategies.find(s => normalize(s.label) === norm);
  if (byNormLabel) return byNormLabel.id;

  // 5) normalized id contains
  const byContains = strategies.find(s => normalize(s.id).includes(norm));
  if (byContains) return byContains.id;

  return undefined;
}

export function getStrategy(strategies: StrategyConfig[], idOrLabel: string) {
  const resolvedId = resolveStrategyId(idOrLabel, strategies);
  if (!resolvedId) {
    const ids = strategies.map(s => s.id).join(', ');
    throw new Error(`Strategy not found: "${idOrLabel}". Available: ${ids}`);
  }
  return strategies.find(s => s.id === resolvedId)!;
}

export function filterIndicators(indicators: IndicatorConfig[], allowedIds: string[]) {
  return indicators.filter(x => allowedIds.includes(x.id));
}