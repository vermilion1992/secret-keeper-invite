// BotForge Type Definitions

export type UserTier = 'basic' | 'pro' | 'expert';

export type MarketType = 'spot' | 'perps';

export type PairTemplate = 'top10' | 'top30' | 'meme' | 'volatility' | 'random' | 'custom';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface IndicatorConfig {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  advanced: boolean;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  tier: UserTier;
  defaultIndicators: IndicatorConfig[];
  canAddFilters: boolean;
}

export interface RiskManagement {
  capitalAllocation: number;
  stopLoss: number;
  takeProfit: number;
  trailingTakeProfit?: number;
  leverageMultiplier?: number;
  percentPerTrade?: number;
}

export interface BacktestParams {
  timeframe: Timeframe;
  maxPeriod: number;
  candleCount: number;
}

export interface BacktestResult {
  roi: number;
  sharpe: number;
  drawdown: number;
  winrate: number;
  avgTrades: number;
  equityCurve: Array<{ date: string; value: number }>;
  tradeDistribution: Array<{ label: string; value: number }>;
}

export interface Bot {
  id: string;
  name: string;
  strategy: Strategy;
  marketType: MarketType;
  pairTemplate: PairTemplate;
  indicators: IndicatorConfig[];
  filterIndicators?: IndicatorConfig[];
  riskManagement: RiskManagement;
  backtestParams: BacktestParams;
  backtestResult?: BacktestResult;
  createdAt: Date;
  isShared: boolean;
  author?: string;
  downloads?: number;
}

export interface WizardStep {
  step: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}

export interface UserProfile {
  tier: UserTier;
  credits: number;
  bots: Bot[];
}

// Candle caps by timeframe
export const CANDLE_CAPS: Record<Timeframe, number> = {
  '1m': 7,
  '5m': 30,
  '15m': 90,
  '1h': 365,
  '4h': 1095,
  '1d': 1095
};

// Motivational liners
export const MOTIVATIONAL_LINERS = [
  "All the insights without the manual grind.",
  "Every great bot starts with a backtest.",
  "Because guessing isn't a strategy.",
  "Your edge begins here.",
  "Save hours, test in seconds.",
  "Transform data into profits.",
  "Your trading strategy, perfected.",
  "Code-free bot building starts now."
];

export const INDICATORS = [
  'EMA', 'SMA', 'RSI', 'MACD', 'ATR', 'Bollinger Bands', 'Stochastic', 'VWAP',
  'OBV', 'CCI', 'Parabolic SAR', 'Ichimoku Cloud', 'Donchian Channels', 
  'Keltner Channels', 'ADX', 'Williams %R', 'Chaikin Money Flow', 'ROC', 
  'Momentum', 'Volume Profile'
];

export const STRATEGIES: Strategy[] = [
  // Basic Tier
  {
    id: 'ema-crossover',
    name: 'EMA Crossover Pro',
    description: 'EMA fast/slow crossovers with trend confirmation',
    tier: 'basic',
    defaultIndicators: [
      { id: '1', name: 'EMA Fast', type: 'EMA', parameters: { period: 12 }, advanced: false },
      { id: '2', name: 'EMA Slow', type: 'EMA', parameters: { period: 26 }, advanced: false }
    ],
    canAddFilters: false
  },
  {
    id: 'rsi-mean-reversion',
    name: 'RSI Mean Reversion',
    description: 'RSI extremes with ATR filter for volatility',
    tier: 'basic',
    defaultIndicators: [
      { id: '1', name: 'RSI', type: 'RSI', parameters: { period: 14 }, advanced: false },
      { id: '2', name: 'ATR', type: 'ATR', parameters: { period: 14 }, advanced: false }
    ],
    canAddFilters: false
  },
  {
    id: 'macd-confirmation',
    name: 'MACD Confirmation',
    description: 'MACD cross aligned with EMA trend',
    tier: 'basic',
    defaultIndicators: [
      { id: '1', name: 'MACD', type: 'MACD', parameters: { fast: 12, slow: 26, signal: 9 }, advanced: false },
      { id: '2', name: 'EMA', type: 'EMA', parameters: { period: 50 }, advanced: false }
    ],
    canAddFilters: false
  },
  {
    id: 'bollinger-bounce',
    name: 'Bollinger Band Bounce',
    description: 'Bollinger bands with RSI confirmation',
    tier: 'basic',
    defaultIndicators: [
      { id: '1', name: 'Bollinger Bands', type: 'BBands', parameters: { period: 20, std: 2 }, advanced: false },
      { id: '2', name: 'RSI', type: 'RSI', parameters: { period: 14 }, advanced: false }
    ],
    canAddFilters: false
  },
  {
    id: 'stochastic-swing',
    name: 'Stochastic Swing Filter',
    description: 'Stochastic oscillator with SMA filter',
    tier: 'basic',
    defaultIndicators: [
      { id: '1', name: 'Stochastic', type: 'Stoch', parameters: { k: 14, d: 3 }, advanced: false },
      { id: '2', name: 'SMA', type: 'SMA', parameters: { period: 50 }, advanced: false }
    ],
    canAddFilters: false
  },
  // Pro Tier
  {
    id: 'atr-trailing',
    name: 'ATR Trailing Stops',
    description: 'EMA trend with ATR-based trailing exits',
    tier: 'pro',
    defaultIndicators: [
      { id: '1', name: 'EMA', type: 'EMA', parameters: { period: 21 }, advanced: false },
      { id: '2', name: 'ATR', type: 'ATR', parameters: { period: 14, multiplier: 2.5 }, advanced: false }
    ],
    canAddFilters: true
  },
  {
    id: 'vwap-trend',
    name: 'VWAP Trend Rider',
    description: 'VWAP with RSI momentum filter',
    tier: 'pro',
    defaultIndicators: [
      { id: '1', name: 'VWAP', type: 'VWAP', parameters: {}, advanced: false },
      { id: '2', name: 'RSI', type: 'RSI', parameters: { period: 14 }, advanced: false }
    ],
    canAddFilters: true
  }
  // Add more strategies as needed
];