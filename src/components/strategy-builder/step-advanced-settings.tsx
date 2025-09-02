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
import { Info, ChevronDown, Settings, TrendingUp, BarChart3, Target, AlertTriangle } from 'lucide-react';
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
    entryConfirmation: false,
    tradeDirection: 'both',
    reentryBars: 1
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
    entryConfirmation: false,
    tradeDirection: 'both',
    reentryBars: 1
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
          macdSignal: defaultStrategySettings.macdSignal
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