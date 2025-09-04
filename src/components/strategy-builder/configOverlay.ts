export const STRATEGY_ALIASES: Record<string, string> = {
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

const DEFAULT_OPERATORS = [
  '>', '>=', '<', '<=', '==',
  'crosses_above', 'crosses_below', 'rising', 'falling', 'within', 'outside'
];

export const STRATEGY_OVERLAY: Record<string, Partial<import('./types').StrategyConfig>> = {
  ema_crossover_pro:    { allowedIndicators: ['ema','atr','sma','rsi'], allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
  ema200_pullback:      { allowedIndicators: ['ema','rsi','atr'],       allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
  macd_momentum_shift:  { allowedIndicators: ['macd','ema','atr'],      allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.2,trailingTPPct:0.8} },
  rsi_breakout:         { allowedIndicators: ['rsi','sma','atr','bb'],  allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.0,hardTPPct:1.2} },
  bb_mean_revert:       { allowedIndicators: ['bb','rsi','atr'],        allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:1.6,hardTPPct:1.0} },
  donchian_breakout:    { allowedIndicators: ['donchian','atr','ema'],  allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.4,trailingTPPct:0.9} },
  keltner_trend:        { allowedIndicators: ['keltner','adx','ema','atr'], allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.2,trailingTPPct:0.8} },
  supertrend_follow:    { allowedIndicators: ['supertrend','ema','atr'],   allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
  ichimoku_baseline:    { allowedIndicators: ['ichimoku','atr','ema'],     allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.5,trailingTPPct:0.9} },
  adx_swing:            { allowedIndicators: ['adx','ema','rsi','atr'],    allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
  vwap_reclaim:         { allowedIndicators: ['vwap','volma','rsi','atr'], allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:1.8,hardTPPct:1.1} },
  psar_flip_trend:      { allowedIndicators: ['psar','ema','atr'],         allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.1,trailingTPPct:0.8} },
  roc_momo:             { allowedIndicators: ['roc','ema','atr'],          allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
  wr_reversal:          { allowedIndicators: ['williamsR','sma','atr'],    allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:1.9,hardTPPct:1.0} },
  cci_turbo:            { allowedIndicators: ['cci','ema','atr'],          allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
  atr_channel_break:    { allowedIndicators: ['atr','ema','keltner'],      allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.3,trailingTPPct:0.8} },
  triple_ema_ribbon:    { allowedIndicators: ['ema','atr','adx'],          allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.1,trailingTPPct:0.8} },
  vcb_nr7:              { allowedIndicators: ['volma','sma','atr','bb'],   allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.2,hardTPPct:1.3} },
  obv_trend_confirm:    { allowedIndicators: ['obv','ema','atr'],          allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
  breadth_tilt_hybrid:  { allowedIndicators: ['ema','rsi','adx','volma'],  allowedOperators: DEFAULT_OPERATORS, exitDefaults:{useATRStop:true,atrMult:2.0,hardTPPct:1.2} },
};

export function normalize(x: string) {
  return (x||'').toLowerCase().replace(/[^a-z0-9\s_-]/g,'').replace(/\s+/g,'_').trim();
}