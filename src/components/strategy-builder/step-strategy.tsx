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
import { useState } from 'react';

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
    advanced: ['Fast EMA', 'Slow EMA', 'Trend EMA', 'Risk/Reward']
  },
  {
    id: 'rsi-mean-reversion',
    name: 'RSI Mean Reversion',
    tooltip: 'Buy oversold, sell overbought — filtered by volatility.',
    blurb: 'Takes contrarian trades when RSI reaches extreme levels, with an ATR filter to avoid false signals in low-volatility conditions.',
    tier: 'basic' as UserTier,
    icon: Activity,
    tags: ['RSI', 'Mean Reversion', 'ATR'],
    advanced: ['RSI period', 'OB/OS levels', 'ATR threshold']
  },
  {
    id: 'macd-confirmation',
    name: 'MACD Confirmation',
    tooltip: 'MACD cross validated by EMA trend.',
    blurb: 'Uses MACD crosses for entries but only in the direction of the higher timeframe EMA trend, filtering out weak countertrend trades.',
    tier: 'basic' as UserTier,
    icon: BarChart3,
    tags: ['MACD', 'EMA', 'Trend'],
    advanced: ['MACD fast', 'MACD slow', 'Signal', 'EMA filter']
  },
  {
    id: 'bollinger-bounce',
    name: 'Bollinger Band Bounce',
    tooltip: 'Bounce trades at Bollinger extremes with RSI filter.',
    blurb: 'Looks for price bounces from Bollinger Band edges, with RSI confirmation to avoid trades in strong trends.',
    tier: 'basic' as UserTier,
    icon: Waves,
    tags: ['Bollinger', 'RSI', 'Bounce'],
    advanced: ['BB period', 'BB deviation', 'RSI filter']
  },
  {
    id: 'stochastic-swing',
    name: 'Stochastic Swing Filter',
    tooltip: 'Swing trades filtered by Stochastic + SMA.',
    blurb: 'Times entries with the Stochastic oscillator, only when confirmed by a moving average trend filter.',
    tier: 'basic' as UserTier,
    icon: LineChart,
    tags: ['Stochastic', 'SMA', 'Swing'],
    advanced: ['Stoch length', 'OB/OS levels', 'SMA length']
  },
  {
    id: 'vwap-trend-rider',
    name: 'VWAP Trend Rider',
    tooltip: 'VWAP trend with EMA slope filter.',
    blurb: 'Captures intraday trends using VWAP alignment and EMA slope confirmation, reducing false breakouts.',
    tier: 'pro' as UserTier,
    icon: Target,
    tags: ['VWAP', 'EMA', 'Intraday'],
    advanced: ['VWAP lookback', 'EMA slope', 'Stop distance']
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
    advanced: ['Lookback', 'K value', 'Volatility target %']
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
  }
];

export function StepStrategy({ selected, onSelect, onNext, userTier }: StepStrategyProps) {
  const [advancedSettings, setAdvancedSettings] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);

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
          className={`relative cursor-pointer transition-all duration-200 hover:shadow-md border ${
            isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
          } ${isLocked ? 'opacity-60' : ''}`}
          onClick={() => !isLocked && onSelect({ 
            id: strategy.id, 
            name: strategy.name, 
            description: strategy.tooltip,
            tier: strategy.tier,
            defaultIndicators: [],
            canAddFilters: strategy.tier !== 'basic'
          })}
        >
          {isLocked && (
            <div className="absolute top-2 right-2 z-10">
              <Tooltip>
                <TooltipTrigger>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upgrade to unlock this option</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="font-medium text-sm leading-tight truncate">
                      {strategy.name}
                      <Info className="inline h-3 w-3 ml-1 text-muted-foreground" />
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>{strategy.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
                <Badge variant="outline" className="text-xs mt-1">{strategy.tier}</Badge>
              </div>
              {!isLocked && (
                <Checkbox
                  checked={advancedSettings[strategy.id] || false}
                  onCheckedChange={(checked) => 
                    setAdvancedSettings(prev => ({ ...prev, [strategy.id]: !!checked }))
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-2">
            <div className="flex flex-wrap gap-1">
              {strategy.tags.slice(0, 3).map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {isSelected && (
              <div className="mt-3 p-2 bg-muted/30 rounded text-xs text-muted-foreground">
                {strategy.blurb}
              </div>
            )}
            
            {advancedSettings[strategy.id] && !isLocked && (
              <div className="mt-2 text-xs text-muted-foreground">
                <p className="font-medium mb-1">Advanced Settings:</p>
                <p>{strategy.advanced.join(', ')}</p>
              </div>
            )}
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
          className={`relative cursor-pointer transition-all duration-200 hover:shadow-md border ${
            'border-border hover:border-primary/30'
          } ${isLocked ? 'opacity-60' : ''}`}
        >
          {isLocked && (
            <div className="absolute top-2 right-2 z-10">
              <Tooltip>
                <TooltipTrigger>
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upgrade to unlock this option</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="font-medium text-sm leading-tight truncate">
                      {indicator.name}
                      <Info className="inline h-3 w-3 ml-1 text-muted-foreground" />
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>{indicator.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
                <Badge variant="outline" className="text-xs mt-1">{indicator.tier}</Badge>
              </div>
              {!isLocked && (
                <Checkbox
                  checked={advancedSettings[indicator.id] || false}
                  onCheckedChange={(checked) => 
                    setAdvancedSettings(prev => ({ ...prev, [indicator.id]: !!checked }))
                  }
                />
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-2">
            <div className="text-xs text-muted-foreground">
              {indicator.blurb}
            </div>
            
            {advancedSettings[indicator.id] && !isLocked && (
              <div className="mt-2 text-xs text-muted-foreground">
                <p className="font-medium mb-1">Advanced:</p>
                <p>{indicator.advanced.join(', ')}</p>
              </div>
            )}
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
          <ScrollArea 
            className="h-[420px] pr-4" 
            style={{ 
              scrollbarWidth: 'auto',
              scrollbarColor: 'hsl(var(--primary)) hsl(var(--background))'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accessibleStrategies.map((strategy) => renderStrategyTile(strategy))}
              {lockedStrategies.map((strategy) => renderStrategyTile(strategy, true))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="indicators" className="space-y-4">
          <ScrollArea 
            className="h-[420px] pr-4"
            style={{ 
              scrollbarWidth: 'auto',
              scrollbarColor: 'hsl(var(--primary)) hsl(var(--background))'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accessibleIndicators.map((indicator) => renderIndicatorTile(indicator))}
              {lockedIndicators.map((indicator) => renderIndicatorTile(indicator, true))}
            </div>
          </ScrollArea>
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
