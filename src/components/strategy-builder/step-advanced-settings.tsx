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
import { Info, ChevronDown, Settings, TrendingUp, BarChart3, Target, AlertTriangle, Search, Plus, X, Filter, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface StepAdvancedSettingsProps {
  strategy: Strategy | null;
  filterIndicators: IndicatorConfig[];
  onUpdateFilters: (filters: IndicatorConfig[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  userTier: UserTier;
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
  const [activeEntryConditions, setActiveEntryConditions] = useState<string[]>(['ema_crossover']);
  const [entryLogic, setEntryLogic] = useState('all_true'); // 'all_true' or 'any_true'
  const [entryDirection, setEntryDirection] = useState('both'); // 'long', 'short', 'both'
  
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
    indicatorSource: 'close',
    maType: 'EMA',
    rsiOverbought: 70,
    rsiOversold: 30,
    smoothingLength: 3,
    reentryBars: 1,
    confirmBars: 1,
    oneTradePerSession: false
  });

  // Entry condition parameters
  const [entryParams, setEntryParams] = useState({
    ema_crossover: { fast: 20, slow: 50 },
    macd_cross: { fast: 12, slow: 26, signal: 9 },
    rsi_threshold: { length: 14, level: 50 },
    price_vs_ma: { length: 50, type: 'EMA' }
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

  // Default settings
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
    indicatorSource: 'close',
    maType: 'EMA',
    rsiOverbought: 70,
    rsiOversold: 30,
    smoothingLength: 3,
    reentryBars: 1,
    confirmBars: 1,
    oneTradePerSession: false
  };

  const defaultEntryParams = {
    ema_crossover: { fast: 20, slow: 50 },
    macd_cross: { fast: 12, slow: 26, signal: 9 },
    rsi_threshold: { length: 14, level: 50 },
    price_vs_ma: { length: 50, type: 'EMA' }
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

  const updateStrategySetting = (key: string, value: any) => {
    setStrategySettings(prev => ({ ...prev, [key]: value }));
  };

  const updateEntryParam = (condition: string, key: string, value: any) => {
    setEntryParams(prev => ({
      ...prev,
      [condition]: { ...prev[condition as keyof typeof prev], [key]: value }
    }));
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
        setActiveEntryConditions(['ema_crossover']);
        setEntryParams(defaultEntryParams);
        setEntryLogic('all_true');
        setEntryDirection('both');
        break;
      case 'strategyAdvanced':
        setStrategySettings(prev => ({
          ...prev,
          indicatorSource: defaultStrategySettings.indicatorSource,
          maType: defaultStrategySettings.maType,
          rsiOverbought: defaultStrategySettings.rsiOverbought,
          rsiOversold: defaultStrategySettings.rsiOversold,
          smoothingLength: defaultStrategySettings.smoothingLength,
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

  // Strategy-specific operand mapping
  const getOperandsForStrategy = (strategyName: string) => {
    const operandMap: Record<string, string[]> = {
      'EMA Crossover Pro': ['EMA Fast', 'EMA Slow', 'Price'],
      'MACD Cross': ['MACD Line', 'MACD Signal', 'MACD Histogram'],
      'RSI Strategy': ['RSI', 'RSI Overbought (70)', 'RSI Oversold (30)', 'RSI Midline (50)'],
      'CCI Strategy': ['CCI', '0-line', 'Overbought', 'Oversold'],
      'Bollinger Band Strategy': ['Price', 'Upper Band', 'Lower Band', 'Middle Band'],
      'Stochastic Strategy': ['%K', '%D', 'Overbought', 'Oversold'],
      'VWAP Strategy': ['Price', 'VWAP'],
      'OBV Strategy': ['OBV', 'OBV Moving Average'],
      'Turbo K6': ['EMA Fast', 'EMA Slow', 'RSI', 'MACD Line', 'MACD Signal'],
      'Hybrid Strategy': ['EMA Fast', 'EMA Slow', 'RSI', 'MACD Line'],
      'Market Neutral': ['EMA Fast', 'EMA Slow', 'Price', 'RSI']
    };
    return operandMap[strategyName] || ['EMA Fast', 'EMA Slow', 'Price'];
  };

  // Get relevant indicators for the selected strategy
  const getRelevantIndicators = (strategyName: string) => {
    const indicatorMap: Record<string, string[]> = {
      'EMA Crossover Pro': ['ema'],
      'MACD Cross': ['macd'],
      'RSI Strategy': ['rsi'],
      'CCI Strategy': ['cci'],
      'Bollinger Band Strategy': ['bb'],
      'Stochastic Strategy': ['stoch'],
      'VWAP Strategy': ['vwap'],
      'OBV Strategy': ['obv'],
      'Turbo K6': ['ema', 'rsi', 'macd'],
      'Hybrid Strategy': ['ema', 'rsi', 'macd'],
      'Market Neutral': ['ema', 'rsi']
    };
    return indicatorMap[strategyName] || ['ema'];
  };

  // Entry condition operators
  const operators = [
    { value: 'crosses_above', label: 'Crosses Above' },
    { value: 'crosses_below', label: 'Crosses Below' },
    { value: 'is_above', label: 'Is Above' },
    { value: 'is_below', label: 'Is Below' },
    { value: 'is_true', label: 'Is True' }
  ];

  // Entry condition helpers
  const toggleEntryCondition = (condition: string) => {
    setActiveEntryConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  // Conflict detection
  const hasConflicts = () => {
    const conflicts = [];
    if (exitSettings.atrStopEnabled && exitSettings.stopLoss > 0) {
      conflicts.push("ATR Stop Loss conflicts with Fixed Stop Loss");
    }
    return conflicts;
  };

  const conflicts = hasConflicts();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Advanced Settings</h2>
          </div>
          <p className="text-muted-foreground">
            Configure strategy parameters and exit controls for your bot
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
                  Core indicator configurations and moving average types for the {strategy.name} strategy
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* EMA Fast Length */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">EMA Fast Length</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Number of bars for fast EMA. Shorter lengths react quicker but create more noise.</p>
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

                  {/* EMA Slow Length */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">EMA Slow Length</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Number of bars for slow EMA. Longer lengths smooth out fluctuations.</p>
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

                  {/* Moving Average Type */}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* RSI Length */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">RSI Length</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Bars for RSI calculation. Standard is 14, shorter gives more signals.</p>
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

                  {/* RSI Overbought */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">RSI Overbought</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">RSI level considered overbought. Standard is 70.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={strategySettings.rsiOverbought}
                      onChange={(e) => updateStrategySetting('rsiOverbought', Number(e.target.value))}
                      min="50"
                      max="90"
                      className="bg-background/50"
                    />
                  </div>

                  {/* RSI Oversold */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">RSI Oversold</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">RSI level considered oversold. Standard is 30.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={strategySettings.rsiOversold}
                      onChange={(e) => updateStrategySetting('rsiOversold', Number(e.target.value))}
                      min="10"
                      max="50"
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* MACD Fast */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">MACD Fast</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Fast EMA period for MACD. Standard is 12.</p>
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

                  {/* MACD Slow */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">MACD Slow</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Slow EMA period for MACD. Standard is 26.</p>
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

                  {/* MACD Signal */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">MACD Signal</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Signal line EMA period. Standard is 9.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={strategySettings.macdSignal}
                      onChange={(e) => updateStrategySetting('macdSignal', Number(e.target.value))}
                      min="3"
                      max="20"
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ATR Length */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">ATR Length</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Average True Range calculation period. Used for volatility-based stops.</p>
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

                  {/* Bollinger Band Period */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Bollinger Band Period</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Period for Bollinger Bands calculation. Standard is 20.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={strategySettings.bbPeriod}
                      onChange={(e) => updateStrategySetting('bbPeriod', Number(e.target.value))}
                      min="10"
                      max="50"
                      className="bg-background/50"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Entry Conditions - Operator-Based Rule Builder */}
            <Card className="frosted">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
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
                  Create entry rules using operator logic. Click tiles to add/remove conditions.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Rule Button */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveEntryConditions(prev => [...prev, `rule_${prev.length + 1}`])}
                    className="text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry Rule
                  </Button>
                </div>

                {/* Entry Rules */}
                {activeEntryConditions.length > 0 && (
                  <div className="space-y-4">
                    {activeEntryConditions.map((condition, index) => (
                      <div key={condition} className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                        <div className="flex items-center justify-between mb-4">
                          <Label className="font-medium">Rule {index + 1}</Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveEntryConditions(prev => prev.filter(c => c !== condition))}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Operator-based rule builder */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Left operand */}
                          <div className="space-y-2">
                            <Label className="text-sm">Left Operand</Label>
                            <Select defaultValue={getOperandsForStrategy(strategy.name)[0]}>
                              <SelectTrigger className="bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getOperandsForStrategy(strategy.name).map(operand => (
                                  <SelectItem key={operand} value={operand.toLowerCase().replace(/\s+/g, '_')}>
                                    {operand}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Operator */}
                          <div className="space-y-2">
                            <Label className="text-sm">Operator</Label>
                            <Select defaultValue="crosses_above">
                              <SelectTrigger className="bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {operators.map(op => (
                                  <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Right operand */}
                          <div className="space-y-2">
                            <Label className="text-sm">Right Operand</Label>
                            <Select defaultValue={getOperandsForStrategy(strategy.name)[1] || getOperandsForStrategy(strategy.name)[0]}>
                              <SelectTrigger className="bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getOperandsForStrategy(strategy.name).map(operand => (
                                  <SelectItem key={operand} value={operand.toLowerCase().replace(/\s+/g, '_')}>
                                    {operand}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Rule preview */}
                        <div className="mt-3 p-2 bg-background/50 rounded text-sm text-muted-foreground">
                          Preview: "If {getOperandsForStrategy(strategy.name)[0]} crosses above {getOperandsForStrategy(strategy.name)[1] || getOperandsForStrategy(strategy.name)[0]} → Bullish"
                        </div>
                      </div>
                    ))}

                    {/* Entry Logic Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/30">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Rule Joiner</Label>
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
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Trade Direction</Label>
                        <Select value={entryDirection} onValueChange={setEntryDirection}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="long">Long Only</SelectItem>
                            <SelectItem value="short">Short Only</SelectItem>
                            <SelectItem value="both">Both (Long & Short)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Inverse Logic</Label>
                        <div className="flex items-center space-x-2 pt-2">
                          <Switch id="inverse-logic" />
                          <Label htmlFor="inverse-logic" className="text-sm">
                            If inverse is true → enter Short
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Natural language summary */}
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="text-sm">
                        <span className="font-medium text-primary">Entry Logic: </span>
                        "If {entryLogic === 'all_true' ? 'all conditions are' : 'any condition is'} true → enter {entryDirection === 'both' ? 'LONG. If inverse, enter SHORT' : entryDirection.toUpperCase()}"
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. Advanced Strategy Settings */}
            <Collapsible open={isAdvancedStrategyOpen} onOpenChange={setIsAdvancedStrategyOpen}>
              <Card className="frosted">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
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
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isAdvancedStrategyOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-left">
                      Strategy-level refinements and re-entry rules
                    </p>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* MACD Smoothing Length */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">MACD Smoothing Length</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Additional smoothing for MACD signal line</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          value={strategySettings.smoothingLength}
                          onChange={(e) => updateStrategySetting('smoothingLength', Number(e.target.value))}
                          min="1"
                          max="10"
                          className="bg-background/50"
                        />
                      </div>

                      {/* Re-entry Rules */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Bars Between Entries</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Minimum bars required between new entries</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          value={strategySettings.reentryBars}
                          onChange={(e) => updateStrategySetting('reentryBars', Number(e.target.value))}
                          min="1"
                          max="50"
                          className="bg-background/50"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Confirmation Window</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Bars condition must hold before entry</p>
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
                    </div>

                    {/* One Trade Per Session */}
                    <div className="flex items-center justify-between p-4 border border-border/30 rounded-lg">
                      <div className="space-y-1">
                        <Label className="font-medium">One Trade Per Session</Label>
                        <p className="text-sm text-muted-foreground">Limit to one trade per trading session/day</p>
                      </div>
                      <Switch
                        checked={strategySettings.oneTradePerSession}
                        onCheckedChange={(checked) => updateStrategySetting('oneTradePerSession', checked)}
                      />
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* 4. Filters */}
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <Card className="frosted">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
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
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-left">
                      Optional add-ons that gate entries when conditions aren't optimal
                    </p>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {/* Higher Timeframe Filter */}
                    <div className="p-4 border border-border/30 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="font-medium">Higher Timeframe Trend Filter</Label>
                          <p className="text-sm text-muted-foreground">
                            {filtersSettings.htfUseBtc 
                              ? "Default: BTC/USDT daily EMA 200 condition (Close > EMA = bullish)"
                              : "Use pair's own higher timeframe EMA instead of BTC"
                            }
                          </p>
                        </div>
                        <Switch
                          checked={filtersSettings.htfFilter}
                          onCheckedChange={(checked) => updateFiltersSetting('htfFilter', checked)}
                        />
                      </div>
                      
                      {filtersSettings.htfFilter && (
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/20">
                          <div className="space-y-2">
                            <Label className="text-sm">Timeframe</Label>
                            <Select
                              value={filtersSettings.htfTimeframe}
                              onValueChange={(value) => updateFiltersSetting('htfTimeframe', value)}
                            >
                              <SelectTrigger className="bg-background/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1h">1 Hour</SelectItem>
                                <SelectItem value="4h">4 Hours</SelectItem>
                                <SelectItem value="1d">1 Day</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm">Reference</Label>
                            <div className="flex items-center justify-between p-2 bg-background/30 rounded border">
                              <span className="text-sm">{filtersSettings.htfUseBtc ? 'BTC/USDT' : 'Trading Pair'}</span>
                              <Switch
                                checked={filtersSettings.htfUseBtc}
                                onCheckedChange={(checked) => updateFiltersSetting('htfUseBtc', checked)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Volume Filter */}
                    <div className="flex items-center justify-between p-4 border border-border/30 rounded-lg">
                      <div className="space-y-1">
                        <Label className="font-medium">Volume Filter</Label>
                        <p className="text-sm text-muted-foreground">Require volume above average threshold</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {filtersSettings.volumeFilter && (
                          <Input
                            type="number"
                            value={filtersSettings.volumeThreshold}
                            onChange={(e) => updateFiltersSetting('volumeThreshold', Number(e.target.value))}
                            min="1.0"
                            max="5.0"
                            step="0.1"
                            className="w-20"
                          />
                        )}
                        <Switch
                          checked={filtersSettings.volumeFilter}
                          onCheckedChange={(checked) => updateFiltersSetting('volumeFilter', checked)}
                        />
                      </div>
                    </div>

                    {/* ATR Filter */}
                    <div className="flex items-center justify-between p-4 border border-border/30 rounded-lg">
                      <div className="space-y-1">
                        <Label className="font-medium">ATR Filter</Label>
                        <p className="text-sm text-muted-foreground">Require minimum volatility (ATR threshold)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {filtersSettings.atrFilter && (
                          <Input
                            type="number"
                            value={filtersSettings.atrThreshold}
                            onChange={(e) => updateFiltersSetting('atrThreshold', Number(e.target.value))}
                            min="0.5"
                            max="3.0"
                            step="0.1"
                            className="w-20"
                          />
                        )}
                        <Switch
                          checked={filtersSettings.atrFilter}
                          onCheckedChange={(checked) => updateFiltersSetting('atrFilter', checked)}
                        />
                      </div>
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
                  Simple stop loss and take profit percentages
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Stop Loss (%)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Percentage loss before closing position</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={exitSettings.stopLoss}
                      onChange={(e) => updateExitSetting('stopLoss', Number(e.target.value))}
                      min="0.5"
                      max="20"
                      step="0.1"
                      className="bg-background/50"
                      disabled={exitSettings.atrStopEnabled}
                    />
                    {exitSettings.atrStopEnabled && (
                      <p className="text-xs text-muted-foreground">Disabled: Using ATR Stop Loss</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Take Profit (%)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Percentage gain before closing position</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={exitSettings.takeProfit}
                      onChange={(e) => updateExitSetting('takeProfit', Number(e.target.value))}
                      min="1"
                      max="50"
                      step="0.1"
                      className="bg-background/50"
                      disabled={exitSettings.multiTpEnabled}
                    />
                    {exitSettings.multiTpEnabled && (
                      <p className="text-xs text-muted-foreground">Disabled: Using Multiple Take Profits</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6. Advanced Exit Settings */}
            <Collapsible open={isAdvancedExitOpen} onOpenChange={setIsAdvancedExitOpen}>
              <Card className="frosted">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="w-5 h-5 text-primary" />
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
                        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isAdvancedExitOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-left">
                      Smart exits, trailing stops, break-even, and time-based exits
                    </p>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {/* Conflicts Display */}
                    {conflicts.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            {conflicts.map((conflict, index) => (
                              <p key={index} className="text-sm">{conflict}</p>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Multiple Take Profits */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">Multiple Take Profits</Label>
                        <Switch
                          checked={exitSettings.multiTpEnabled}
                          onCheckedChange={(checked) => updateExitSetting('multiTpEnabled', checked)}
                        />
                      </div>
                      
                      {exitSettings.multiTpEnabled && (
                        <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* TP1 */}
                            <div className="space-y-3 p-3 border border-border/30 rounded-lg">
                              <Label className="text-sm font-medium">TP1</Label>
                              <Input
                                type="number"
                                placeholder="% Target"
                                value={exitSettings.tp1}
                                onChange={(e) => updateExitSetting('tp1', Number(e.target.value))}
                                min="1"
                                max="20"
                                step="0.1"
                                className="bg-background/50"
                              />
                              <Input
                                type="number"
                                placeholder="% Allocation"
                                value={exitSettings.tp1Allocation}
                                onChange={(e) => updateExitSetting('tp1Allocation', Number(e.target.value))}
                                min="10"
                                max="100"
                                className="bg-background/50"
                              />
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={exitSettings.tp1TrailingEnabled}
                                  onCheckedChange={(checked) => updateExitSetting('tp1TrailingEnabled', checked)}
                                />
                                <Label className="text-xs">Trail after TP1</Label>
                              </div>
                            </div>

                            {/* TP2 */}
                            <div className="space-y-3 p-3 border border-border/30 rounded-lg">
                              <Label className="text-sm font-medium">TP2</Label>
                              <Input
                                type="number"
                                placeholder="% Target"
                                value={exitSettings.tp2}
                                onChange={(e) => updateExitSetting('tp2', Number(e.target.value))}
                                min="1"
                                max="30"
                                step="0.1"
                                className="bg-background/50"
                              />
                              <Input
                                type="number"
                                placeholder="% Allocation"
                                value={exitSettings.tp2Allocation}
                                onChange={(e) => updateExitSetting('tp2Allocation', Number(e.target.value))}
                                min="10"
                                max="100"
                                className="bg-background/50"
                              />
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={exitSettings.tp2TrailingEnabled}
                                  onCheckedChange={(checked) => updateExitSetting('tp2TrailingEnabled', checked)}
                                />
                                <Label className="text-xs">Trail after TP2</Label>
                              </div>
                            </div>

                            {/* TP3 */}
                            <div className="space-y-3 p-3 border border-border/30 rounded-lg">
                              <Label className="text-sm font-medium">TP3</Label>
                              <Input
                                type="number"
                                placeholder="% Target"
                                value={exitSettings.tp3}
                                onChange={(e) => updateExitSetting('tp3', Number(e.target.value))}
                                min="1"
                                max="50"
                                step="0.1"
                                className="bg-background/50"
                              />
                              <Input
                                type="number"
                                placeholder="% Allocation"
                                value={exitSettings.tp3Allocation}
                                onChange={(e) => updateExitSetting('tp3Allocation', Number(e.target.value))}
                                min="10"
                                max="100"
                                className="bg-background/50"
                              />
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={exitSettings.tp3TrailingEnabled}
                                  onCheckedChange={(checked) => updateExitSetting('tp3TrailingEnabled', checked)}
                                />
                                <Label className="text-xs">Trail after TP3</Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Break-even */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="font-medium">Break-even</Label>
                          <p className="text-sm text-muted-foreground">Move stop to entry after profit threshold</p>
                        </div>
                        <Switch
                          checked={exitSettings.breakEvenEnabled}
                          onCheckedChange={(checked) => updateExitSetting('breakEvenEnabled', checked)}
                        />
                      </div>
                      
                      {exitSettings.breakEvenEnabled && (
                        <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                          <div className="space-y-2">
                            <Label className="text-sm">Trigger (%)</Label>
                            <Input
                              type="number"
                              value={exitSettings.breakEvenTrigger}
                              onChange={(e) => updateExitSetting('breakEvenTrigger', Number(e.target.value))}
                              min="0.5"
                              max="10"
                              step="0.1"
                              className="bg-background/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Offset (%)</Label>
                            <Input
                              type="number"
                              value={exitSettings.breakEvenOffset}
                              onChange={(e) => updateExitSetting('breakEvenOffset', Number(e.target.value))}
                              min="0"
                              max="2"
                              step="0.01"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Trailing Stops */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Trailing Stop Type</Label>
                        <Select
                          value={exitSettings.trailingType}
                          onValueChange={(value) => updateExitSetting('trailingType', value)}
                        >
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
                      </div>

                      {exitSettings.trailingType === 'fixed' && (
                        <div className="pl-4 border-l-2 border-primary/20">
                          <div className="space-y-2">
                            <Label className="text-sm">Trailing Percentage</Label>
                            <Input
                              type="number"
                              value={exitSettings.trailingPercent}
                              onChange={(e) => updateExitSetting('trailingPercent', Number(e.target.value))}
                              min="0.5"
                              max="10"
                              step="0.1"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                      )}

                      {exitSettings.trailingType === 'atr' && (
                        <div className="pl-4 border-l-2 border-primary/20">
                          <div className="space-y-2">
                            <Label className="text-sm">ATR Multiplier</Label>
                            <Input
                              type="number"
                              value={exitSettings.trailingAtr}
                              onChange={(e) => updateExitSetting('trailingAtr', Number(e.target.value))}
                              min="0.5"
                              max="5"
                              step="0.1"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                      )}

                      {exitSettings.trailingType === 'hybrid' && (
                        <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                          <div className="space-y-2">
                            <Label className="text-sm">Fixed %</Label>
                            <Input
                              type="number"
                              value={exitSettings.trailingPercent}
                              onChange={(e) => updateExitSetting('trailingPercent', Number(e.target.value))}
                              min="0.5"
                              max="10"
                              step="0.1"
                              className="bg-background/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">ATR Multiplier</Label>
                            <Input
                              type="number"
                              value={exitSettings.trailingAtr}
                              onChange={(e) => updateExitSetting('trailingAtr', Number(e.target.value))}
                              min="0.5"
                              max="5"
                              step="0.1"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ATR Stop Loss */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="font-medium">ATR Stop Loss</Label>
                          <p className="text-sm text-muted-foreground">Use ATR-based stop instead of fixed percentage</p>
                        </div>
                        <Switch
                          checked={exitSettings.atrStopEnabled}
                          onCheckedChange={(checked) => updateExitSetting('atrStopEnabled', checked)}
                        />
                      </div>
                      
                      {exitSettings.atrStopEnabled && (
                        <div className="pl-4 border-l-2 border-primary/20">
                          <div className="space-y-2">
                            <Label className="text-sm">ATR Multiplier</Label>
                            <Input
                              type="number"
                              value={exitSettings.atrMultiplier}
                              onChange={(e) => updateExitSetting('atrMultiplier', Number(e.target.value))}
                              min="0.5"
                              max="5"
                              step="0.1"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Time-based Exit */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Time-based Exit</Label>
                        <Select
                          value={exitSettings.timeExitType}
                          onValueChange={(value) => updateExitSetting('timeExitType', value)}
                        >
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="candles">After X candles</SelectItem>
                            <SelectItem value="daily">Exit at daily close</SelectItem>
                            <SelectItem value="weekly">Exit at weekly close</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {exitSettings.timeExitType === 'candles' && (
                        <div className="pl-4 border-l-2 border-primary/20">
                          <div className="space-y-2">
                            <Label className="text-sm">Number of Candles</Label>
                            <Input
                              type="number"
                              value={exitSettings.timeExitCandles}
                              onChange={(e) => updateExitSetting('timeExitCandles', Number(e.target.value))}
                              min="1"
                              max="100"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Exit Priority */}
                    <div className="space-y-2">
                      <Label className="font-medium">Exit Priority</Label>
                      <Select
                        value={exitSettings.exitPriority}
                        onValueChange={(value) => updateExitSetting('exitPriority', value)}
                      >
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tp_first">Take Profits First</SelectItem>
                          <SelectItem value="sl_first">Stop Loss First</SelectItem>
                          <SelectItem value="time_first">Time Exit First</SelectItem>
                          <SelectItem value="trailing_first">Trailing Stop First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6">
              <Button
                variant="outline"
                onClick={onPrevious}
                className="flex items-center gap-2"
              >
                ← Previous
              </Button>
              <Button
                onClick={onNext}
                className="flex items-center gap-2"
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}