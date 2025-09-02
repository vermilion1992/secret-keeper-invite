// Strategy Registry - Source of truth for which indicators/settings each strategy uses

export interface StrategyConfig {
  indicatorSettings: Record<string, { fields: string[] }>;
  tiles: string[];
  operands: Record<string, string[]>;
  defaultSeeds: Array<{
    lhs: string;
    op: 'crosses_above' | 'crosses_below' | 'is_above' | 'is_below' | 'is_true';
    rhs?: string | number;
  }>;
}

export const STRATEGY_REGISTRY: Record<string, StrategyConfig> = {
  'ema-crossover-pro': {
    indicatorSettings: {
      ema: { fields: ['fast', 'slow', 'maType'] },
    },
    tiles: ['ema'],
    operands: { ema: ['ema_fast', 'ema_slow', 'price'] },
    defaultSeeds: [
      { lhs: 'ema_fast', op: 'crosses_above', rhs: 'ema_slow' }
    ],
  },

  'rsi-mean-reversion': {
    indicatorSettings: {
      rsi: { fields: ['length', 'overbought', 'oversold'] },
      atr: { fields: ['period'] },
    },
    tiles: ['rsi', 'atr'],
    operands: { 
      rsi: ['rsi', 'rsi_50', 'rsi_overbought', 'rsi_oversold'],
      atr: ['atr_gt_threshold'] 
    },
    defaultSeeds: [
      { lhs: 'rsi', op: 'is_below', rhs: 'rsi_oversold' }
    ],
  },

  'macd-confirmation': {
    indicatorSettings: {
      macd: { fields: ['fast', 'slow', 'signal'] },
      ema: { fields: ['period'] },
    },
    tiles: ['macd', 'ema'],
    operands: {
      macd: ['macd_line', 'macd_signal', 'macd_hist_gt0'],
      ema: ['ema_trend', 'price'],
    },
    defaultSeeds: [
      { lhs: 'macd_line', op: 'crosses_above', rhs: 'macd_signal' },
      { lhs: 'price', op: 'is_above', rhs: 'ema_trend' }
    ],
  },

  'bollinger-bounce': {
    indicatorSettings: {
      bb: { fields: ['period', 'stdDev'] },
      rsi: { fields: ['length'] },
    },
    tiles: ['bollinger', 'rsi'],
    operands: { 
      bollinger: ['price', 'bb_upper', 'bb_lower', 'bb_mid'],
      rsi: ['rsi', 'rsi_50'] 
    },
    defaultSeeds: [
      { lhs: 'price', op: 'is_below', rhs: 'bb_lower' },
      { lhs: 'rsi', op: 'is_below', rhs: 50 }
    ],
  },

  'stochastic-swing': {
    indicatorSettings: {
      stoch: { fields: ['k', 'd', 'overbought', 'oversold'] },
      sma: { fields: ['period'] },
    },
    tiles: ['stochastic', 'sma'],
    operands: { 
      stochastic: ['stoch_k', 'stoch_d', 'stoch_ob', 'stoch_os'],
      sma: ['price', 'sma_trend']
    },
    defaultSeeds: [
      { lhs: 'stoch_k', op: 'crosses_above', rhs: 'stoch_d' }
    ],
  },

  'vwap-trend-rider': {
    indicatorSettings: {
      vwap: { fields: [] },
      rsi: { fields: ['length'] },
    },
    tiles: ['vwap', 'rsi'],
    operands: { 
      vwap: ['price', 'vwap'],
      rsi: ['rsi', 'rsi_50'] 
    },
    defaultSeeds: [
      { lhs: 'price', op: 'is_above', rhs: 'vwap' }
    ],
  },

  'atr-trailing-stops': {
    indicatorSettings: {
      ema: { fields: ['period'] },
      atr: { fields: ['period', 'multiplier'] },
    },
    tiles: ['ema', 'atr'],
    operands: {
      ema: ['ema_trend', 'price'],
      atr: ['atr_gt_threshold'],
    },
    defaultSeeds: [
      { lhs: 'price', op: 'crosses_above', rhs: 'ema_trend' }
    ],
  },

  'momentum-king': {
    indicatorSettings: {
      momentum: { fields: ['lookback'] },
      volume: { fields: ['period'] },
    },
    tiles: ['momentum', 'volume'],
    operands: { 
      momentum: ['momentum_score'],
      volume: ['volume_gt_avg']
    },
    defaultSeeds: [
      { lhs: 'momentum_score', op: 'is_true' },
      { lhs: 'volume_gt_avg', op: 'is_true' }
    ],
  },

  'vol-spike-breakout': {
    indicatorSettings: {
      volume: { fields: ['multiplier'] },
      atr: { fields: ['period'] },
    },
    tiles: ['volume', 'atr'],
    operands: { 
      volume: ['volume_spike'],
      atr: ['price', 'breakout_level']
    },
    defaultSeeds: [
      { lhs: 'volume_spike', op: 'is_true' },
      { lhs: 'price', op: 'crosses_above', rhs: 'breakout_level' }
    ],
  },

  'breadth-monitor': {
    indicatorSettings: {
      breadth: { fields: ['lookback', 'threshold'] },
    },
    tiles: ['breadth'],
    operands: { breadth: ['breadth_ok'] },
    defaultSeeds: [
      { lhs: 'breadth_ok', op: 'is_true' }
    ],
  },

  'k-strength-divergence': {
    indicatorSettings: {
      k_strength: { fields: ['period'] },
      rsi: { fields: ['length'] },
    },
    tiles: ['k_strength', 'rsi'],
    operands: { 
      k_strength: ['k_strength_signal'],
      rsi: ['rsi_divergence']
    },
    defaultSeeds: [
      { lhs: 'k_strength_signal', op: 'is_true' },
      { lhs: 'rsi_divergence', op: 'is_true' }
    ],
  },

  'turbo-k6': {
    indicatorSettings: {
      turbo: { fields: ['lookback', 'k_value', 'vol_target'] },
    },
    tiles: ['turbo'],
    operands: { turbo: ['turbo_signal'] },
    defaultSeeds: [
      { lhs: 'turbo_signal', op: 'is_true' }
    ],
  },

  'market-neutral': {
    indicatorSettings: {
      rank: { fields: ['topN', 'bottomN'] },
      spread: { fields: ['threshold'] },
    },
    tiles: ['rank', 'spread'],
    operands: { 
      rank: ['rank_long_topN', 'rank_short_bottomN'],
      spread: ['spread_score', 'zero_line'] 
    },
    defaultSeeds: [
      { lhs: 'rank_long_topN', op: 'is_true' },
      { lhs: 'spread_score', op: 'is_above', rhs: 'zero_line' }
    ],
  },

  'hybrid-momentum': {
    indicatorSettings: {
      ema: { fields: ['fast', 'slow', 'maType'] },
      rsi: { fields: ['length', 'overbought', 'oversold'] },
      macd: { fields: ['fast', 'slow', 'signal'] },
      breadth: { fields: [] },
    },
    tiles: ['ema', 'rsi', 'macd', 'breadth'],
    operands: {
      ema: ['ema_fast', 'ema_slow'],
      rsi: ['rsi', 'rsi_50', 'rsi_overbought', 'rsi_oversold'],
      macd: ['macd_line', 'macd_signal', 'macd_hist_gt0'],
      breadth: ['breadth_ok'],
    },
    defaultSeeds: [
      { lhs: 'ema_fast', op: 'crosses_above', rhs: 'ema_slow' },
      { lhs: 'rsi', op: 'is_above', rhs: 50 },
      { lhs: 'macd_line', op: 'crosses_above', rhs: 'macd_signal' },
      { lhs: 'breadth_ok', op: 'is_true' }
    ],
  },

  'breakout-pullback': {
    indicatorSettings: {
      breakout: { fields: ['length'] },
      rsi: { fields: ['length'] },
      atr: { fields: ['period'] },
    },
    tiles: ['breakout', 'rsi', 'atr'],
    operands: { 
      breakout: ['price', 'breakout_level'],
      rsi: ['rsi', 'rsi_pullback'],
      atr: ['atr_stop']
    },
    defaultSeeds: [
      { lhs: 'price', op: 'crosses_above', rhs: 'breakout_level' },
      { lhs: 'rsi', op: 'is_below', rhs: 'rsi_pullback' }
    ],
  },

  'range-reversal': {
    indicatorSettings: {
      bb: { fields: ['period', 'stdDev'] },
      rsi: { fields: ['length'] },
    },
    tiles: ['bollinger', 'rsi'],
    operands: { 
      bollinger: ['price', 'bb_upper', 'bb_lower'],
      rsi: ['rsi', 'rsi_50']
    },
    defaultSeeds: [
      { lhs: 'price', op: 'is_below', rhs: 'bb_lower' },
      { lhs: 'rsi', op: 'is_below', rhs: 50 }
    ],
  },

  'trend-following-core': {
    indicatorSettings: {
      ema: { fields: ['period'] },
      macd: { fields: ['fast', 'slow', 'signal'] },
    },
    tiles: ['ema', 'macd'],
    operands: {
      ema: ['price', 'ema_trend'],
      macd: ['macd_line', 'macd_signal'],
    },
    defaultSeeds: [
      { lhs: 'price', op: 'is_above', rhs: 'ema_trend' },
      { lhs: 'macd_line', op: 'crosses_above', rhs: 'macd_signal' }
    ],
  },

  'multi-confirm-swing': {
    indicatorSettings: {
      rsi: { fields: ['length'] },
      macd: { fields: ['fast', 'slow', 'signal'] },
      stoch: { fields: ['k', 'd'] },
    },
    tiles: ['rsi', 'macd', 'stochastic'],
    operands: {
      rsi: ['rsi', 'rsi_50'],
      macd: ['macd_line', 'macd_signal'],
      stochastic: ['stoch_k', 'stoch_d'],
    },
    defaultSeeds: [
      { lhs: 'rsi', op: 'is_above', rhs: 50 },
      { lhs: 'macd_line', op: 'crosses_above', rhs: 'macd_signal' },
      { lhs: 'stoch_k', op: 'crosses_above', rhs: 'stoch_d' }
    ],
  },

  'support-resistance-bounce': {
    indicatorSettings: {
      sr: { fields: ['lookback'] },
      volume: { fields: ['threshold'] },
    },
    tiles: ['sr', 'volume'],
    operands: { 
      sr: ['price', 'support_level', 'resistance_level'],
      volume: ['volume_gt_avg'] 
    },
    defaultSeeds: [
      { lhs: 'price', op: 'crosses_above', rhs: 'support_level' },
      { lhs: 'volume_gt_avg', op: 'is_true' }
    ],
  },

  'high-volatility-rider': {
    indicatorSettings: {
      atr: { fields: ['length'] },
      vol_rank: { fields: ['percent'] },
    },
    tiles: ['atr', 'vol_rank'],
    operands: { 
      atr: ['atr_gt_threshold'],
      vol_rank: ['vol_rank_high']
    },
    defaultSeeds: [
      { lhs: 'atr_gt_threshold', op: 'is_true' },
      { lhs: 'vol_rank_high', op: 'is_true' }
    ],
  },
};

// Helper to get strategy config
export function getStrategyConfig(strategyId: string): StrategyConfig | null {
  return STRATEGY_REGISTRY[strategyId] || null;
}

// Helper to get available operands for a strategy
export function getAvailableOperands(strategyId: string): Record<string, string[]> {
  const config = getStrategyConfig(strategyId);
  return config?.operands || {};
}

// Helper to get indicator settings for a strategy
export function getIndicatorSettings(strategyId: string): Record<string, { fields: string[] }> {
  const config = getStrategyConfig(strategyId);
  return config?.indicatorSettings || {};
}