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
import { Info, ChevronDown, Settings, TrendingUp, BarChart3, Target, AlertTriangle, Search, Plus, X } from 'lucide-react';
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
  const [showMoreConditions, setShowMoreConditions] = useState(false);
  const [conditionSearch, setConditionSearch] = useState('');
  
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
    // Default Entry Condition
    defaultEntryCondition: 'ema_cross_above',
    // Advanced strategy settings
    indicatorSource: 'close',
    maType: 'EMA',
    rsiOverbought: 70,
    rsiOversold: 30,
    smoothingLength: 3,
    entryConfirmation: false,
    tradeDirection: 'both',
    reentryBars: 1,
    // Advanced Entry Logic
    entryMode: 'default',
    entryRules: [{ type: 'ema_cross', operator: 'cross_up', param1: 20, param2: 50 }],
    entryJoiner: 'AND',
    confirmBars: 1,
    htfConfirm: false,
    minBetweenEntries: 1,
    oneTradePerSession: false
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
    defaultEntryCondition: 'ema_cross_above',
    indicatorSource: 'close',
    maType: 'EMA',
    rsiOverbought: 70,
    rsiOversold: 30,
    smoothingLength: 3,
    entryConfirmation: false,
    tradeDirection: 'both',
    reentryBars: 1,
    entryMode: 'default',
    entryRules: [{ type: 'ema_cross', operator: 'cross_up', param1: 20, param2: 50 }],
    entryJoiner: 'AND',
    confirmBars: 1,
    htfConfirm: false,
    minBetweenEntries: 1,
    oneTradePerSession: false
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

  const updateExitSetting = (key: string, value: any) => {
    setExitSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefault = (section: 'strategy' | 'strategyAdvanced' | 'exit' | 'exitAdvanced') => {
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
          defaultEntryCondition: defaultStrategySettings.defaultEntryCondition
        }));
        break;
      case 'strategyAdvanced':
        setStrategySettings(defaultStrategySettings);
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

  // Add entry rule helpers
  const addEntryRule = () => {
    const newRule = { type: 'ema_cross', operator: 'cross_up', param1: 20, param2: 50 };
    setStrategySettings(prev => ({
      ...prev,
      entryRules: [...prev.entryRules, newRule]
    }));
  };

  const removeEntryRule = (index: number) => {
    setStrategySettings(prev => ({
      ...prev,
      entryRules: prev.entryRules.filter((_, i) => i !== index)
    }));
  };

  const updateEntryRule = (index: number, field: string, value: any) => {
    setStrategySettings(prev => ({
      ...prev,
      entryRules: prev.entryRules.map((rule, i) => 
        i === index ? { ...rule, [field]: value } : rule
      )
    }));
  };

  // Conflict detection
  const hasConflicts = () => {
    const conflicts = [];
    if (exitSettings.atrStopEnabled && exitSettings.stopLoss > 0) {
      conflicts.push("ATR Stop Loss conflicts with Fixed Stop Loss");
    }
    if (strategySettings.entryMode === 'custom') {
      conflicts.push("Using custom entry rules. Default entry condition is disabled.");
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
            {/* 1. Default Strategy Settings - Always Visible */}
            <Card className="frosted">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Default Strategy Settings
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetToDefault('strategy')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Return to Default
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Core parameters for the {strategy.name} strategy
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
                          <p className="max-w-xs">Number of bars used to calculate the fast EMA. Shorter lengths react quicker but can create noise.</p>
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
                          <p className="max-w-xs">Number of bars used for the slow EMA. Longer lengths smooth out short-term fluctuations.</p>
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

                  {/* RSI Length */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">RSI Length</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Bars used to calculate Relative Strength Index. Standard is 14, but shorter lengths give more signals.</p>
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

                  {/* MACD Slow */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">MACD Slow</Label>
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

                  {/* MACD Signal */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">MACD Signal</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Signal line EMA period for MACD. Standard is 9.</p>
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

                {/* Default Entry Condition - Redesigned with Tiles */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Entry Conditions</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Choose how entries are triggered. Use simple core conditions or expand for advanced logic.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {strategySettings.entryMode === 'custom' && (
                      <Badge variant="secondary" className="text-xs">Custom Mode</Badge>
                    )}
                  </div>

                  {/* Core Condition Tiles */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* EMA Crossover Tile */}
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                        strategySettings.defaultEntryCondition === 'ema_cross_above' || strategySettings.defaultEntryCondition === 'ema_cross_below' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-card/50'
                      } ${strategySettings.entryMode === 'custom' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (strategySettings.entryMode !== 'custom') {
                          updateStrategySetting('defaultEntryCondition', 'ema_cross_above');
                        }
                      }}
                    >
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        <div className="text-sm font-medium">EMA Crossover</div>
                        <div className="text-xs text-muted-foreground">Fast/Slow crosses</div>
                      </div>
                    </div>

                    {/* MACD Cross Tile */}
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                        strategySettings.defaultEntryCondition === 'macd_cross_above' || strategySettings.defaultEntryCondition === 'macd_cross_below'
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-card/50'
                      } ${strategySettings.entryMode === 'custom' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (strategySettings.entryMode !== 'custom') {
                          updateStrategySetting('defaultEntryCondition', 'macd_cross_above');
                        }
                      }}
                    >
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        <div className="text-sm font-medium">MACD Cross</div>
                        <div className="text-xs text-muted-foreground">Line/Signal crosses</div>
                      </div>
                    </div>

                    {/* RSI Threshold Tile */}
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                        strategySettings.defaultEntryCondition === 'rsi_above_50' || strategySettings.defaultEntryCondition === 'rsi_below_50'
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-card/50'
                      } ${strategySettings.entryMode === 'custom' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (strategySettings.entryMode !== 'custom') {
                          updateStrategySetting('defaultEntryCondition', 'rsi_above_50');
                        }
                      }}
                    >
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <Target className="w-6 h-6 text-primary" />
                        <div className="text-sm font-medium">RSI Threshold</div>
                        <div className="text-xs text-muted-foreground">Crosses 50 level</div>
                      </div>
                    </div>

                    {/* Price vs MA Tile */}
                    <div 
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                        strategySettings.defaultEntryCondition === 'price_above_ma' || strategySettings.defaultEntryCondition === 'price_below_ma'
                          ? 'border-primary bg-primary/5' 
                          : 'border-border bg-card/50'
                      } ${strategySettings.entryMode === 'custom' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (strategySettings.entryMode !== 'custom') {
                          updateStrategySetting('defaultEntryCondition', 'price_above_ma');
                        }
                      }}
                    >
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        <div className="text-sm font-medium">Price vs MA</div>
                        <div className="text-xs text-muted-foreground">Price crosses MA</div>
                      </div>
                    </div>
                  </div>

                  {/* Condition Configuration - Show when a tile is selected */}
                  {strategySettings.defaultEntryCondition && strategySettings.entryMode !== 'custom' && (
                    <div className="p-4 bg-accent/20 rounded-lg border border-accent/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(strategySettings.defaultEntryCondition === 'ema_cross_above' || strategySettings.defaultEntryCondition === 'ema_cross_below') && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm">Direction</Label>
                              <Select 
                                value={strategySettings.defaultEntryCondition} 
                                onValueChange={(value) => updateStrategySetting('defaultEntryCondition', value)}
                              >
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ema_cross_above">Bullish (Fast above Slow)</SelectItem>
                                  <SelectItem value="ema_cross_below">Bearish (Fast below Slow)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Info className="w-4 h-4 mr-2" />
                              Uses EMA Fast ({strategySettings.emaFast}) and EMA Slow ({strategySettings.emaSlow}) from above
                            </div>
                          </>
                        )}
                        {(strategySettings.defaultEntryCondition === 'macd_cross_above' || strategySettings.defaultEntryCondition === 'macd_cross_below') && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm">Direction</Label>
                              <Select 
                                value={strategySettings.defaultEntryCondition} 
                                onValueChange={(value) => updateStrategySetting('defaultEntryCondition', value)}
                              >
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="macd_cross_above">Bullish (Line above Signal)</SelectItem>
                                  <SelectItem value="macd_cross_below">Bearish (Line below Signal)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Info className="w-4 h-4 mr-2" />
                              Uses MACD settings ({strategySettings.macdFast}, {strategySettings.macdSlow}, {strategySettings.macdSignal}) from above
                            </div>
                          </>
                        )}
                        {(strategySettings.defaultEntryCondition === 'rsi_above_50' || strategySettings.defaultEntryCondition === 'rsi_below_50') && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm">Direction</Label>
                              <Select 
                                value={strategySettings.defaultEntryCondition} 
                                onValueChange={(value) => updateStrategySetting('defaultEntryCondition', value)}
                              >
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="rsi_above_50">Bullish (RSI above 50)</SelectItem>
                                  <SelectItem value="rsi_below_50">Bearish (RSI below 50)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Info className="w-4 h-4 mr-2" />
                              Uses RSI Length ({strategySettings.rsiLength}) from above
                            </div>
                          </>
                        )}
                        {(strategySettings.defaultEntryCondition === 'price_above_ma' || strategySettings.defaultEntryCondition === 'price_below_ma') && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-sm">Direction</Label>
                              <Select 
                                value={strategySettings.defaultEntryCondition} 
                                onValueChange={(value) => updateStrategySetting('defaultEntryCondition', value)}
                              >
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="price_above_ma">Bullish (Price above MA)</SelectItem>
                                  <SelectItem value="price_below_ma">Bearish (Price below MA)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm">MA Length</Label>
                              <Input
                                type="number"
                                value={strategySettings.emaSlow}
                                onChange={(e) => updateStrategySetting('emaSlow', Number(e.target.value))}
                                min="10"
                                max="200"
                                className="bg-background/50"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show More Conditions Button */}
                  <Collapsible open={showMoreConditions} onOpenChange={setShowMoreConditions}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-center gap-2 text-sm"
                        disabled={strategySettings.entryMode === 'custom'}
                      >
                        Show More Conditions
                        <ChevronDown className={`w-4 h-4 transition-transform ${showMoreConditions ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search conditions (e.g., ATR, Volume, CCI)..."
                          value={conditionSearch}
                          onChange={(e) => setConditionSearch(e.target.value)}
                          className="pl-10 bg-background/50"
                        />
                      </div>

                      {/* Advanced Condition Categories */}
                      <div className="space-y-4">
                        {/* Crossovers Category */}
                        {(!conditionSearch || 'crossovers'.includes(conditionSearch.toLowerCase()) || 'cci'.includes(conditionSearch.toLowerCase()) || 'atr'.includes(conditionSearch.toLowerCase())) && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Crossovers</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div 
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                                  strategySettings.defaultEntryCondition === 'cci_zero_cross' ? 'border-primary bg-primary/5' : 'border-border bg-card/50'
                                }`}
                                onClick={() => updateStrategySetting('defaultEntryCondition', 'cci_zero_cross')}
                              >
                                <div className="text-sm font-medium">CCI Zero Cross</div>
                                <div className="text-xs text-muted-foreground">CCI crosses above/below zero line</div>
                              </div>
                              <div 
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                                  strategySettings.defaultEntryCondition === 'stoch_cross' ? 'border-primary bg-primary/5' : 'border-border bg-card/50'
                                }`}
                                onClick={() => updateStrategySetting('defaultEntryCondition', 'stoch_cross')}
                              >
                                <div className="text-sm font-medium">Stochastic Cross</div>
                                <div className="text-xs text-muted-foreground">%K crosses %D line</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Thresholds Category */}
                        {(!conditionSearch || 'thresholds'.includes(conditionSearch.toLowerCase()) || 'rsi'.includes(conditionSearch.toLowerCase()) || 'volume'.includes(conditionSearch.toLowerCase())) && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Thresholds</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div 
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                                  strategySettings.defaultEntryCondition === 'rsi_overbought' ? 'border-primary bg-primary/5' : 'border-border bg-card/50'
                                }`}
                                onClick={() => updateStrategySetting('defaultEntryCondition', 'rsi_overbought')}
                              >
                                <div className="text-sm font-medium">RSI Overbought/Oversold</div>
                                <div className="text-xs text-muted-foreground">RSI above 70 or below 30</div>
                              </div>
                              <div 
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                                  strategySettings.defaultEntryCondition === 'volume_spike' ? 'border-primary bg-primary/5' : 'border-border bg-card/50'
                                }`}
                                onClick={() => updateStrategySetting('defaultEntryCondition', 'volume_spike')}
                              >
                                <div className="text-sm font-medium">Volume Spike</div>
                                <div className="text-xs text-muted-foreground">Volume above average threshold</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Breakouts Category */}
                        {(!conditionSearch || 'breakouts'.includes(conditionSearch.toLowerCase()) || 'channel'.includes(conditionSearch.toLowerCase()) || 'bollinger'.includes(conditionSearch.toLowerCase())) && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Breakouts</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div 
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                                  strategySettings.defaultEntryCondition === 'channel_breakout' ? 'border-primary bg-primary/5' : 'border-border bg-card/50'
                                }`}
                                onClick={() => updateStrategySetting('defaultEntryCondition', 'channel_breakout')}
                              >
                                <div className="text-sm font-medium">Channel Breakout</div>
                                <div className="text-xs text-muted-foreground">Price breaks highest high/lowest low</div>
                              </div>
                              <div 
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                                  strategySettings.defaultEntryCondition === 'bb_breakout' ? 'border-primary bg-primary/5' : 'border-border bg-card/50'
                                }`}
                                onClick={() => updateStrategySetting('defaultEntryCondition', 'bb_breakout')}
                              >
                                <div className="text-sm font-medium">Bollinger Band Breakout</div>
                                <div className="text-xs text-muted-foreground">Price breaks upper/lower band</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Filters Category */}
                        {(!conditionSearch || 'filters'.includes(conditionSearch.toLowerCase()) || 'atr'.includes(conditionSearch.toLowerCase()) || 'adx'.includes(conditionSearch.toLowerCase())) && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Filters</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div 
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                                  strategySettings.defaultEntryCondition === 'atr_filter' ? 'border-primary bg-primary/5' : 'border-border bg-card/50'
                                }`}
                                onClick={() => updateStrategySetting('defaultEntryCondition', 'atr_filter')}
                              >
                                <div className="text-sm font-medium">ATR Filter</div>
                                <div className="text-xs text-muted-foreground">ATR above threshold for volatility</div>
                              </div>
                              <div 
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                                  strategySettings.defaultEntryCondition === 'adx_filter' ? 'border-primary bg-primary/5' : 'border-border bg-card/50'
                                }`}
                                onClick={() => updateStrategySetting('defaultEntryCondition', 'adx_filter')}
                              >
                                <div className="text-sm font-medium">ADX Trend Filter</div>
                                <div className="text-xs text-muted-foreground">ADX above 25 for strong trend</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* No Results */}
                        {conditionSearch && !['crossovers', 'thresholds', 'breakouts', 'filters', 'cci', 'atr', 'rsi', 'volume', 'channel', 'bollinger', 'adx'].some(term => 
                          term.includes(conditionSearch.toLowerCase()) || conditionSearch.toLowerCase().includes(term)
                        ) && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No conditions found for "{conditionSearch}"</p>
                            <p className="text-xs mt-1">Try searching for: EMA, MACD, RSI, ATR, Volume, etc.</p>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Conflict Warning for Custom Mode */}
                  {strategySettings.entryMode === 'custom' && (
                    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800 dark:text-amber-200">
                        Using custom entry rules. Default entry condition is disabled. Configure custom rules in Advanced Strategy Settings below.
                      </AlertDescription>
                    </Alert>
                   )}
                </div>
              </CardContent>
            </Card>

            {/* 2. Advanced Strategy Settings - Collapsible */}
            <Collapsible open={isAdvancedStrategyOpen} onOpenChange={setIsAdvancedStrategyOpen}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg border hover:border-primary/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Advanced Strategy Settings</CardTitle>
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
                          Reset All
                        </Button>
                        <Badge variant="outline">Expert Settings</Badge>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedStrategyOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="space-y-4 mt-4">
                  {/* Entry Logic (Advanced) */}
                  <Card className="frosted">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Entry Logic (Advanced)</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setStrategySettings(prev => ({
                              ...prev,
                              entryMode: defaultStrategySettings.entryMode,
                              entryRules: defaultStrategySettings.entryRules,
                              entryJoiner: defaultStrategySettings.entryJoiner,
                              confirmBars: defaultStrategySettings.confirmBars,
                              htfConfirm: defaultStrategySettings.htfConfirm,
                              tradeDirection: defaultStrategySettings.tradeDirection,
                              minBetweenEntries: defaultStrategySettings.minBetweenEntries,
                              oneTradePerSession: defaultStrategySettings.oneTradePerSession
                            }));
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Return to Default
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Build multi-condition entries with AND/OR and confirmation windows
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Entry Mode */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Entry Mode</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Choose between simple default entry or custom multi-condition rules.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={strategySettings.entryMode} onValueChange={(value) => updateStrategySetting('entryMode', value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Use Default Entry</SelectItem>
                            <SelectItem value="custom">Custom Rules (AND/OR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Custom Entry Rules */}
                      {strategySettings.entryMode === 'custom' && (
                        <div className="space-y-4 p-4 border border-border/50 rounded-lg bg-background/30">
                          <div className="flex items-center justify-between">
                            <Label className="font-medium">Entry Rules</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addEntryRule}
                              className="text-xs"
                            >
                              Add Rule
                            </Button>
                          </div>
                          
                          {strategySettings.entryRules.map((rule, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 border border-border/30 rounded-md bg-background/20">
                              <Select value={rule.type} onValueChange={(value) => updateEntryRule(index, 'type', value)}>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ema_cross">EMA Cross</SelectItem>
                                  <SelectItem value="macd_cross">MACD Cross</SelectItem>
                                  <SelectItem value="rsi_threshold">RSI Threshold</SelectItem>
                                  <SelectItem value="price_vs_ma">Price vs MA</SelectItem>
                                  <SelectItem value="channel_breakout">Channel Breakout</SelectItem>
                                  <SelectItem value="volume_sma">Volume {'>'} SMA</SelectItem>
                                  <SelectItem value="atr_threshold">ATR {'>'} Threshold</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Select value={rule.operator} onValueChange={(value) => updateEntryRule(index, 'operator', value)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cross_up">Cross Up</SelectItem>
                                  <SelectItem value="cross_down">Cross Down</SelectItem>
                                  <SelectItem value=">">{'>'}</SelectItem>
                                  <SelectItem value="<">{'<'}</SelectItem>
                                  <SelectItem value=">=">{'>='}</SelectItem>
                                  <SelectItem value="<=">{' <='}</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Input
                                type="number"
                                value={rule.param1}
                                onChange={(e) => updateEntryRule(index, 'param1', Number(e.target.value))}
                                className="w-20"
                                placeholder="P1"
                              />
                              
                              <Input
                                type="number"
                                value={rule.param2}
                                onChange={(e) => updateEntryRule(index, 'param2', Number(e.target.value))}
                                className="w-20"
                                placeholder="P2"
                              />
                              
                              {strategySettings.entryRules.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEntryRule(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}

                          {strategySettings.entryRules.length > 1 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Label className="font-medium">Rule Joiner</Label>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">AND requires all rules to be true. OR requires any rule to be true.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Select value={strategySettings.entryJoiner} onValueChange={(value) => updateStrategySetting('entryJoiner', value)}>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AND">AND</SelectItem>
                                  <SelectItem value="OR">OR</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Label className="font-medium">Confirm Bars</Label>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Condition must be true for X bars before entry.</p>
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
                                <Label className="font-medium">HTF Confirm</Label>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Require higher timeframe trend confirmation (configured on Timeframe page).</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Switch
                                checked={strategySettings.htfConfirm}
                                onCheckedChange={(checked) => updateStrategySetting('htfConfirm', checked)}
                              />
                              {strategySettings.htfConfirm && (
                                <p className="text-xs text-muted-foreground">Configured on Timeframe page</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Direction & Re-entry */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Label className="font-medium">Trade Direction</Label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-4 h-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Restrict trading to long only, short only, or both directions.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Select value={strategySettings.tradeDirection} onValueChange={(value) => updateStrategySetting('tradeDirection', value)}>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="both">Both</SelectItem>
                              <SelectItem value="long">Long Only</SelectItem>
                              <SelectItem value="short">Short Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Label className="font-medium">Min Bars Between</Label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-4 h-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Minimum bars required between entries to prevent overtrading.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            type="number"
                            value={strategySettings.minBetweenEntries}
                            onChange={(e) => updateStrategySetting('minBetweenEntries', Number(e.target.value))}
                            min="1"
                            max="100"
                            className="bg-background/50"
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Label className="font-medium">One Trade Per Session</Label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-4 h-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Limit to one trade per trading session/day.</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Switch
                            checked={strategySettings.oneTradePerSession}
                            onCheckedChange={(checked) => updateStrategySetting('oneTradePerSession', checked)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="frosted">
                    <CardHeader>
                      <CardTitle className="text-base">Indicator Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Indicator Source */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Indicator Source</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Price data source for indicator calculations (close, open, hl2, ohlc4).</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={strategySettings.indicatorSource} onValueChange={(value) => updateStrategySetting('indicatorSource', value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="close">Close</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="hl2">HL2</SelectItem>
                            <SelectItem value="ohlc4">OHLC4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Moving Average Type */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Moving Average Type</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Type of moving average for calculations (EMA, SMA, WMA, HMA).</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={strategySettings.maType} onValueChange={(value) => updateStrategySetting('maType', value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EMA">EMA</SelectItem>
                            <SelectItem value="SMA">SMA</SelectItem>
                            <SelectItem value="WMA">WMA</SelectItem>
                            <SelectItem value="HMA">HMA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* RSI Overbought */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">RSI Overbought Level</Label>
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
                          max="95"
                          className="bg-background/50"
                        />
                      </div>

                      {/* RSI Oversold */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">RSI Oversold Level</Label>
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
                          min="5"
                          max="50"
                          className="bg-background/50"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="frosted">
                    <CardHeader>
                      <CardTitle className="text-base">Strategy Logic</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Entry Confirmation */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Multi-Indicator Confirmation</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Require multiple indicators to confirm entry signals.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Switch 
                          checked={strategySettings.entryConfirmation}
                          onCheckedChange={(checked) => updateStrategySetting('entryConfirmation', checked)}
                        />
                      </div>

                      {/* Trade Direction */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Trade Direction</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Limit the bot to trade only in your chosen direction.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={strategySettings.tradeDirection} onValueChange={(value) => updateStrategySetting('tradeDirection', value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="both">Long & Short</SelectItem>
                            <SelectItem value="long">Long Only</SelectItem>
                            <SelectItem value="short">Short Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Re-entry Rules */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Bars Between Trades</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Prevent over-trading by spacing out entries.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          value={strategySettings.reentryBars}
                          onChange={(e) => updateStrategySetting('reentryBars', Number(e.target.value))}
                          min="0"
                          max="50"
                          className="bg-background/50"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 3. Default Exit Settings - Always Visible */}
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
                    Return to Default
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Simple stop and target values for beginners
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Simple Stop Loss */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Stop Loss (%)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Maximum loss per trade before automatically closing the position.</p>
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
                      placeholder="5.0"
                      className="bg-background/50"
                      disabled={exitSettings.atrStopEnabled}
                    />
                    {exitSettings.atrStopEnabled && (
                      <p className="text-xs text-amber-600">Disabled: ATR Stop Loss is active</p>
                    )}
                  </div>

                  {/* Simple Take Profit */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Take Profit (%)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Target profit level where the position closes automatically.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      value={exitSettings.takeProfit}
                      onChange={(e) => updateExitSetting('takeProfit', Number(e.target.value))}
                      min="0.1"
                      max="100"
                      step="0.1"
                      placeholder="10.0"
                      className="bg-background/50"
                      disabled={exitSettings.multiTpEnabled}
                    />
                    {exitSettings.multiTpEnabled && (
                      <p className="text-xs text-amber-600">Disabled: Multi-TP is active</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Advanced Exit Settings - Collapsible */}
            <Collapsible open={isAdvancedExitOpen} onOpenChange={setIsAdvancedExitOpen}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg border hover:border-primary/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Advanced Exit Settings</CardTitle>
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
                          Reset All
                        </Button>
                        <Badge variant="outline">Expert Settings</Badge>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedExitOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="space-y-4 mt-4">
                  {/* Conflict warnings */}
                  {conflicts.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {conflicts.map((conflict, index) => (
                            <p key={index} className="text-sm">⚠️ {conflict}</p>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Multi-TP Settings */}
                  <Card className="frosted">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={exitSettings.multiTpEnabled}
                            onCheckedChange={(checked) => updateExitSetting('multiTpEnabled', checked)}
                          />
                          <span>Multi-TP (TP1–TP3)</span>
                        </div>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Split your trade into multiple targets and lock in profits step by step.</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                    </CardHeader>
                    {exitSettings.multiTpEnabled && (
                      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">TP1 (%) / Allocation</Label>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Trail after?</span>
                              <Switch 
                                checked={exitSettings.tp1TrailingEnabled}
                                onCheckedChange={(checked) => updateExitSetting('tp1TrailingEnabled', checked)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              value={exitSettings.tp1}
                              onChange={(e) => updateExitSetting('tp1', Number(e.target.value))}
                              placeholder="5.0"
                              className="bg-background/50"
                            />
                            <Input
                              type="number"
                              value={exitSettings.tp1Allocation}
                              onChange={(e) => updateExitSetting('tp1Allocation', Number(e.target.value))}
                              placeholder="33"
                              max="100"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">TP2 (%) / Allocation</Label>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Trail after?</span>
                              <Switch 
                                checked={exitSettings.tp2TrailingEnabled}
                                onCheckedChange={(checked) => updateExitSetting('tp2TrailingEnabled', checked)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              value={exitSettings.tp2}
                              onChange={(e) => updateExitSetting('tp2', Number(e.target.value))}
                              placeholder="10.0"
                              className="bg-background/50"
                            />
                            <Input
                              type="number"
                              value={exitSettings.tp2Allocation}
                              onChange={(e) => updateExitSetting('tp2Allocation', Number(e.target.value))}
                              placeholder="33"
                              max="100"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">TP3 (%) / Allocation</Label>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Trail after?</span>
                              <Switch 
                                checked={exitSettings.tp3TrailingEnabled}
                                onCheckedChange={(checked) => updateExitSetting('tp3TrailingEnabled', checked)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              value={exitSettings.tp3}
                              onChange={(e) => updateExitSetting('tp3', Number(e.target.value))}
                              placeholder="15.0"
                              className="bg-background/50"
                            />
                            <Input
                              type="number"
                              value={exitSettings.tp3Allocation}
                              onChange={(e) => updateExitSetting('tp3Allocation', Number(e.target.value))}
                              placeholder="34"
                              max="100"
                              className="bg-background/50"
                            />
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Break-even Toggle */}
                  <Card className="frosted">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={exitSettings.breakEvenEnabled}
                            onCheckedChange={(checked) => updateExitSetting('breakEvenEnabled', checked)}
                          />
                          <span>Break-even Protection</span>
                        </div>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Protect capital by moving stop to entry once a trade is in profit.</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                    </CardHeader>
                    {exitSettings.breakEvenEnabled && (
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Trigger at Profit (%)</Label>
                          <Input
                            type="number"
                            value={exitSettings.breakEvenTrigger}
                            onChange={(e) => updateExitSetting('breakEvenTrigger', Number(e.target.value))}
                            placeholder="2.0"
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Offset (%)</Label>
                          <Input
                            type="number"
                            value={exitSettings.breakEvenOffset}
                            onChange={(e) => updateExitSetting('breakEvenOffset', Number(e.target.value))}
                            placeholder="0.1"
                            step="0.1"
                            className="bg-background/50"
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Trailing Stop */}
                  <Card className="frosted">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <span>Trailing Stop</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Follow the price as it moves in your favor. Choose % or volatility-based trailing.</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                          <Label className="text-sm font-medium">Trailing Percentage (%)</Label>
                          <Input
                            type="number"
                            value={exitSettings.trailingPercent}
                            onChange={(e) => updateExitSetting('trailingPercent', Number(e.target.value))}
                            placeholder="2.0"
                            className="bg-background/50"
                          />
                        </div>
                      )}
                      
                      {(exitSettings.trailingType === 'atr' || exitSettings.trailingType === 'hybrid') && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">ATR Multiplier</Label>
                          <Input
                            type="number"
                            value={exitSettings.trailingAtr}
                            onChange={(e) => updateExitSetting('trailingAtr', Number(e.target.value))}
                            placeholder="1.5"
                            step="0.1"
                            className="bg-background/50"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* ATR-based Stop Loss */}
                  <Card className="frosted">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={exitSettings.atrStopEnabled}
                            onCheckedChange={(checked) => updateExitSetting('atrStopEnabled', checked)}
                          />
                          <span>ATR-based Stop Loss</span>
                        </div>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Use volatility to size stops dynamically.</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                    </CardHeader>
                    {exitSettings.atrStopEnabled && (
                      <CardContent>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">ATR Multiplier</Label>
                          <Input
                            type="number"
                            value={exitSettings.atrMultiplier}
                            onChange={(e) => updateExitSetting('atrMultiplier', Number(e.target.value))}
                            placeholder="2.0"
                            step="0.1"
                            className="bg-background/50"
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {/* Time-based Exit */}
                  <Card className="frosted">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <span>Time-based Exit</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Exit after a set time to reduce risk of overexposure.</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select value={exitSettings.timeExitType} onValueChange={(value) => updateExitSetting('timeExitType', value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="candles">After X candles</SelectItem>
                          <SelectItem value="daily_close">Exit at daily close</SelectItem>
                          <SelectItem value="weekly_close">Exit at weekly close</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {exitSettings.timeExitType === 'candles' && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Number of Candles</Label>
                          <Input
                            type="number"
                            value={exitSettings.timeExitCandles}
                            onChange={(e) => updateExitSetting('timeExitCandles', Number(e.target.value))}
                            placeholder="24"
                            className="bg-background/50"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Exit Priority */}
                  <Card className="frosted">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <span>Exit Priority</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Control which rule has priority: TPs, trailing, or time-based.</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={exitSettings.exitPriority} onValueChange={(value) => updateExitSetting('exitPriority', value)}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tp_first">Take Profit First</SelectItem>
                          <SelectItem value="trailing_first">Trailing First</SelectItem>
                          <SelectItem value="time_first">Time-based First</SelectItem>
                          <SelectItem value="closest_first">Closest Target First</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        <div className="flex items-center justify-between pt-6">
          <Button onClick={onPrevious} variant="outline" size="lg" className="px-8">
            Previous
          </Button>
          <Button onClick={onNext} size="lg" className="px-8">
            Continue to Risk Management
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}