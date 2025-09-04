export type ParamDef = { type: 'int'|'float'|'bool'|'enum'; default: number|boolean|string; min?: number; max?: number; options?: string[] };

export const FALLBACK_CONFIG = {
  indicators: [
    { id: 'ema', label: 'EMA', blurb: 'Exponential Moving Average — responsive trend line.', params: { period: { type:'int', default:20, min:2, max:400 } as ParamDef, source: { type:'enum', default:'close', options:['close','open','high','low'] } as ParamDef }, outputs: ['value'] },
    { id: 'sma', label: 'SMA', blurb: 'Simple Moving Average — classic average; slower than EMA.', params: { period: { type:'int', default:20, min:2, max:400 }, source: { type:'enum', default:'close', options:['close','open','high','low'] } }, outputs: ['value'] },
    { id: 'rsi', label: 'RSI', blurb: 'Relative Strength Index — momentum/OB-OS (0–100).', params: { length: { type:'int', default:14, min:2, max:200 } }, outputs: ['value'] },
    { id: 'macd', label: 'MACD', blurb: 'MACD — fast/slow EMA difference + signal line.', params: { fast:{type:'int',default:12,min:2,max:200}, slow:{type:'int',default:26,min:2,max:400}, signal:{type:'int',default:9,min:1,max:200} }, outputs: ['line','signal','hist'] },
    { id: 'stoch', label: 'Stochastic', blurb: 'Stochastic oscillator based on HH/LL.', params: { k:{type:'int',default:14,min:1,max:200}, d:{type:'int',default:3,min:1,max:50}, smooth:{type:'int',default:3,min:1,max:50} }, outputs: ['k','d'] },
    { id: 'atr', label: 'ATR', blurb: 'Average True Range — volatility measure.', params: { length:{type:'int',default:14,min:1,max:400} }, outputs: ['value'] },
    { id: 'bb', label: 'Bollinger Bands', blurb: 'Mean + std-dev envelope around price.', params: { length:{type:'int',default:20,min:2,max:400}, mult:{type:'float',default:2.0,min:0.2,max:10}, source:{type:'enum',default:'close',options:['close','open','high','low']} }, outputs: ['basis','upper','lower'] },
    { id: 'vwap', label: 'VWAP', blurb: 'Volume-Weighted Average Price — fair value anchor.', params: { session:{type:'enum',default:'24h',options:['24h','day','week']} }, outputs: ['value'] },
    { id: 'obv', label: 'OBV', blurb: 'On-Balance Volume — cumulative volume momentum.', params: {}, outputs: ['value'] },
    { id: 'cci', label: 'CCI', blurb: 'Commodity Channel Index — deviation from mean.', params: { length:{type:'int',default:20,min:2,max:400} }, outputs: ['value'] },
    { id: 'adx', label: 'ADX', blurb: 'Average Directional Index — trend strength (0–100).', params: { length:{type:'int',default:14,min:2,max:200} }, outputs: ['value'] },
    { id: 'keltner', label: 'Keltner Channels', blurb: 'EMA envelope using ATR.', params: { length:{type:'int',default:20,min:2,max:400}, atrLen:{type:'int',default:10,min:1,max:400}, mult:{type:'float',default:1.5,min:0.1,max:10} }, outputs: ['basis','upper','lower'] },
    { id: 'donchian', label: 'Donchian Channels', blurb: 'Highest-high/lowest-low channel breakout levels.', params: { upperLen:{type:'int',default:20,min:1,max:400}, lowerLen:{type:'int',default:10,min:1,max:400} }, outputs: ['upper','lower','mid'] },
    { id: 'ichimoku', label: 'Ichimoku', blurb: 'Full trend system (tenkan, kijun, span A/B).', params: { tenkan:{type:'int',default:9,min:1,max:400}, kijun:{type:'int',default:26,min:1,max:400}, spanB:{type:'int',default:52,min:1,max:400} }, outputs: ['tenkan','kijun','spanA','spanB'] },
    { id: 'supertrend', label: 'Supertrend', blurb: 'Volatility-based trailing stop/flip.', params: { atrLen:{type:'int',default:10,min:1,max:400}, mult:{type:'float',default:3.0,min:0.1,max:10} }, outputs: ['line','trend'] },
    { id: 'mfi', label: 'MFI', blurb: 'Money Flow Index — volume-weighted RSI.', params: { length:{type:'int',default:14,min:2,max:200} }, outputs: ['value'] },
    { id: 'roc', label: 'ROC', blurb: 'Rate of Change — momentum % change.', params: { length:{type:'int',default:12,min:1,max:400} }, outputs: ['value'] },
    { id: 'williamsR', label: 'Williams %R', blurb: 'Fast overbought/oversold (-100..0).', params: { length:{type:'int',default:14,min:2,max:200} }, outputs: ['value'] },
    { id: 'psar', label: 'Parabolic SAR', blurb: 'Trend-following dots for entries/trailing.', params: { afStart:{type:'float',default:0.02,min:0,max:1}, afStep:{type:'float',default:0.02,min:0,max:1}, afMax:{type:'float',default:0.2,min:0,max:1} }, outputs: ['value'] },
    { id: 'volma', label: 'Volume MA', blurb: 'Moving average of volume.', params: { period:{type:'int',default:20,min:1,max:400} }, outputs: ['value'] }
  ],
  strategies: [
    { id:'ema_crossover_pro', label:'EMA Crossover Pro', blurb:'Enter when fast EMA crosses above slow EMA; ATR stop + trailing TP.', directionDefault:'long', allowedIndicators:['ema','atr','sma','rsi'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
    { id:'ema200_pullback', label:'EMA200 Pullback', blurb:'Trade only above 200-EMA; buy pullback to EMA20 with RSI > 50.', directionDefault:'long', allowedIndicators:['ema','rsi','atr'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
    { id:'macd_momentum_shift', label:'MACD Momentum Shift', blurb:'Enter on MACD cross up with rising histogram.', directionDefault:'long', allowedIndicators:['macd','ema','atr'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.2,trailingTPPct:0.8} },
    { id:'rsi_breakout', label:'RSI Breakout', blurb:'Buy when RSI exits consolidation and crosses above 55.', directionDefault:'long', allowedIndicators:['rsi','sma','atr','bb'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.0,hardTPPct:1.2} },
    { id:'bb_mean_revert', label:'BB Mean Revert', blurb:'Range play: buy lower Bollinger band touch with RSI filter.', directionDefault:'long', allowedIndicators:['bb','rsi','atr'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:1.6,hardTPPct:1.0} },
    { id:'donchian_breakout', label:'Donchian Breakout', blurb:'Buy 20-bar high break with ATR stop under 10-bar low.', directionDefault:'long', allowedIndicators:['donchian','atr','ema'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.4,trailingTPPct:0.9} },
    { id:'keltner_trend', label:'Keltner Trend', blurb:'Buy close above upper Keltner with ADX > 20.', directionDefault:'long', allowedIndicators:['keltner','adx','ema','atr'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.2,trailingTPPct:0.8} },
    { id:'supertrend_follow', label:'Supertrend Follow', blurb:'Enter when price flips above Supertrend and above 200-EMA.', directionDefault:'long', allowedIndicators:['supertrend','ema','atr'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
    { id:'ichimoku_baseline', label:'Ichimoku Baseline', blurb:'Kumo break with Tenkan > Kijun and price above cloud.', directionDefault:'long', allowedIndicators:['ichimoku','atr','ema'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.5,trailingTPPct:0.9} },
    { id:'adx_swing', label:'ADX Swing', blurb:'Buy pullback to EMA34 when ADX rising > 20.', directionDefault:'long', allowedIndicators:['adx','ema','rsi','atr'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
    { id:'vwap_reclaim', label:'VWAP Reclaim', blurb:'Mean-revert intraday: buy reclaim of anchored VWAP with volume confirmation.', directionDefault:'long', allowedIndicators:['vwap','volma','rsi','atr'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:1.8,hardTPPct:1.1} },
    { id:'psar_flip_trend', label:'PSAR Flip Trend', blurb:'Enter on fresh PSAR flip up with positive EMA slope.', directionDefault:'long', allowedIndicators:['psar','ema','atr'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.1,trailingTPPct:0.8} },
    { id:'roc_momo', label:'ROC Momentum', blurb:'Buy when ROC crosses above 0 and rising, filtered by 200-EMA.', directionDefault:'long', allowedIndicators:['roc','ema','atr'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
    { id:'wr_reversal', label:'Williams %R Reversal', blurb:'Buy when Williams %R exits oversold (<-80 → >-60) near support.', directionDefault:'long', allowedIndicators:['williamsR','sma','atr'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:1.9,hardTPPct:1.0} },
    { id:'cci_turbo', label:'CCI Turbo', blurb:'Buy CCI crossing above -100 with higher-low pattern.', directionDefault:'long', allowedIndicators:['cci','ema','atr'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
    { id:'atr_channel_break', label:'ATR Channel Break', blurb:'Buy breakout above ATR channel.', directionDefault:'long', allowedIndicators:['atr','ema','keltner'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.3,trailingTPPct:0.8} },
    { id:'triple_ema_ribbon', label:'Triple EMA Ribbon', blurb:'Buy when 9/21/55 EMAs are bullishly stacked and rising.', directionDefault:'long', allowedIndicators:['ema','atr','adx'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.1,trailingTPPct:0.8} },
    { id:'vcb_nr7', label:'VCB NR7', blurb:'Volatility Contraction Breakout: NR7/inside-bar break with rising volume.', directionDefault:'long', allowedIndicators:['volma','sma','atr','bb'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.2,hardTPPct:1.3} },
    { id:'obv_trend_confirm', label:'OBV Trend Confirm', blurb:'Buy price HH confirmed by OBV HH; avoid negative divergence.', directionDefault:'long', allowedIndicators:['obv','ema','atr'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.0,trailingTPPct:0.7} },
    { id:'breadth_tilt_hybrid', label:'Breadth Tilt Hybrid', blurb:'Allocate to momentum sleeve when breadth is strong; long-only.', directionDefault:'long', allowedIndicators:['ema','rsi','adx','volma'], allowedOperators:['>','>=','<','<=','==','crosses_above','crosses_below','rising','falling','within','outside'], exitDefaults:{useATRStop:true,atrMult:2.0,hardTPPct:1.2} }
  ]
} as const;

export const ALIASES: Record<string,string> = {
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

export function normalize(x: string) {
  return (x||'').toLowerCase().replace(/[^a-z0-9\s_-]/g,'').replace(/\s+/g,'_').trim();
}