import { Strategy, STRATEGIES, UserTier, IndicatorConfig } from '@/types/botforge';
import { canAccessStrategy } from '@/lib/tier-access';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Lock, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Zap, 
  Target, 
  Shield, 
  Waves,
  LineChart,
  PieChart,
  Gauge,
  Settings,
  Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface StepStrategyProps {
  selected: Strategy | null;
  onSelect: (strategy: Strategy) => void;
  onNext: () => void;
  userTier: UserTier;
}

// Enhanced strategy data with all 20 strategies
const ENHANCED_STRATEGIES = [
  {
    id: 'ema-crossover-pro',
    name: 'EMA Crossover Pro',
    tooltip: 'Classic moving average crossover with trend filter.',
    blurb: 'Combines fast and slow EMAs to capture trend shifts, with confirmation from longer-term trend direction. Best for trending markets.',
    tier: 'basic' as UserTier,
    icon: TrendingUp,
    tags: ['EMA', 'Trend', 'Classic'],
    advanced: ['Fast EMA length', 'Slow EMA length', 'Trend EMA length', 'Risk/Reward ratio']
  },
  {
    id: 'rsi-mean-reversion',
    name: 'RSI Mean Reversion',
    tooltip: 'Buy oversold, sell overbought — filtered by volatility.',
    blurb: 'Takes contrarian trades when RSI reaches extreme levels, with an ATR filter to avoid false signals in low-volatility conditions.',
    tier: 'basic' as UserTier,
    icon: Activity,
    tags: ['RSI', 'Mean Reversion', 'ATR'],
    advanced: ['RSI period', 'Overbought/oversold levels', 'ATR threshold', 'Stop-loss method']
  },
  {
    id: 'macd-confirmation',
    name: 'MACD Confirmation',
    tooltip: 'MACD cross validated by EMA trend.',
    blurb: 'Uses MACD crosses for entries but only in the direction of the higher timeframe EMA trend, filtering out weak countertrend trades.',
    tier: 'basic' as UserTier,
    icon: BarChart3,
    tags: ['MACD', 'EMA', 'Trend'],
    advanced: ['MACD fast', 'MACD slow', 'MACD signal', 'EMA filter']
  },
  {
    id: 'bollinger-bounce',
    name: 'Bollinger Band Bounce',
    tooltip: 'Bounce trades at Bollinger extremes with RSI filter.',
    blurb: 'Looks for price bounces from Bollinger Band edges, with RSI confirmation to avoid trades in strong trends.',
    tier: 'basic' as UserTier,
    icon: Waves,
    tags: ['Bollinger', 'RSI', 'Bounce'],
    advanced: ['BB period', 'BB deviation', 'RSI filter', 'Exit method']
  },
  {
    id: 'stochastic-swing',
    name: 'Stochastic Swing Filter',
    tooltip: 'Swing trades filtered by Stochastic + SMA.',
    blurb: 'Times entries with the Stochastic oscillator, only when confirmed by a moving average trend filter.',
    tier: 'basic' as UserTier,
    icon: LineChart,
    tags: ['Stochastic', 'SMA', 'Swing'],
    advanced: ['Stoch length', 'Stoch OB/OS levels', 'SMA length']
  },
  {
    id: 'vwap-trend-rider',
    name: 'VWAP Trend Rider',
    tooltip: 'VWAP trend with EMA slope filter.',
    blurb: 'Captures intraday trends using VWAP alignment and EMA slope confirmation, reducing false breakouts.',
    tier: 'pro' as UserTier,
    icon: Target,
    tags: ['VWAP', 'EMA', 'Intraday'],
    advanced: ['VWAP lookback', 'EMA slope length', 'Stop distance']
  },
  {
    id: 'atr-trailing-stops',
    name: 'ATR Trailing Stops',
    tooltip: 'Dynamic stop loss based on volatility.',
    blurb: 'Uses ATR multipliers to trail stops as volatility changes, locking in profits on strong moves.',
    tier: 'pro' as UserTier,
    icon: Shield,
    tags: ['ATR', 'Trailing', 'Volatility'],
    advanced: ['ATR length', 'ATR multiplier', 'Trail step']
  },
  {
    id: 'momentum-king',
    name: 'Momentum King',
    tooltip: 'Ranks assets by momentum score + volume.',
    blurb: 'Trades only the strongest movers by combining momentum ranking and volume confirmation. Ideal for capturing explosive trends.',
    tier: 'pro' as UserTier,
    icon: Zap,
    tags: ['Momentum', 'Volume', 'Ranking'],
    advanced: ['Momentum lookback', 'Volume filter', 'Max positions']
  },
  {
    id: 'vol-spike-breakout',
    name: 'Vol Spike Breakout',
    tooltip: 'Entry after unusual volume spikes.',
    blurb: 'Waits for sudden volume spikes and confirms with breakout levels to capture sharp expansions in volatility.',
    tier: 'pro' as UserTier,
    icon: Activity,
    tags: ['Volume', 'Breakout', 'Spike'],
    advanced: ['Volume multiplier', 'Breakout lookback', 'ATR filter']
  },
  {
    id: 'breadth-monitor',
    name: 'Breadth Monitor',
    tooltip: 'Market-wide strength filter.',
    blurb: 'Measures the % of assets above a moving average. Trades only when market breadth confirms strength.',
    tier: 'expert' as UserTier,
    icon: PieChart,
    tags: ['Breadth', 'Market', 'Filter'],
    advanced: ['Breadth lookback', 'MA length', 'Threshold %']
  },
  {
    id: 'k-strength-divergence',
    name: 'K-Strength Divergence',
    tooltip: 'Custom K-strength divergence with RSI.',
    blurb: 'Tracks divergences between K-strength momentum and RSI, signaling potential reversals.',
    tier: 'expert' as UserTier,
    icon: Gauge,
    tags: ['Divergence', 'K-Strength', 'RSI'],
    advanced: ['K period', 'RSI period', 'Divergence sensitivity']
  },
  {
    id: 'turbo-k6',
    name: 'Turbo K6',
    tooltip: 'Multi-layer breakout system with volatility targeting.',
    blurb: 'Combines layered momentum filters with volatility targeting and rebalance rules. Designed for aggressive trend riding.',
    tier: 'expert' as UserTier,
    icon: Zap,
    tags: ['Breakout', 'Volatility', 'Aggressive'],
    advanced: ['Lookback', 'K value', 'Volatility target %', 'Exit rules']
  },
  {
    id: 'echo-market-neutral',
    name: 'Echo Market Neutral',
    tooltip: 'Long leaders, short laggards.',
    blurb: 'Pairs long positions in top momentum assets with shorts in weak assets. Market-neutral by design.',
    tier: 'expert' as UserTier,
    icon: Target,
    tags: ['Market Neutral', 'Long/Short', 'Momentum'],
    advanced: ['Ranking length', '# longs', '# shorts', 'Rebalance freq']
  },
  {
    id: 'echo-hybrid',
    name: 'Echo Hybrid',
    tooltip: 'Blend of Turbo K6 + Market Neutral.',
    blurb: 'Dynamically allocates between Turbo K6 and Market Neutral depending on market breadth.',
    tier: 'expert' as UserTier,
    icon: Settings,
    tags: ['Hybrid', 'Dynamic', 'Allocation'],
    advanced: ['Allocation %', 'Breadth triggers', 'Rebalance freq']
  },
  {
    id: 'breakout-pullback',
    name: 'Breakout Pullback',
    tooltip: 'Entry on breakout + RSI pullback.',
    blurb: 'Enters after breakout confirmation, but only after an RSI pullback avoids chasing.',
    tier: 'pro' as UserTier,
    icon: TrendingUp,
    tags: ['Breakout', 'Pullback', 'RSI'],
    advanced: ['Breakout length', 'RSI filter', 'ATR stop']
  },
  {
    id: 'range-reversal',
    name: 'Range Reversal',
    tooltip: 'Fade extremes inside ranges.',
    blurb: 'Looks for price reversals inside trading ranges using Bollinger + RSI.',
    tier: 'basic' as UserTier,
    icon: Waves,
    tags: ['Range', 'Reversal', 'Bollinger'],
    advanced: ['BB period', 'RSI filter', 'Stop method']
  },
  {
    id: 'trend-following-core',
    name: 'Trend Following Core',
    tooltip: 'Simple EMA trend with MACD filter.',
    blurb: 'Classic trend following. EMA slope + MACD confirmation keep trades aligned with strong moves.',
    tier: 'basic' as UserTier,
    icon: LineChart,
    tags: ['Trend', 'EMA', 'MACD'],
    advanced: ['EMA length', 'MACD fast/slow/signal', 'Exit method']
  },
  {
    id: 'multi-confirm-swing',
    name: 'Multi-Confirm Swing',
    tooltip: 'RSI + MACD + Stoch triple filter.',
    blurb: 'Requires alignment of three major oscillators before entry, reducing noise but fewer signals.',
    tier: 'pro' as UserTier,
    icon: Activity,
    tags: ['Multi-confirm', 'Oscillators', 'Swing'],
    advanced: ['RSI length', 'MACD settings', 'Stoch settings']
  },
  {
    id: 'support-resistance-bounce',
    name: 'Support/Resistance Bounce',
    tooltip: 'Trades bounces at key levels.',
    blurb: 'Enters trades when price respects S/R zones, confirmed with volume filters.',
    tier: 'pro' as UserTier,
    icon: BarChart3,
    tags: ['S/R', 'Bounce', 'Volume'],
    advanced: ['S/R lookback', 'Volume threshold', 'Stop size']
  },
  {
    id: 'high-volatility-rider',
    name: 'High Volatility Rider',
    tooltip: 'Focus on high-volatility assets.',
    blurb: 'Targets volatile coins, scaling size by ATR and volatility ranks to ride explosive trends.',
    tier: 'expert' as UserTier,
    icon: Zap,
    tags: ['Volatility', 'ATR', 'Explosive'],
    advanced: ['ATR length', 'Vol rank %', 'Position cap']
  }
];

