import { Strategy, IndicatorConfig, UserTier } from '@/types/botforge';
import { getTierAccess } from '@/lib/tier-access';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ChevronDown, Settings, TrendingUp, BarChart3, Target, AlertTriangle, Search, Plus, X, Filter, RotateCcw, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StepAdvancedSettingsProps {
  strategy: Strategy | null;
  filterIndicators: IndicatorConfig[];
  onUpdateFilters: (filters: IndicatorConfig[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  userTier: UserTier;
}

interface EntryCondition {
  id: string;
  operator: string;
  leftOperand: string;
  rightOperand: string;
  enabled: boolean;
}

export function StepAdvancedSettings({ 
  strategy, 
  filterIndicators, 
  onUpdateFilters, 
  onNext, 
  onPrevious,
  userTier 
}: StepAdvancedSettingsProps) {
  const [isAdvancedStrategyOpen, setIsAdvancedStrategyOpen] = useState(false);
  const [isAdvancedExitOpen, setIsAdvancedExitOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Entry conditions - tile-based approach  
  const [entryConditions, setEntryConditions] = useState<EntryCondition[]>([
    { id: '1', operator: 'crosses_above', leftOperand: 'EMA Fast', rightOperand: 'EMA Slow', enabled: true }
  ]);
  const [entryLogic, setEntryLogic] = useState('all_true'); // 'all_true' or 'any_true'
  const [entryDirection, setEntryDirection] = useState('both'); // 'long', 'short', 'both'
  const [entryInverse, setEntryInverse] = useState(false);
  
  // Strategy settings
  const [strategySettings, setStrategySettings] = useState({
    emaFast: 20,
    emaSlow: 50,
    rsiLength: 14,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    cciLength: 20,
    atrLength: 14,
    bbPeriod: 20,
    // Advanced strategy settings
    maType: 'EMA',
    rsiOverbought: 70,
    rsiOversold: 30,
    reentryBars: 1,
    confirmBars: 1,
    oneTradePerSession: false
  });

  // Filters
  const [filtersSettings, setFiltersSettings] = useState({
    htfFilter: false,
    htfTimeframe: '1d',
    htfUseBtc: true, // Default to BTC/USDT daily EMA 200
    volumeFilter: false,
    volumeThreshold: 1.5,
    atrFilter: false,
    atrThreshold: 1.0
  });

  const [exitSettings, setExitSettings] = useState({
    stopLoss: 5.0,
    takeProfit: 10.0,
    // Multi-TP settings
    multiTpEnabled: false,
    tp1: 5.0,
    tp1Allocation: 33,
    tp2: 10.0,
    tp2Allocation: 33,
    tp3: 15.0,
    tp3Allocation: 34,
    tp1TrailingEnabled: false,
    tp2TrailingEnabled: false,
    tp3TrailingEnabled: false,
    // Break-even settings
    breakEvenEnabled: false,
    breakEvenTrigger: 2.0,
    breakEvenOffset: 0.1,
    // Trailing settings
    trailingType: 'none',
    trailingPercent: 2.0,
    trailingAtr: 1.5,
    // ATR stop loss
    atrStopEnabled: false,
    atrMultiplier: 2.0,
    // Time-based exit
    timeExitType: 'none',
    timeExitCandles: 24,
    // Exit priority
    exitPriority: 'tp_first'
  });

  // Default settings for reset functions
  const defaultStrategySettings = {
    emaFast: 20,
    emaSlow: 50,
    rsiLength: 14,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    cciLength: 20,
    atrLength: 14,
    bbPeriod: 20,
    maType: 'EMA',
    rsiOverbought: 70,
    rsiOversold: 30,
    reentryBars: 1,
    confirmBars: 1,
    oneTradePerSession: false
  };

  const defaultFiltersSettings = {
    htfFilter: false,
    htfTimeframe: '1d',
    htfUseBtc: true,
    volumeFilter: false,
    volumeThreshold: 1.5,
    atrFilter: false,
    atrThreshold: 1.0
  };

  const defaultExitSettings = {
    stopLoss: 5.0,
    takeProfit: 10.0,
    multiTpEnabled: false,
    tp1: 5.0,
    tp1Allocation: 33,
    tp2: 10.0,
    tp2Allocation: 33,
    tp3: 15.0,
    tp3Allocation: 34,
    tp1TrailingEnabled: false,
    tp2TrailingEnabled: false,
    tp3TrailingEnabled: false,
    breakEvenEnabled: false,
    breakEvenTrigger: 2.0,
    breakEvenOffset: 0.1,
    trailingType: 'none',
    trailingPercent: 2.0,
    trailingAtr: 1.5,
    atrStopEnabled: false,
    atrMultiplier: 2.0,
    timeExitType: 'none',
    timeExitCandles: 24,
    exitPriority: 'tp_first'
  };

  // Load configuration from JSON file
  const [strategyConfig, setStrategyConfig] = useState<any>(null);
  
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/botforge_combined_config.json');
        const config = await response.json();
        setStrategyConfig(config);
      } catch (error) {
        console.error('Failed to load strategy config:', error);
        // Fallback to inline config if JSON fails
        setStrategyConfig({ strategies: FALLBACK_CONFIG });
      }
    };
    loadConfig();
  }, []);

  // Fallback configuration in case JSON fails to load
  const FALLBACK_CONFIG: Record<string, { 
    indicators: string[], 
    entryTiles: Array<{ id: string, name: string, operands: string[], defaultSeeds?: any }> 
  }> = {
    'EMA Crossover Pro': {
      indicators: ['ema'],
      entryTiles: [
        { 
          id: 'ema_cross_up', 
          name: 'EMA Cross Up', 
          operands: ['EMA Fast', 'EMA Slow'],
          defaultSeeds: { operator: 'crosses_above', leftOperand: 'EMA Fast', rightOperand: 'EMA Slow' }
        },
        { 
          id: 'ema_cross_down', 
          name: 'EMA Cross Down', 
          operands: ['EMA Fast', 'EMA Slow'],
          defaultSeeds: { operator: 'crosses_below', leftOperand: 'EMA Fast', rightOperand: 'EMA Slow' }
        }
      ]
    },
    'SMA Crossover': {
      indicators: ['sma'],
      entryTiles: [
        { 
          id: 'sma_cross_up', 
          name: 'SMA Cross Up', 
          operands: ['SMA Fast', 'SMA Slow'],
          defaultSeeds: { operator: 'crosses_above', leftOperand: 'SMA Fast', rightOperand: 'SMA Slow' }
        }
      ]
    },
    'RSI Bias': {
      indicators: ['rsi'],
      entryTiles: [
        { 
          id: 'rsi_oversold', 
          name: 'RSI Oversold', 
          operands: ['RSI', 'RSI Oversold'],
          defaultSeeds: { operator: 'crosses_below', leftOperand: 'RSI', rightOperand: 'RSI Oversold' }
        },
        { 
          id: 'rsi_overbought', 
          name: 'RSI Overbought', 
          operands: ['RSI', 'RSI Overbought'],
          defaultSeeds: { operator: 'crosses_above', leftOperand: 'RSI', rightOperand: 'RSI Overbought' }
        }
      ]
    },
    'MACD Cross': {
      indicators: ['macd'],
      entryTiles: [
        { 
          id: 'macd_bullish', 
          name: 'MACD Bullish', 
          operands: ['MACD Line', 'MACD Signal'],
          defaultSeeds: { operator: 'crosses_above', leftOperand: 'MACD Line', rightOperand: 'MACD Signal' }
        },
        { 
          id: 'macd_bearish', 
          name: 'MACD Bearish', 
          operands: ['MACD Line', 'MACD Signal'],
          defaultSeeds: { operator: 'crosses_below', leftOperand: 'MACD Line', rightOperand: 'MACD Signal' }
        }
      ]
    },
    'MACD + RSI Swing': {
      indicators: ['macd', 'rsi'],
      entryTiles: [
        { 
          id: 'macd_cross_up', 
          name: 'MACD Cross Up', 
          operands: ['MACD Line', 'MACD Signal'],
          defaultSeeds: { operator: 'crosses_above', leftOperand: 'MACD Line', rightOperand: 'MACD Signal' }
        },
        { 
          id: 'rsi_not_extreme', 
          name: 'RSI Not Extreme', 
          operands: ['RSI', 'RSI Overbought', 'RSI Oversold'],
          defaultSeeds: { operator: 'is_below', leftOperand: 'RSI', rightOperand: 'RSI Overbought' }
        }
      ]
    },
    'Hybrid Momentum': {
      indicators: ['ema', 'rsi', 'macd', 'breadth'],
      entryTiles: [
        { 
          id: 'ema_trend_up', 
          name: 'EMA Trend Up', 
          operands: ['EMA Fast', 'EMA Slow'],
          defaultSeeds: { operator: 'is_above', leftOperand: 'EMA Fast', rightOperand: 'EMA Slow' }
        },
        { 
          id: 'rsi_momentum', 
          name: 'RSI Momentum', 
          operands: ['RSI', 'RSI_50'],
          defaultSeeds: { operator: 'is_above', leftOperand: 'RSI', rightOperand: 'RSI_50' }
        },
        { 
          id: 'macd_positive', 
          name: 'MACD Positive', 
          operands: ['MACD Line', 'MACD Signal'],
          defaultSeeds: { operator: 'is_above', leftOperand: 'MACD Line', rightOperand: 'MACD Signal' }
        },
        { 
          id: 'breadth_ok', 
          name: 'Market Breadth OK', 
          operands: ['Breadth_ok'],
          defaultSeeds: { operator: 'is_true', leftOperand: 'Breadth_ok', rightOperand: '' }
        }
      ]
    },
    'Market Breadth Gate': {
      indicators: ['breadth'],
      entryTiles: [
        { 
          id: 'breadth_positive', 
          name: 'Market Breadth Positive', 
          operands: ['Breadth_ok'],
          defaultSeeds: { operator: 'is_true', leftOperand: 'Breadth_ok', rightOperand: '' }
        }
      ]
    },
    'Market Neutral': {
      indicators: ['rank', 'spread'],
      entryTiles: [
        { 
          id: 'rank_long', 
          name: 'Top Ranked for Long', 
          operands: ['Rank_long_topN'],
          defaultSeeds: { operator: 'is_true', leftOperand: 'Rank_long_topN', rightOperand: '' }
        },
        { 
          id: 'rank_short', 
          name: 'Bottom Ranked for Short', 
          operands: ['Rank_short_bottomN'],
          defaultSeeds: { operator: 'is_true', leftOperand: 'Rank_short_bottomN', rightOperand: '' }
        },
        { 
          id: 'spread_score', 
          name: 'Spread Score OK', 
          operands: ['Spread_score'],
          defaultSeeds: { operator: 'is_above', leftOperand: 'Spread_score', rightOperand: '0' }
        }
      ]
    }
  };

  // Get strategy-specific operands from loaded config
  const getOperandsForStrategy = (strategyName: string) => {
    const configData = strategyConfig?.strategies || FALLBACK_CONFIG;
    const config = configData[strategyName];
    if (!config) return ['EMA Fast', 'EMA Slow', 'Price'];
    
    // Collect all unique operands from tiles
    const operands = new Set<string>();
    config.entryTiles.forEach((tile: any) => {
      tile.operands.forEach((operand: string) => operands.add(operand));
    });
    return Array.from(operands);
  };

  // Get relevant indicators for the selected strategy
  const getRelevantIndicators = (strategyName: string) => {
    const configData = strategyConfig?.strategies || FALLBACK_CONFIG;
    const config = configData[strategyName];
    return config?.indicators || ['ema'];
  };

  // Get entry tiles for the selected strategy
  const getEntryTilesForStrategy = (strategyName: string) => {
    const configData = strategyConfig?.strategies || FALLBACK_CONFIG;
    const config = configData[strategyName];
    return config?.entryTiles || [];
  };

  // Entry condition operators with tooltips
  const operators = [
    { 
      value: 'crosses_above', 
      label: 'Crosses Above',
      tooltip: 'Triggers when left-hand series moves from below to above right-hand series on bar close.'
    },
    { 
      value: 'crosses_below', 
      label: 'Crosses Below',
      tooltip: 'Triggers when left-hand series moves from above to below right-hand series on bar close.'
    },
    { 
      value: 'is_above', 
      label: 'Is Above',
      tooltip: 'True when left-hand value is greater than right-hand value.'
    },
    { 
      value: 'is_below', 
      label: 'Is Below',
      tooltip: 'True when left-hand value is less than right-hand value.'
    },
    { 
      value: 'is_true', 
      label: 'Is True',
      tooltip: 'Used for yes/no signals, e.g., MACD Histogram > 0 or Breadth_ok.'
    }
  ];

  const updateStrategySetting = (key: string, value: any) => {
    setStrategySettings(prev => ({ ...prev, [key]: value }));
  };

  const updateFiltersSetting = (key: string, value: any) => {
    setFiltersSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateExitSetting = (key: string, value: any) => {
    setExitSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefault = (section: 'strategy' | 'entry' | 'strategyAdvanced' | 'filters' | 'exit' | 'exitAdvanced') => {
    switch (section) {
      case 'strategy':
        setStrategySettings(prev => ({
          ...prev,
          emaFast: defaultStrategySettings.emaFast,
          emaSlow: defaultStrategySettings.emaSlow,
          rsiLength: defaultStrategySettings.rsiLength,
          macdFast: defaultStrategySettings.macdFast,
          macdSlow: defaultStrategySettings.macdSlow,
          macdSignal: defaultStrategySettings.macdSignal,
          cciLength: defaultStrategySettings.cciLength,
          atrLength: defaultStrategySettings.atrLength,
          bbPeriod: defaultStrategySettings.bbPeriod
        }));
        break;
      case 'entry':
        // Reset to first tile's defaultSeeds for the current strategy
        if (strategy) {
          const tiles = getEntryTilesForStrategy(strategy.name);
          if (tiles.length > 0) {
            const firstTile = tiles[0];
            setEntryConditions([{
              id: '1',
              operator: firstTile.defaultSeeds?.operator || 'crosses_above',
              leftOperand: firstTile.defaultSeeds?.leftOperand || firstTile.operands[0],
              rightOperand: firstTile.defaultSeeds?.rightOperand || firstTile.operands[1] || '',
              enabled: true
            }]);
          } else {
            setEntryConditions([{ id: '1', operator: 'crosses_above', leftOperand: 'EMA Fast', rightOperand: 'EMA Slow', enabled: true }]);
          }
        }
        setEntryLogic('all_true');
        setEntryDirection('both');
        setEntryInverse(false);
        break;
      case 'strategyAdvanced':
        setStrategySettings(prev => ({
          ...prev,
          maType: defaultStrategySettings.maType,
          rsiOverbought: defaultStrategySettings.rsiOverbought,
          rsiOversold: defaultStrategySettings.rsiOversold,
          reentryBars: defaultStrategySettings.reentryBars,
          confirmBars: defaultStrategySettings.confirmBars,
          oneTradePerSession: defaultStrategySettings.oneTradePerSession
        }));
        break;
      case 'filters':
        setFiltersSettings(defaultFiltersSettings);
        break;
      case 'exit':
        setExitSettings(prev => ({
          ...prev,
          stopLoss: defaultExitSettings.stopLoss,
          takeProfit: defaultExitSettings.takeProfit
        }));
        break;
      case 'exitAdvanced':
        setExitSettings(defaultExitSettings);
        break;
    }
  };

  const addEntryCondition = () => {
    const newId = Date.now().toString();
    const availableOperands = getOperandsForStrategy(strategy?.name || '');
    setEntryConditions(prev => [...prev, {
      id: newId,
      operator: 'is_above',
      leftOperand: availableOperands[0] || 'EMA Fast',
      rightOperand: availableOperands[1] || 'EMA Slow',
      enabled: true
    }]);
  };

  const removeEntryCondition = (id: string) => {
    setEntryConditions(prev => prev.filter(c => c.id !== id));
  };

  const updateEntryCondition = (id: string, field: string, value: any) => {
    setEntryConditions(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  // Conflict detection
  const hasConflicts = () => {
    const conflicts = [];
    if (exitSettings.atrStopEnabled && exitSettings.stopLoss > 0) {
      conflicts.push("ATR Stop conflicts with Fixed Stop. Disable one to continue.");
    }
    if (exitSettings.multiTpEnabled && exitSettings.trailingType !== 'none') {
      conflicts.push("Multi-TP conflicts with Trailing Stop. Choose one approach.");
    }
    return conflicts;
  };

  const conflicts = hasConflicts();

  // Initialize entry conditions when strategy changes
  useEffect(() => {
    if (strategy) {
      const tiles = getEntryTilesForStrategy(strategy.name);
      if (tiles.length > 0) {
        const firstTile = tiles[0];
        setEntryConditions([{
          id: '1',
          operator: firstTile.defaultSeeds?.operator || 'crosses_above',
          leftOperand: firstTile.defaultSeeds?.leftOperand || firstTile.operands[0],
          rightOperand: firstTile.defaultSeeds?.rightOperand || firstTile.operands[1] || '',
          enabled: true
        }]);
      } else {
        // Fallback if no tiles configured
        setEntryConditions([{ id: '1', operator: 'crosses_above', leftOperand: 'EMA Fast', rightOperand: 'EMA Slow', enabled: true }]);
      }
    }
  }, [strategy?.name]);

  // Format strategy name (replace Echo with Hybrid Momentum)
  const formatStrategyName = (name: string) => {
    return name.replace(/Echo/gi, 'Hybrid Momentum').replace(/Heikin\s*Ashi/gi, '');
  };

  const getPreviewText = (condition: EntryCondition) => {
    const operatorText = operators.find(op => op.value === condition.operator)?.label || condition.operator;
    return `${condition.leftOperand} ${operatorText.toLowerCase()} ${condition.rightOperand}`;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Advanced Settings</h2>
          </div>
          <p className="text-muted-foreground">
            Configure strategy parameters, entry logic, and exit controls for your bot
          </p>
        </header>

        {!strategy ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Please select a strategy first.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 1. Indicator Settings */}
            <Card className="frosted">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Indicator Settings
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetToDefault('strategy')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Return to Default
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Core indicator configurations for the {formatStrategyName(strategy.name)} strategy
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Only show indicator panels that are relevant to the selected strategy */}
                {getRelevantIndicators(strategy.name).includes('ema') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">EMA Fast Length</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Number of bars used to calculate the fast EMA. Shorter = reacts quicker.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[strategySettings.emaFast]}
                          onValueChange={([value]) => updateStrategySetting('emaFast', value)}
                          max={100}
                          min={5}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>5</span>
                          <span className="font-medium text-foreground">{strategySettings.emaFast}</span>
                          <span>100</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">EMA Slow Length</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Number of bars used to calculate the slow EMA. Longer = smoother trend.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[strategySettings.emaSlow]}
                          onValueChange={([value]) => updateStrategySetting('emaSlow', value)}
                          max={200}
                          min={10}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>10</span>
                          <span className="font-medium text-foreground">{strategySettings.emaSlow}</span>
                          <span>200</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">MA Type</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Moving average calculation method. EMA is more responsive, SMA is smoother.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={strategySettings.maType}
                        onValueChange={(value) => updateStrategySetting('maType', value)}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMA">EMA (Exponential)</SelectItem>
                          <SelectItem value="SMA">SMA (Simple)</SelectItem>
                          <SelectItem value="WMA">WMA (Weighted)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* RSI Settings - only show for strategies that use RSI */}
                {getRelevantIndicators(strategy.name).includes('rsi') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">RSI Length</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Number of bars used to calculate RSI. Standard is 14, shorter gives more signals.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        value={strategySettings.rsiLength}
                        onChange={(e) => updateStrategySetting('rsiLength', Number(e.target.value))}
                        min="5"
                        max="50"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">RSI Overbought</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Level where RSI suggests price is overbought (default 70).</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        value={strategySettings.rsiOverbought}
                        onChange={(e) => updateStrategySetting('rsiOverbought', Number(e.target.value))}
                        min="50"
                        max="95"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">RSI Oversold</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Level where RSI suggests price is oversold (default 30).</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        value={strategySettings.rsiOversold}
                        onChange={(e) => updateStrategySetting('rsiOversold', Number(e.target.value))}
                        min="5"
                        max="50"
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                )}

                {/* MACD Settings */}
                {getRelevantIndicators(strategy.name).includes('macd') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">MACD Fast Length</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Fast EMA period for MACD calculation. Standard is 12.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        value={strategySettings.macdFast}
                        onChange={(e) => updateStrategySetting('macdFast', Number(e.target.value))}
                        min="5"
                        max="50"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">MACD Slow Length</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Slow EMA period for MACD calculation. Standard is 26.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        value={strategySettings.macdSlow}
                        onChange={(e) => updateStrategySetting('macdSlow', Number(e.target.value))}
                        min="10"
                        max="100"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">MACD Signal Length</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Number of bars used to smooth MACD crossovers.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        value={strategySettings.macdSignal}
                        onChange={(e) => updateStrategySetting('macdSignal', Number(e.target.value))}
                        min="3"
                        max="30"
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                )}

                {/* Conditional ATR Length - only show when ATR stop is enabled */}
                {exitSettings.atrStopEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">ATR Length</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Number of bars for ATR calculation. Used for volatility-based stops.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        value={strategySettings.atrLength}
                        onChange={(e) => updateStrategySetting('atrLength', Number(e.target.value))}
                        min="5"
                        max="50"
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Entry Conditions */}
            <Card className="frosted">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-primary" />
                    Entry Conditions
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetToDefault('entry')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Return to Default
                  </Button>
                </div>
                 <p className="text-sm text-muted-foreground">
                   Entry Conditions combine your indicator signals into simple rules. For example: <em>If EMA Fast crosses above EMA Slow AND RSI &gt; 50 → Go Long. If inverse is true → Go Short.</em>
                 </p>
               </CardHeader>
               <CardContent className="space-y-6">
                 {/* Entry Tiles - Strategy-specific clickable tiles */}
                 <div className="space-y-4">
                   <div className="flex items-center gap-2">
                     <h4 className="font-medium">Available Entry Conditions</h4>
                     <Tooltip>
                       <TooltipTrigger>
                         <Info className="w-4 h-4 text-muted-foreground" />
                       </TooltipTrigger>
                       <TooltipContent>
                         <p className="max-w-xs">Click tiles to add them as rules. Each tile becomes a rule box below.</p>
                       </TooltipContent>
                     </Tooltip>
                   </div>
                   
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {getEntryTilesForStrategy(strategy.name).map(tile => {
                       // Check if this tile's rule already exists (prevent duplicates)
                       const isActive = entryConditions.some(condition => 
                         condition.leftOperand === tile.defaultSeeds?.leftOperand &&
                         condition.operator === tile.defaultSeeds?.operator &&
                         condition.rightOperand === (tile.defaultSeeds?.rightOperand || '')
                       );
                       
                       return (
                         <button
                           key={tile.id}
                           onClick={() => {
                             if (isActive) {
                               // Remove the exact matching condition
                               setEntryConditions(prev => prev.filter(condition => 
                                 !(condition.leftOperand === tile.defaultSeeds?.leftOperand &&
                                   condition.operator === tile.defaultSeeds?.operator &&
                                   condition.rightOperand === (tile.defaultSeeds?.rightOperand || ''))
                               ));
                             } else {
                               // Add new condition if under cap and not duplicate
                               if (entryConditions.length < 5) {
                                 const newId = Date.now().toString();
                                 setEntryConditions(prev => [...prev, {
                                   id: newId,
                                   operator: tile.defaultSeeds?.operator || 'is_above',
                                   leftOperand: tile.defaultSeeds?.leftOperand || tile.operands[0],
                                   rightOperand: tile.defaultSeeds?.rightOperand || tile.operands[1] || '',
                                   enabled: true
                                 }]);
                               }
                             }
                           }}
                           disabled={!isActive && entryConditions.length >= 5}
                           className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                             isActive 
                               ? 'border-primary bg-primary/10 text-primary' 
                               : entryConditions.length >= 5
                                 ? 'border-muted-foreground/20 bg-muted/50 text-muted-foreground cursor-not-allowed'
                                 : 'border-border hover:border-primary hover:bg-primary/5 text-foreground'
                           }`}
                         >
                           {tile.label}
                         </button>
                       );
                     })}
                   </div>
                   
                   {entryConditions.length >= 5 && (
                     <div className="text-xs text-muted-foreground">
                       Maximum 5 rules reached. Remove a rule to add more.
                     </div>
                   )}
                 </div>

                 {/* Entry Condition Rules */}
                 <div className="space-y-4">
                  {entryConditions.map((condition, index) => (
                    <div key={condition.id} className="border rounded-lg p-4 bg-background/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">Rule {index + 1}</h4>
                        {entryConditions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntryCondition(condition.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Left Operand</Label>
                          <Select
                            value={condition.leftOperand}
                            onValueChange={(value) => updateEntryCondition(condition.id, 'leftOperand', value)}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getOperandsForStrategy(strategy.name).map(operand => (
                                <SelectItem key={operand} value={operand}>{operand}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Operator</Label>
                          <Select
                            value={condition.operator}
                            onValueChange={(value) => updateEntryCondition(condition.id, 'operator', value)}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {operators.map(op => (
                                <SelectItem key={op.value} value={op.value}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span>{op.label}</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">{op.tooltip}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Right Operand</Label>
                          <Select
                            value={condition.rightOperand}
                            onValueChange={(value) => updateEntryCondition(condition.id, 'rightOperand', value)}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getOperandsForStrategy(strategy.name).map(operand => (
                                <SelectItem key={operand} value={operand}>{operand}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-3 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                        Preview: <em>{getPreviewText(condition)}</em>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addEntryCondition}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry Condition
                  </Button>
                </div>

                {/* Logic Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Logic Joiner</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">AND = all conditions must be true. OR = any condition can be true.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select value={entryLogic} onValueChange={setEntryLogic}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_true">All conditions (AND)</SelectItem>
                        <SelectItem value="any_true">Any condition (OR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Direction</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Restrict trades to long positions, short positions, or allow both.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select value={entryDirection} onValueChange={setEntryDirection}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="long">Long only</SelectItem>
                        <SelectItem value="short">Short only</SelectItem>
                        <SelectItem value="both">Both directions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Inverse Logic</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Flip signals. If bullish conditions fail, enter short instead.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="inverse-logic"
                        checked={entryInverse}
                        onCheckedChange={setEntryInverse}
                      />
                      <Label htmlFor="inverse-logic" className="text-sm">
                        Enable inverse signals
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Advanced Strategy Settings */}
            <Collapsible open={isAdvancedStrategyOpen} onOpenChange={setIsAdvancedStrategyOpen}>
              <Card className="frosted">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Settings className="w-5 h-5 text-primary" />
                        Advanced Strategy Settings
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetToDefault('strategyAdvanced');
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Return to Default
                        </Button>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedStrategyOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-left">
                      Strategy-level refinements and confirmation rules
                    </p>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Confirmation Bars</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Require conditions to remain true for N candles before entry.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          value={strategySettings.confirmBars}
                          onChange={(e) => updateStrategySetting('confirmBars', Number(e.target.value))}
                          min="1"
                          max="10"
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Re-entry Cooldown (bars)</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Set minimum bars between trades, or restrict to one trade per session.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          value={strategySettings.reentryBars}
                          onChange={(e) => updateStrategySetting('reentryBars', Number(e.target.value))}
                          min="0"
                          max="100"
                          className="bg-background/50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="one-trade-per-session"
                        checked={strategySettings.oneTradePerSession}
                        onCheckedChange={(checked) => updateStrategySetting('oneTradePerSession', checked)}
                      />
                      <Label htmlFor="one-trade-per-session" className="text-sm">
                        Limit to one trade per session
                      </Label>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* 4. Filters */}
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <Card className="frosted">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="w-5 h-5 text-primary" />
                        Filters
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetToDefault('filters');
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Return to Default
                        </Button>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-left">
                      Optional gates that filter trades without replacing entry rules
                    </p>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {/* Higher Timeframe Trend Filter */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="htf-filter"
                          checked={filtersSettings.htfFilter}
                          onCheckedChange={(checked) => updateFiltersSetting('htfFilter', checked)}
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="htf-filter" className="font-medium">Higher Timeframe Trend Filter</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Only trade if the higher timeframe trend agrees. Example: only take longs if BTC is above its daily EMA 200.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {filtersSettings.htfFilter && (
                        <div className="ml-6 space-y-3 border-l-2 border-muted pl-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="htf-use-btc"
                              checked={filtersSettings.htfUseBtc}
                              onCheckedChange={(checked) => updateFiltersSetting('htfUseBtc', checked)}
                            />
                            <Label htmlFor="htf-use-btc" className="text-sm">
                              Use BTC/USDT daily EMA 200 (default)
                            </Label>
                          </div>
                          
                          {!filtersSettings.htfUseBtc && (
                            <div className="text-sm text-muted-foreground">
                              Will use pair's own higher timeframe EMA instead of BTC
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Volume Filter */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="volume-filter"
                          checked={filtersSettings.volumeFilter}
                          onCheckedChange={(checked) => updateFiltersSetting('volumeFilter', checked)}
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="volume-filter" className="font-medium">Volume Filter</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Only allow trades when volume is above its moving average.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {filtersSettings.volumeFilter && (
                        <div className="ml-6 border-l-2 border-muted pl-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Volume Multiplier</Label>
                            <Input
                              type="number"
                              value={filtersSettings.volumeThreshold}
                              onChange={(e) => updateFiltersSetting('volumeThreshold', Number(e.target.value))}
                              min="0.5"
                              max="5.0"
                              step="0.1"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ATR Activity Filter */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="atr-filter"
                          checked={filtersSettings.atrFilter}
                          onCheckedChange={(checked) => updateFiltersSetting('atrFilter', checked)}
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="atr-filter" className="font-medium">ATR Activity Filter</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Only allow trades when volatility (ATR) is above threshold.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {filtersSettings.atrFilter && (
                        <div className="ml-6 border-l-2 border-muted pl-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">ATR Threshold</Label>
                            <Input
                              type="number"
                              value={filtersSettings.atrThreshold}
                              onChange={(e) => updateFiltersSetting('atrThreshold', Number(e.target.value))}
                              min="0.1"
                              max="5.0"
                              step="0.1"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* 5. Default Exit Settings */}
            <Card className="frosted">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-primary" />
                    Default Exit Settings
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetToDefault('exit')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Return to Default
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Basic stop loss and take profit levels for all trades
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Stop Loss %</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Exit if price moves against you by this %.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={exitSettings.stopLoss}
                      onChange={(e) => updateExitSetting('stopLoss', Number(e.target.value))}
                      min="0.1"
                      max="50"
                      step="0.1"
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Take Profit %</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Exit once profit target is reached.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={exitSettings.takeProfit}
                      onChange={(e) => updateExitSetting('takeProfit', Number(e.target.value))}
                      min="0.1"
                      max="200"
                      step="0.1"
                      className="bg-background/50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6. Advanced Exit Settings */}
            <Collapsible open={isAdvancedExitOpen} onOpenChange={setIsAdvancedExitOpen}>
              <Card className="frosted">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Advanced Exit Settings
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetToDefault('exitAdvanced');
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Return to Default
                        </Button>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedExitOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-left">
                      Smart exit strategies including multi-TP, trailing stops, and time-based exits
                    </p>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {/* Conflict Warnings */}
                    {conflicts.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            {conflicts.map((conflict, index) => (
                              <div key={index}>{conflict}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Multi-TP Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="multi-tp"
                          checked={exitSettings.multiTpEnabled}
                          onCheckedChange={(checked) => updateExitSetting('multiTpEnabled', checked)}
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="multi-tp" className="font-medium">Multi-Target Profit Taking</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Scale out at multiple targets and lock in profits step by step.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {exitSettings.multiTpEnabled && (
                        <div className="ml-6 space-y-4 border-l-2 border-muted pl-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm">TP1 (%) - Allocation: {exitSettings.tp1Allocation}%</Label>
                              <Input
                                type="number"
                                value={exitSettings.tp1}
                                onChange={(e) => updateExitSetting('tp1', Number(e.target.value))}
                                min="0.1"
                                max="100"
                                step="0.1"
                                className="bg-background/50"
                              />
                              <Slider
                                value={[exitSettings.tp1Allocation]}
                                onValueChange={([value]) => updateExitSetting('tp1Allocation', value)}
                                max={100}
                                min={10}
                                step={1}
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">TP2 (%) - Allocation: {exitSettings.tp2Allocation}%</Label>
                              <Input
                                type="number"
                                value={exitSettings.tp2}
                                onChange={(e) => updateExitSetting('tp2', Number(e.target.value))}
                                min="0.1"
                                max="200"
                                step="0.1"
                                className="bg-background/50"
                              />
                              <Slider
                                value={[exitSettings.tp2Allocation]}
                                onValueChange={([value]) => updateExitSetting('tp2Allocation', value)}
                                max={100}
                                min={10}
                                step={1}
                                className="w-full"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">TP3 (%) - Allocation: {exitSettings.tp3Allocation}%</Label>
                              <Input
                                type="number"
                                value={exitSettings.tp3}
                                onChange={(e) => updateExitSetting('tp3', Number(e.target.value))}
                                min="0.1"
                                max="500"
                                step="0.1"
                                className="bg-background/50"
                              />
                              <Slider
                                value={[exitSettings.tp3Allocation]}
                                onValueChange={([value]) => updateExitSetting('tp3Allocation', value)}
                                max={100}
                                min={10}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Break-even Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="break-even"
                          checked={exitSettings.breakEvenEnabled}
                          onCheckedChange={(checked) => updateExitSetting('breakEvenEnabled', checked)}
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="break-even" className="font-medium">Break-even Stop</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Move stop loss to entry price once trade reaches X% profit (optionally +offset).</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {exitSettings.breakEvenEnabled && (
                        <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-l-2 border-muted pl-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Trigger at % Profit</Label>
                            <Input
                              type="number"
                              value={exitSettings.breakEvenTrigger}
                              onChange={(e) => updateExitSetting('breakEvenTrigger', Number(e.target.value))}
                              min="0.1"
                              max="20"
                              step="0.1"
                              className="bg-background/50"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Offset %</Label>
                            <Input
                              type="number"
                              value={exitSettings.breakEvenOffset}
                              onChange={(e) => updateExitSetting('breakEvenOffset', Number(e.target.value))}
                              min="0"
                              max="5"
                              step="0.1"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Trailing Stop Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">Trailing Stop</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Follow the price as it moves in your favor. Options: fixed %, ATR-based, or hybrid.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select value={exitSettings.trailingType} onValueChange={(value) => updateExitSetting('trailingType', value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="fixed">Fixed %</SelectItem>
                          <SelectItem value="atr">ATR-based</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>

                      {exitSettings.trailingType === 'fixed' && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Trailing %</Label>
                          <Input
                            type="number"
                            value={exitSettings.trailingPercent}
                            onChange={(e) => updateExitSetting('trailingPercent', Number(e.target.value))}
                            min="0.1"
                            max="20"
                            step="0.1"
                            className="bg-background/50"
                          />
                        </div>
                      )}

                      {exitSettings.trailingType === 'atr' && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">ATR Multiplier</Label>
                          <Input
                            type="number"
                            value={exitSettings.trailingAtr}
                            onChange={(e) => updateExitSetting('trailingAtr', Number(e.target.value))}
                            min="0.5"
                            max="10"
                            step="0.1"
                            className="bg-background/50"
                          />
                        </div>
                      )}
                    </div>

                    {/* ATR Stop Loss */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="atr-stop"
                          checked={exitSettings.atrStopEnabled}
                          onCheckedChange={(checked) => updateExitSetting('atrStopEnabled', checked)}
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor="atr-stop" className="font-medium">ATR Stop Loss</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Set stop dynamically based on volatility (k × ATR). ATR length input appears above.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {exitSettings.atrStopEnabled && (
                        <div className="ml-6 border-l-2 border-muted pl-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">ATR Multiplier</Label>
                            <Input
                              type="number"
                              value={exitSettings.atrMultiplier}
                              onChange={(e) => updateExitSetting('atrMultiplier', Number(e.target.value))}
                              min="0.5"
                              max="10"
                              step="0.1"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Time-based Exit */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">Time-based Exit</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Exit trades after N candles, or at daily/weekly close.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select value={exitSettings.timeExitType} onValueChange={(value) => updateExitSetting('timeExitType', value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="candles">After N candles</SelectItem>
                          <SelectItem value="daily_close">At daily close</SelectItem>
                          <SelectItem value="weekly_close">At weekly close</SelectItem>
                        </SelectContent>
                      </Select>

                      {exitSettings.timeExitType === 'candles' && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Number of Candles</Label>
                          <Input
                            type="number"
                            value={exitSettings.timeExitCandles}
                            onChange={(e) => updateExitSetting('timeExitCandles', Number(e.target.value))}
                            min="1"
                            max="1000"
                            className="bg-background/50"
                          />
                        </div>
                      )}
                    </div>

                    {/* Exit Priority */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">Exit Priority</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Decide which rule wins if multiple exits trigger together.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select value={exitSettings.exitPriority} onValueChange={(value) => updateExitSetting('exitPriority', value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tp_first">Take Profit First</SelectItem>
                          <SelectItem value="sl_first">Stop Loss First</SelectItem>
                          <SelectItem value="trailing_first">Trailing First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={onPrevious}>
                Previous
              </Button>
              <Button onClick={onNext}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}