// Enhanced indicator data with all 20 indicators
const ENHANCED_INDICATORS = [
  {
    id: 'ema',
    name: 'EMA',
    tooltip: 'Exponential Moving Average.',
    blurb: 'Smooths price data, reacting faster to changes than a simple MA.',
    icon: TrendingUp,
    tier: 'basic' as UserTier,
    advanced: ['Length']
  },
  {
    id: 'sma',
    name: 'SMA',
    tooltip: 'Simple Moving Average.',
    blurb: 'Basic moving average of past prices, used for long-term trend confirmation.',
    icon: LineChart,
    tier: 'basic' as UserTier,
    advanced: ['Length']
  },
  {
    id: 'rsi',
    name: 'RSI',
    tooltip: 'Relative Strength Index.',
    blurb: 'Momentum oscillator showing overbought/oversold conditions.',
    icon: Activity,
    tier: 'basic' as UserTier,
    advanced: ['Period', 'OB/OS levels']
  },
  {
    id: 'macd',
    name: 'MACD',
    tooltip: 'Moving Average Convergence Divergence.',
    blurb: 'Tracks momentum by comparing two EMAs, with signal crossovers.',
    icon: BarChart3,
    tier: 'basic' as UserTier,
    advanced: ['Fast', 'Slow', 'Signal']
  },
  {
    id: 'atr',
    name: 'ATR',
    tooltip: 'Average True Range.',
    blurb: 'Measures volatility by averaging true range values.',
    icon: Gauge,
    tier: 'basic' as UserTier,
    advanced: ['Period', 'Multiplier']
  },
  {
    id: 'bollinger-bands',
    name: 'Bollinger Bands',
    tooltip: 'Bands around SMA using volatility.',
    blurb: 'Shows volatility envelopes that expand/contract with market conditions.',
    icon: Waves,
    tier: 'basic' as UserTier,
    advanced: ['Period', 'StdDev']
  },
  {
    id: 'stochastic',
    name: 'Stochastic',
    tooltip: 'Momentum oscillator.',
    blurb: 'Shows where price sits relative to recent highs/lows.',
    icon: Activity,
    tier: 'pro' as UserTier,
    advanced: ['%K', '%D', 'OB/OS']
  },
  {
    id: 'vwap',
    name: 'VWAP',
    tooltip: 'Volume Weighted Average Price.',
    blurb: 'Combines price and volume for intraday mean value.',
    icon: Target,
    tier: 'pro' as UserTier,
    advanced: ['Session length']
  },
  {
    id: 'obv',
    name: 'OBV',
    tooltip: 'On Balance Volume.',
    blurb: 'Uses volume flow to confirm price trends.',
    icon: BarChart3,
    tier: 'basic' as UserTier,
    advanced: ['None (basic)']
  },
  {
    id: 'cci',
    name: 'CCI',
    tooltip: 'Commodity Channel Index.',
    blurb: 'Oscillator for cyclical market trends.',
    icon: Activity,
    tier: 'pro' as UserTier,
    advanced: ['Period']
  },
  {
    id: 'momentum',
    name: 'Momentum',
    tooltip: 'Simple momentum measure.',
    blurb: 'Compares recent price to past price for directional strength.',
    icon: TrendingUp,
    tier: 'basic' as UserTier,
    advanced: ['Period']
  },
  {
    id: 'roc',
    name: 'ROC',
    tooltip: 'Rate of Change.',
    blurb: 'Percentage change between current and past price.',
    icon: LineChart,
    tier: 'basic' as UserTier,
    advanced: ['Period']
  },
  {
    id: 'adx',
    name: 'ADX',
    tooltip: 'Average Directional Index.',
    blurb: 'Measures trend strength, not direction.',
    icon: Gauge,
    tier: 'pro' as UserTier,
    advanced: ['Period']
  },
  {
    id: 'williams-r',
    name: 'Williams %R',
    tooltip: 'Momentum oscillator.',
    blurb: 'Shows overbought/oversold relative to highs/lows.',
    icon: Activity,
    tier: 'pro' as UserTier,
    advanced: ['Period']
  },
  {
    id: 'parabolic-sar',
    name: 'Parabolic SAR',
    tooltip: 'Stop-and-reverse system.',
    blurb: 'Plots trailing stops that flip when trend reverses.',
    icon: Target,
    tier: 'expert' as UserTier,
    advanced: ['Step', 'Max']
  },
  {
    id: 'vw-macd',
    name: 'VW-MACD',
    tooltip: 'Volume-Weighted MACD.',
    blurb: 'Adds volume weighting to MACD signals.',
    icon: BarChart3,
    tier: 'expert' as UserTier,
    advanced: ['Fast', 'Slow', 'Signal']
  },
  {
    id: 'chaikin-money-flow',
    name: 'Chaikin Money Flow',
    tooltip: 'Tracks buying/selling pressure.',
    blurb: 'Volume-weighted oscillator to confirm accumulation/distribution.',
    icon: Waves,
    tier: 'pro' as UserTier,
    advanced: ['Period']
  },
  {
    id: 'supertrend',
    name: 'Supertrend',
    tooltip: 'Trend-following overlay.',
    blurb: 'Plots trailing stops based on ATR, flipping when trend reverses.',
    icon: TrendingUp,
    tier: 'expert' as UserTier,
    advanced: ['ATR length', 'Multiplier']
  },
  {
    id: 'dmi',
    name: 'DMI',
    tooltip: 'Directional Movement Index.',
    blurb: 'Shows positive/negative directional trends.',
    icon: LineChart,
    tier: 'expert' as UserTier,
    advanced: ['Period']
  },
  {
    id: 'keltner-channels',
    name: 'Keltner Channels',
    tooltip: 'ATR-based volatility bands.',
    blurb: 'Volatility channels built around EMA, good for trend detection.',
    icon: Waves,
    tier: 'expert' as UserTier,
    advanced: ['EMA length', 'ATR multiplier']
  }
];

export function StepStrategy({ selected, onSelect, onNext, userTier }: StepStrategyProps) {
  const [expandedItem, setExpandedItem] = useState<any>(null);

  const openModal = (item: any) => {
    setExpandedItem(item);
    // Lock body scroll
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setExpandedItem(null);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const accessibleStrategies = ENHANCED_STRATEGIES.filter((s) => {
    if (userTier === 'expert') return true;
    if (userTier === 'pro') return s.tier === 'basic' || s.tier === 'pro';
    return s.tier === 'basic';
  });

  const lockedStrategies = ENHANCED_STRATEGIES.filter((s) => {
    if (userTier === 'expert') return false;
    if (userTier === 'pro') return s.tier === 'expert';
    return s.tier !== 'basic';
  });

  const accessibleIndicators = ENHANCED_INDICATORS.filter((i) => {
    if (userTier === 'expert') return true;
    if (userTier === 'pro') return i.tier === 'basic' || i.tier === 'pro';
    return i.tier === 'basic';
  });

  const lockedIndicators = ENHANCED_INDICATORS.filter((i) => {
    if (userTier === 'expert') return false;
    if (userTier === 'pro') return i.tier === 'expert';
    return i.tier !== 'basic';
  });

  const renderStrategyTile = (strategy: any, isLocked = false) => {
    const Icon = strategy.icon;
    const isSelected = selected?.id === strategy.id;

    return (
      <TooltipProvider key={strategy.id}>
        <Card 
          className={`relative cursor-pointer transition-all duration-200 hover:shadow-md border hover-scale ${
            isLocked ? 'opacity-60 cursor-not-allowed' : isSelected
            ? 'ring-2 ring-success border-success bg-success/10'
            : 'hover:border-primary hover:bg-primary/10'
          }`}
          onClick={() => !isLocked && openModal({...strategy, type: 'strategy'})}
        >
          {isLocked && (
            <div className="absolute top-2 right-2 z-10">
              <Tooltip>
                <TooltipTrigger>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="z-50" sideOffset={5}>
                  <p>Upgrade to unlock this option</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 flex-shrink-0 ${isSelected ? 'text-success' : 'text-primary'}`} />
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div className="flex items-center gap-1 min-w-0">
                  <h3 className="font-medium text-sm leading-tight truncate">
                    {strategy.name}
                  </h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs z-[1000] pointer-events-none" sideOffset={8}>
                      <p>{strategy.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
            <Badge variant="default" className="text-xs font-semibold uppercase w-fit">{strategy.tier} TIER</Badge>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-2">
            <div className="flex flex-wrap gap-1">
              {strategy.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  };

  const renderIndicatorTile = (indicator: any, isLocked = false) => {
    const Icon = indicator.icon;
    
    return (
      <TooltipProvider key={indicator.id}>
        <Card 
          className={`relative cursor-pointer transition-all duration-200 hover:shadow-md border hover-scale ${
            isLocked ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/10'
          }`}
          onClick={() => !isLocked && openModal({...indicator, type: 'indicator'})}
        >
          {isLocked && (
            <div className="absolute top-2 right-2 z-10">
              <Tooltip>
                <TooltipTrigger>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="z-50" sideOffset={5}>
                  <p>Upgrade to unlock this option</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div className="flex items-center gap-1 min-w-0">
                  <h3 className="font-medium text-sm leading-tight truncate">
                    {indicator.name}
                  </h3>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs z-[1000] pointer-events-none" sideOffset={8}>
                      <p>{indicator.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
            <Badge variant="default" className="text-xs font-semibold uppercase w-fit">{indicator.tier} TIER</Badge>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-2">
            {/* No content for indicators for now */}
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Choose a strategy</h2>
          <p className="text-muted-foreground text-sm">Strategies come with pre-configured indicators you can tweak later.</p>
        </div>
        <Badge variant="secondary" className="uppercase">{userTier} tier</Badge>
      </header>

      {/* Centered Modal with Animation, Blur and Particles */}
      {expandedItem && createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            overflow: 'hidden'
          }}
          onClick={closeModal}
        >
          {/* Constellation Background Effect */}
          <div className="absolute inset-0 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-70 pointer-events-none">
              {/* Generate constellation stars */}
              {[...Array(40)].map((_, i) => {
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const size = 1.5 + Math.random() * 2.5;
                return (
                  <circle
                    key={`star-${i}`}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r={size}
                    fill="hsl(0 0% 100% / 0.9)"
                    className="animate-pulse"
                    style={{
                      animationDelay: `${Math.random() * 4}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                      filter: 'drop-shadow(0 0 6px hsl(var(--primary)))'
                    }}
                  />
                );
              })}
              
              {/* Generate connecting lines */}
              {[...Array(8)].map((_, i) => {
                const x1 = Math.random() * 100;
                const y1 = Math.random() * 100;
                const x2 = x1 + (Math.random() - 0.5) * 30;
                const y2 = y1 + (Math.random() - 0.5) * 30;
                return (
                  <line
                    key={`line-${i}`}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${Math.max(0, Math.min(100, x2))}%`}
                    y2={`${Math.max(0, Math.min(100, y2))}%`}
                    stroke="hsl(var(--primary) / 0.3)"
                    strokeWidth="1"
                    className="opacity-60"
                    style={{
                      animation: 'constellation-pulse 8s ease-in-out infinite',
                      animationDelay: `${Math.random() * 3}s`
                    }}
                  />
                );
              })}
            </svg>
          </div>
          
          <div
            className="bg-white dark:bg-gray-900 border border-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto animate-scale-in relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {(() => { const Icon = expandedItem.icon; return <Icon className="h-6 w-6 text-primary" />; })()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {expandedItem.name}
                    </h2>
                    <Badge variant="default" className="text-sm font-semibold uppercase">
                      {expandedItem.tier} TIER
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {expandedItem.blurb}
              </p>

              {expandedItem.tags && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2 text-sm">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {expandedItem.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {expandedItem.advanced && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2 text-sm">Advanced Settings:</h4>
                  <div className="text-sm text-muted-foreground">
                    {expandedItem.advanced.join(', ')}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    if (expandedItem.type === 'strategy') {
                      onSelect({ 
                        id: expandedItem.id, 
                        name: expandedItem.name, 
                        description: expandedItem.tooltip,
                        tier: expandedItem.tier,
                        defaultIndicators: [],
                        canAddFilters: expandedItem.tier !== 'basic'
                      });
                    }
                    closeModal();
                  }}
                  className="flex-1"
                >
                  Select {expandedItem.type === 'strategy' ? 'Strategy' : 'Indicator'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Clear selection on cancel if this was the selected item
                    if (selected?.id === expandedItem.id) {
                      onSelect(null);
                    }
                    closeModal();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <Tabs defaultValue="strategies" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="strategies" className="gap-2">
            📊 Strategies ({accessibleStrategies.length})
          </TabsTrigger>
          <TabsTrigger value="indicators" className="gap-2">
            ⚙️ Indicators ({accessibleIndicators.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessibleStrategies.map((strategy) => renderStrategyTile(strategy))}
            {lockedStrategies.map((strategy) => renderStrategyTile(strategy, true))}
          </div>
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessibleIndicators.map((indicator) => renderIndicatorTile(indicator))}
            {lockedIndicators.map((indicator) => renderIndicatorTile(indicator, true))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={() => onNext()} disabled={!selected}>
          Continue
        </Button>
      </div>
    </div>
  );
}
