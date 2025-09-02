import { Strategy, IndicatorConfig, UserTier } from '@/types/botforge';
import { getBFConfig, getStrategyConfig } from '@/lib/config-store';
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
import { Info, ChevronDown, Settings, TrendingUp, BarChart3, Target, AlertTriangle, RotateCcw, X, Plus, Filter, DollarSign, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StepAdvancedSettingsProps {
  strategy: Strategy | null;
  selectedStrategyKey: string | null;
  filterIndicators: IndicatorConfig[];
  onUpdateFilters: (filters: IndicatorConfig[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  userTier: UserTier;
}

interface EntryCondition {
  id: string;
  lhs: string;
  op: string;
  rhs: string | number;
}

interface FilterSettings {
  htfTrendFilter: {
    enabled: boolean;
    asset: string;
    timeframe: string;
    maType: string;
    period: number;
    useOwnPair: boolean;
  };
  volumeGate: {
    enabled: boolean;
    period: number;
    multiplier: number;
  };
  atrActivityGate: {
    enabled: boolean;
    period: number;
    threshold: number;
  };
}

interface ExitSettings {
  // Basic exits
  stopLossEnabled: boolean;
  stopLossPercent: number;
  takeProfitEnabled: boolean;
  takeProfitPercent: number;

  // Smart exits
  tp1: { enabled: boolean; percent: number; allocation: number; trailAfterHit: boolean };
  tp2: { enabled: boolean; percent: number; allocation: number; trailAfterHit: boolean };
  tp3: { enabled: boolean; percent: number; allocation: number; trailAfterHit: boolean };
  
  breakEven: { enabled: boolean; triggerPercent: number; offset: number };
  
  trailingStop: { 
    enabled: boolean; 
    mode: 'fixed' | 'atr' | 'hybrid'; 
    fixedPercent: number; 
    atrMultiplier: number; 
    atrLength: number;
  };
  
  atrStopLoss: { enabled: boolean; multiplier: number; atrLength: number };
  timeBasedExit: { 
    enabled: boolean; 
    mode: 'candles' | 'daily_close' | 'weekly_close'; 
    candleCount: number; 
  };
  
  exitPriority: string[];
}

export function StepAdvancedSettings({ 
  strategy, 
  selectedStrategyKey,
  filterIndicators, 
  onUpdateFilters, 
  onNext, 
  onPrevious,
  userTier 
}: StepAdvancedSettingsProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDefaultExitOpen, setIsDefaultExitOpen] = useState(false);
  const [isAdvancedExitOpen, setIsAdvancedExitOpen] = useState(false);
  
  // Entry conditions from BF_CONFIG
  const [entryConditions, setEntryConditions] = useState<EntryCondition[]>([]);
  const [entryLogic, setEntryLogic] = useState('AND');
  const [entryDirection, setEntryDirection] = useState('long_only');
  const [entryInverse, setEntryInverse] = useState(false);
  const [activeTiles, setActiveTiles] = useState<Set<string>>(new Set());
  
  // Indicator settings
  const [indicatorSettings, setIndicatorSettings] = useState<Record<string, any>>({
    ema: { fast: 12, slow: 26, maType: 'EMA' },
    rsi: { length: 14, overbought: 70, oversold: 30 },
    atr: { length: 14 },
    macd: { fast: 12, slow: 26, signal: 9 },
    bb: { period: 20, stdDev: 2 },
    stoch: { k: 14, d: 3, overbought: 80, oversold: 20 },
    sma: { period: 50 },
    vwap: {},
  });

  // Filter settings
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    htfTrendFilter: {
      enabled: false,
      asset: 'BTC/USDT',
      timeframe: 'Daily',
      maType: 'EMA',
      period: 200,
      useOwnPair: false
    },
    volumeGate: {
      enabled: false,
      period: 20,
      multiplier: 1.5
    },
    atrActivityGate: {
      enabled: false,
      period: 14,
      threshold: 0.002
    }
  });

  // Exit settings  
  const [exitSettings, setExitSettings] = useState<ExitSettings>({
    // Basic exits
    stopLossEnabled: true,
    stopLossPercent: 5.0,
    takeProfitEnabled: true,
    takeProfitPercent: 10.0,

    // Smart exits
    tp1: { enabled: false, percent: 5.0, allocation: 33, trailAfterHit: false },
    tp2: { enabled: false, percent: 10.0, allocation: 33, trailAfterHit: false },
    tp3: { enabled: false, percent: 20.0, allocation: 34, trailAfterHit: false },
    
    breakEven: { enabled: false, triggerPercent: 3.0, offset: 0.1 },
    
    trailingStop: { 
      enabled: false, 
      mode: 'fixed', 
      fixedPercent: 2.0, 
      atrMultiplier: 2.0, 
      atrLength: 14
    },
    
    atrStopLoss: { enabled: false, multiplier: 2.0, atrLength: 14 },
    timeBasedExit: { 
      enabled: false, 
      mode: 'candles', 
      candleCount: 10
    },
    
    exitPriority: ['Trailing', 'TP', 'Time', 'Stop Loss']
  });

  // Load strategy config when selectedStrategyKey changes
  useEffect(() => {
    if (!selectedStrategyKey) return;
    
    try {
      const strategyConfig = getStrategyConfig(selectedStrategyKey);
      if (strategyConfig) {
        // Load default seeds as entry conditions
        const defaultConditions = strategyConfig.defaultSeeds.map((seed, index) => ({
          id: `condition_${index + 1}`,
          lhs: seed.lhs,
          op: seed.op,
          rhs: seed.rhs
        }));
        
        setEntryConditions(defaultConditions);
        
        // Update active tiles based on default seeds
        const newActiveTiles = new Set<string>();
        strategyConfig.tiles.forEach(tile => {
          // Check if any default seed uses this tile's operands
          const hasOperands = strategyConfig.defaultSeeds.some(seed => 
            strategyConfig.operands[tile]?.includes(seed.lhs) || 
            strategyConfig.operands[tile]?.includes(String(seed.rhs))
          );
          if (hasOperands) {
            newActiveTiles.add(tile);
          }
        });
        setActiveTiles(newActiveTiles);
      }
    } catch (error) {
      console.error('Failed to load strategy config:', error);
    }
  }, [selectedStrategyKey]);

  const handleTileClick = (tile: string) => {
    if (!selectedStrategyKey) return;
    
    const strategyConfig = getStrategyConfig(selectedStrategyKey);
    if (!strategyConfig) return;

    const newActiveTiles = new Set(activeTiles);
    
    if (activeTiles.has(tile)) {
      // Remove tile and its conditions
      newActiveTiles.delete(tile);
      const updatedConditions = entryConditions.filter(condition => {
        const operands = strategyConfig.operands[tile] || [];
        return !operands.includes(condition.lhs) && !operands.includes(String(condition.rhs));
      });
      setEntryConditions(updatedConditions);
    } else {
      // Add tile - user can then add conditions for it
      if (entryConditions.length < 5) {
        newActiveTiles.add(tile);
      }
    }
    
    setActiveTiles(newActiveTiles);
  };

  const addCondition = (tile: string) => {
    if (!selectedStrategyKey || entryConditions.length >= 5) return;
    
    const strategyConfig = getStrategyConfig(selectedStrategyKey);
    if (!strategyConfig) return;
    
    const operands = strategyConfig.operands[tile] || [];
    if (operands.length >= 2) {
      const newCondition: EntryCondition = {
        id: `condition_${Date.now()}`,
        lhs: operands[0],
        op: 'is_above',
        rhs: operands[1]
      };
      setEntryConditions([...entryConditions, newCondition]);
    }
  };

  const removeCondition = (conditionId: string) => {
    setEntryConditions(entryConditions.filter(c => c.id !== conditionId));
  };

  const updateCondition = (conditionId: string, field: string, value: any) => {
    setEntryConditions(entryConditions.map(condition => 
      condition.id === conditionId 
        ? { ...condition, [field]: value }
        : condition
    ));
  };

  const resetToDefaults = () => {
    if (!selectedStrategyKey) return;
    
    try {
      const strategyConfig = getStrategyConfig(selectedStrategyKey);
      if (strategyConfig) {
        const defaultConditions = strategyConfig.defaultSeeds.map((seed, index) => ({
          id: `condition_${index + 1}`,
          lhs: seed.lhs,
          op: seed.op,
          rhs: seed.rhs
        }));
        setEntryConditions(defaultConditions);
        
        // Reset active tiles
        const newActiveTiles = new Set<string>();
        strategyConfig.tiles.forEach(tile => {
          const hasOperands = strategyConfig.defaultSeeds.some(seed => 
            strategyConfig.operands[tile]?.includes(seed.lhs) || 
            strategyConfig.operands[tile]?.includes(String(seed.rhs))
          );
          if (hasOperands) {
            newActiveTiles.add(tile);
          }
        });
        setActiveTiles(newActiveTiles);
      }
    } catch (error) {
      console.error('Failed to reset to defaults:', error);
    }
  };

  const resetFiltersToDefault = () => {
    setFilterSettings({
      htfTrendFilter: {
        enabled: false,
        asset: 'BTC/USDT',
        timeframe: 'Daily',
        maType: 'EMA',
        period: 200,
        useOwnPair: false
      },
      volumeGate: {
        enabled: false,
        period: 20,
        multiplier: 1.5
      },
      atrActivityGate: {
        enabled: false,
        period: 14,
        threshold: 0.002
      }
    });
  };

  const resetDefaultExitsToDefault = () => {
    setExitSettings(prev => ({
      ...prev,
      stopLossEnabled: true,
      stopLossPercent: 5.0,
      takeProfitEnabled: true,
      takeProfitPercent: 10.0
    }));
  };

  const resetAdvancedExitsToDefault = () => {
    setExitSettings(prev => ({
      ...prev,
      tp1: { enabled: false, percent: 5.0, allocation: 33, trailAfterHit: false },
      tp2: { enabled: false, percent: 10.0, allocation: 33, trailAfterHit: false },
      tp3: { enabled: false, percent: 20.0, allocation: 34, trailAfterHit: false },
      breakEven: { enabled: false, triggerPercent: 3.0, offset: 0.1 },
      trailingStop: { 
        enabled: false, 
        mode: 'fixed', 
        fixedPercent: 2.0, 
        atrMultiplier: 2.0, 
        atrLength: 14
      },
      atrStopLoss: { enabled: false, multiplier: 2.0, atrLength: 14 },
      timeBasedExit: { 
        enabled: false, 
        mode: 'candles', 
        candleCount: 10
      },
      exitPriority: ['Trailing', 'TP', 'Time', 'Stop Loss']
    }));
  };

  if (!selectedStrategyKey) {
    return (
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please select a strategy first to configure advanced settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const strategyConfig = getStrategyConfig(selectedStrategyKey);
  const globalConfig = getBFConfig().global;
  
  if (!strategyConfig) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Configuration not found for selected strategy.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get preview text for entry conditions
  const getPreviewText = () => {
    if (entryConditions.length === 0) return "No entry conditions defined";
    
    const config = getBFConfig();
    const conditionTexts = entryConditions.map(condition => {
      const leftLabel = config.operandLabels[condition.lhs] || condition.lhs;
      const rightLabel = typeof condition.rhs === 'string' 
        ? config.operandLabels[condition.rhs] || condition.rhs
        : condition.rhs;
      const opLabel = globalConfig.operators.find(op => op.key === condition.op)?.label || condition.op;
      return `${leftLabel} ${opLabel} ${rightLabel}`;
    });
    
    const combiner = entryLogic === 'AND' ? ' AND ' : ' OR ';
    let preview = `Go ${entryDirection === 'long_only' ? 'Long' : entryDirection === 'short_only' ? 'Short' : 'Long/Short'} when `;
    preview += conditionTexts.join(combiner);
    
    if (entryInverse) {
      preview = preview.replace('when ', 'when NOT (') + ')';
    }
    
    return preview;
  };

  // Check for conflicts
  const hasStopLossConflict = exitSettings.stopLossEnabled && exitSettings.atrStopLoss.enabled;
  const showATRLength = exitSettings.trailingStop.enabled && exitSettings.trailingStop.mode !== 'fixed' || exitSettings.atrStopLoss.enabled;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <header>
          <h2 className="text-xl font-semibold">Advanced Settings</h2>
          <p className="text-muted-foreground text-sm">
            Configure indicators and entry conditions for {strategy?.name}
          </p>
        </header>

        {/* Indicator Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Indicator Settings</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{globalConfig.blurbs.indicatorSettings}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(strategyConfig.indicatorSettings).map(([indicator, config]) => (
              <div key={indicator} className="space-y-4">
                <h4 className="font-medium capitalize">
                  {getBFConfig().indicatorLabels[indicator] || indicator} Settings
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.fields.map((field) => (
                    <div key={field} className="space-y-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label className="capitalize">{field}</Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Configure the {field} parameter for {getBFConfig().indicatorLabels[indicator] || indicator}</p>
                        </TooltipContent>
                      </Tooltip>
                      {field.includes('length') || field.includes('period') || field.includes('fast') || field.includes('slow') || field.includes('signal') ? (
                        <Input
                          type="number"
                          value={indicatorSettings[indicator]?.[field] || ''}
                          onChange={(e) => setIndicatorSettings(prev => ({
                            ...prev,
                            [indicator]: {
                              ...prev[indicator],
                              [field]: Number(e.target.value)
                            }
                          }))}
                        />
                      ) : field === 'maType' ? (
                        <Select
                          value={indicatorSettings[indicator]?.[field] || 'EMA'}
                          onValueChange={(value) => setIndicatorSettings(prev => ({
                            ...prev,
                            [indicator]: {
                              ...prev[indicator],
                              [field]: value
                            }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EMA">EMA</SelectItem>
                            <SelectItem value="SMA">SMA</SelectItem>
                            <SelectItem value="WMA">WMA</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type="number"
                          value={indicatorSettings[indicator]?.[field] || ''}
                          onChange={(e) => setIndicatorSettings(prev => ({
                            ...prev,
                            [indicator]: {
                              ...prev[indicator],
                              [field]: Number(e.target.value)
                            }
                          }))}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={resetToDefaults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Return to Default
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Entry Conditions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>Entry Conditions</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{globalConfig.blurbs.entryConditions}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Combiner Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Logic Combiner</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select value={entryLogic} onValueChange={setEntryLogic}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {globalConfig.combiners.map(combiner => (
                          <SelectItem key={combiner.key} value={combiner.key}>
                            {combiner.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{globalConfig.tooltips.combiner}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="space-y-2">
                <Label>Direction</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Select value={entryDirection} onValueChange={setEntryDirection}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {globalConfig.directions.map(direction => (
                          <SelectItem key={direction.key} value={direction.key}>
                            {direction.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{globalConfig.tooltips.entryDirection}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <div className="space-y-2">
                <Label>Inverse Signals</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={entryInverse}
                        onCheckedChange={setEntryInverse}
                      />
                      <span className="text-sm">{entryInverse ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{globalConfig.tooltips.entryInverse}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Available Indicator Tiles */}
            <div className="space-y-3">
              <Label>Available Indicators</Label>
              <div className="flex flex-wrap gap-2">
                {strategyConfig.tiles.map((tile) => {
                  const isActive = activeTiles.has(tile);
                  const indicatorLabel = getBFConfig().indicatorLabels[tile] || tile;
                  
                  return (
                    <Button
                      key={tile}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTileClick(tile)}
                      className={isActive ? "bg-primary" : ""}
                    >
                      {indicatorLabel}
                      {isActive && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Active Conditions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Active Conditions ({entryConditions.length}/{globalConfig.ruleCap})</Label>
                <Button variant="outline" size="sm" onClick={resetToDefaults}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Return to Default
                </Button>
              </div>
              
              {entryConditions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Click on indicator tiles above to add entry conditions
                </div>
              ) : (
                <div className="space-y-3">
                  {entryConditions.map((condition, index) => {
                    const config = getBFConfig();
                    const availableOperands = new Set<string>();
                    
                    // Collect all operands from active tiles
                    Array.from(activeTiles).forEach(tile => {
                      const operands = strategyConfig.operands[tile] || [];
                      operands.forEach(op => availableOperands.add(op));
                    });
                    
                    return (
                      <div key={condition.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-mono">{index + 1}.</span>
                        
                        {/* Left Operand */}
                        <Select
                          value={condition.lhs}
                          onValueChange={(value) => updateCondition(condition.id, 'lhs', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(availableOperands).map(operand => (
                              <SelectItem key={operand} value={operand}>
                                {config.operandLabels[operand] || operand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Operator */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Select
                              value={condition.op}
                              onValueChange={(value) => updateCondition(condition.id, 'op', value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {globalConfig.operators.map(op => (
                                  <SelectItem key={op.key} value={op.key}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{globalConfig.operators.find(op => op.key === condition.op)?.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Right Operand */}
                        {condition.op === 'is_true' ? (
                          <span className="text-sm text-muted-foreground">-</span>
                        ) : (
                          <Select
                            value={String(condition.rhs)}
                            onValueChange={(value) => {
                              // Try to parse as number, otherwise keep as string
                              const numValue = Number(value);
                              updateCondition(condition.id, 'rhs', isNaN(numValue) ? value : numValue);
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(availableOperands).map(operand => (
                                <SelectItem key={operand} value={operand}>
                                  {config.operandLabels[operand] || operand}
                                </SelectItem>
                              ))}
                              {/* Common numeric values */}
                              <SelectItem value="0">0</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="30">30</SelectItem>
                              <SelectItem value="70">70</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(condition.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium">Preview</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {getPreviewText()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <CardTitle>Filters</CardTitle>
                    <Badge variant="secondary">Optional</Badge>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Additional filters are AND-gated with entry conditions for extra confirmation</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* HTF Trend Filter */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={filterSettings.htfTrendFilter.enabled}
                        onCheckedChange={(checked) => setFilterSettings(prev => ({
                          ...prev,
                          htfTrendFilter: { ...prev.htfTrendFilter, enabled: checked }
                        }))}
                      />
                      <Label>HTF Trend Filter</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Only take longs if BTC is above its daily EMA 200; shorts if below</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {filterSettings.htfTrendFilter.enabled && (
                      <div className="space-y-2 ml-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={filterSettings.htfTrendFilter.useOwnPair}
                            onCheckedChange={(checked) => setFilterSettings(prev => ({
                              ...prev,
                              htfTrendFilter: { ...prev.htfTrendFilter, useOwnPair: checked }
                            }))}
                          />
                          <Label className="text-sm">Use own pair instead</Label>
                        </div>
                        {!filterSettings.htfTrendFilter.useOwnPair && (
                          <Input
                            placeholder="BTC/USDT"
                            value={filterSettings.htfTrendFilter.asset}
                            onChange={(e) => setFilterSettings(prev => ({
                              ...prev,
                              htfTrendFilter: { ...prev.htfTrendFilter, asset: e.target.value }
                            }))}
                          />
                        )}
                        <Select
                          value={filterSettings.htfTrendFilter.timeframe}
                          onValueChange={(value) => setFilterSettings(prev => ({
                            ...prev,
                            htfTrendFilter: { ...prev.htfTrendFilter, timeframe: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4h">4H</SelectItem>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="200"
                          value={filterSettings.htfTrendFilter.period}
                          onChange={(e) => setFilterSettings(prev => ({
                            ...prev,
                            htfTrendFilter: { ...prev.htfTrendFilter, period: Number(e.target.value) }
                          }))}
                        />
                      </div>
                    )}
                  </div>

                  {/* Volume Gate */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={filterSettings.volumeGate.enabled}
                        onCheckedChange={(checked) => setFilterSettings(prev => ({
                          ...prev,
                          volumeGate: { ...prev.volumeGate, enabled: checked }
                        }))}
                      />
                      <Label>Volume Gate</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Only trade when volume is above its moving average</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {filterSettings.volumeGate.enabled && (
                      <div className="space-y-2 ml-6">
                        <Label className="text-sm">SMA Period</Label>
                        <Input
                          type="number"
                          value={filterSettings.volumeGate.period}
                          onChange={(e) => setFilterSettings(prev => ({
                            ...prev,
                            volumeGate: { ...prev.volumeGate, period: Number(e.target.value) }
                          }))}
                        />
                        <Label className="text-sm">Multiplier</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={filterSettings.volumeGate.multiplier}
                          onChange={(e) => setFilterSettings(prev => ({
                            ...prev,
                            volumeGate: { ...prev.volumeGate, multiplier: Number(e.target.value) }
                          }))}
                        />
                      </div>
                    )}
                  </div>

                  {/* ATR Activity Gate */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={filterSettings.atrActivityGate.enabled}
                        onCheckedChange={(checked) => setFilterSettings(prev => ({
                          ...prev,
                          atrActivityGate: { ...prev.atrActivityGate, enabled: checked }
                        }))}
                      />
                      <Label>ATR Activity Gate</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Only trade when ATR is above threshold (market is volatile enough)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {filterSettings.atrActivityGate.enabled && (
                      <div className="space-y-2 ml-6">
                        <Label className="text-sm">ATR Period</Label>
                        <Input
                          type="number"
                          value={filterSettings.atrActivityGate.period}
                          onChange={(e) => setFilterSettings(prev => ({
                            ...prev,
                            atrActivityGate: { ...prev.atrActivityGate, period: Number(e.target.value) }
                          }))}
                        />
                        <Label className="text-sm">Threshold</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={filterSettings.atrActivityGate.threshold}
                          onChange={(e) => setFilterSettings(prev => ({
                            ...prev,
                            atrActivityGate: { ...prev.atrActivityGate, threshold: Number(e.target.value) }
                          }))}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={resetFiltersToDefault}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return to Default
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Default Exit */}
        <Collapsible open={isDefaultExitOpen} onOpenChange={setIsDefaultExitOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <CardTitle>Default Exit</CardTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Basic stop loss and take profit settings</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDefaultExitOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stop Loss */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={exitSettings.stopLossEnabled}
                        onCheckedChange={(checked) => setExitSettings(prev => ({ ...prev, stopLossEnabled: checked }))}
                      />
                      <Label>Stop Loss %</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Maximum loss percentage before exiting the trade</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {exitSettings.stopLossEnabled && (
                      <div className="ml-6">
                        <Input
                          type="number"
                          step="0.1"
                          value={exitSettings.stopLossPercent}
                          onChange={(e) => setExitSettings(prev => ({ ...prev, stopLossPercent: Number(e.target.value) }))}
                        />
                      </div>
                    )}
                  </div>

                  {/* Take Profit */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={exitSettings.takeProfitEnabled}
                        onCheckedChange={(checked) => setExitSettings(prev => ({ ...prev, takeProfitEnabled: checked }))}
                      />
                      <Label>Take Profit %</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Target profit percentage to exit the trade</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {exitSettings.takeProfitEnabled && (
                      <div className="ml-6">
                        <Input
                          type="number"
                          step="0.1"
                          value={exitSettings.takeProfitPercent}
                          onChange={(e) => setExitSettings(prev => ({ ...prev, takeProfitPercent: Number(e.target.value) }))}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={resetDefaultExitsToDefault}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return to Default
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Advanced Exit Settings (Smart Exits) */}
        <Collapsible open={isAdvancedExitOpen} onOpenChange={setIsAdvancedExitOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <CardTitle>Advanced Exit (Smart Exits)</CardTitle>
                    <Badge variant="secondary">Optional</Badge>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedExitOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Conflict Warning */}
                {hasStopLossConflict && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      ATR Stop conflicts with Fixed Stop. Disable one to continue.
                    </AlertDescription>
                  </Alert>
                )}

                {/* TP Ladders */}
                <div className="space-y-4">
                  <h4 className="font-medium">Take Profit Ladders</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['tp1', 'tp2', 'tp3'].map((tp, index) => (
                      <div key={tp} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={(exitSettings as any)[tp].enabled}
                            onCheckedChange={(checked) => setExitSettings(prev => ({
                              ...prev,
                              [tp]: { ...(prev as any)[tp], enabled: checked }
                            }))}
                          />
                          <Label>TP{index + 1}</Label>
                        </div>
                        {(exitSettings as any)[tp].enabled && (
                          <div className="space-y-2 ml-6">
                            <Label className="text-sm">% Target</Label>
                            <Input
                              type="number"
                              step="0.1"
                              value={(exitSettings as any)[tp].percent}
                              onChange={(e) => setExitSettings(prev => ({
                                ...prev,
                                [tp]: { ...(prev as any)[tp], percent: Number(e.target.value) }
                              }))}
                            />
                            <Label className="text-sm">Allocation %</Label>
                            <Input
                              type="number"
                              value={(exitSettings as any)[tp].allocation}
                              onChange={(e) => setExitSettings(prev => ({
                                ...prev,
                                [tp]: { ...(prev as any)[tp], allocation: Number(e.target.value) }
                              }))}
                            />
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={(exitSettings as any)[tp].trailAfterHit}
                                onCheckedChange={(checked) => setExitSettings(prev => ({
                                  ...prev,
                                  [tp]: { ...(prev as any)[tp], trailAfterHit: checked }
                                }))}
                              />
                              <Label className="text-sm">Trail after hit</Label>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Break-even */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={exitSettings.breakEven.enabled}
                      onCheckedChange={(checked) => setExitSettings(prev => ({
                        ...prev,
                        breakEven: { ...prev.breakEven, enabled: checked }
                      }))}
                    />
                    <Label>Break-even</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Move stop loss to break-even when profit reaches trigger percentage</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {exitSettings.breakEven.enabled && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div className="space-y-2">
                        <Label className="text-sm">Trigger %</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={exitSettings.breakEven.triggerPercent}
                          onChange={(e) => setExitSettings(prev => ({
                            ...prev,
                            breakEven: { ...prev.breakEven, triggerPercent: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Offset %</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={exitSettings.breakEven.offset}
                          onChange={(e) => setExitSettings(prev => ({
                            ...prev,
                            breakEven: { ...prev.breakEven, offset: Number(e.target.value) }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Trailing Stop */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={exitSettings.trailingStop.enabled}
                      onCheckedChange={(checked) => setExitSettings(prev => ({
                        ...prev,
                        trailingStop: { ...prev.trailingStop, enabled: checked }
                      }))}
                    />
                    <Label>Trailing Stop</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Dynamic stop loss that follows price movement</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {exitSettings.trailingStop.enabled && (
                    <div className="space-y-4 ml-6">
                      <Select
                        value={exitSettings.trailingStop.mode}
                        onValueChange={(value: 'fixed' | 'atr' | 'hybrid') => setExitSettings(prev => ({
                          ...prev,
                          trailingStop: { ...prev.trailingStop, mode: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed %</SelectItem>
                          <SelectItem value="atr">ATR</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {exitSettings.trailingStop.mode === 'fixed' && (
                        <div className="space-y-2">
                          <Label className="text-sm">Fixed %</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={exitSettings.trailingStop.fixedPercent}
                            onChange={(e) => setExitSettings(prev => ({
                              ...prev,
                              trailingStop: { ...prev.trailingStop, fixedPercent: Number(e.target.value) }
                            }))}
                          />
                        </div>
                      )}
                      
                      {(exitSettings.trailingStop.mode === 'atr' || exitSettings.trailingStop.mode === 'hybrid') && (
                        <div className="space-y-2">
                          <Label className="text-sm">ATR Multiplier</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={exitSettings.trailingStop.atrMultiplier}
                            onChange={(e) => setExitSettings(prev => ({
                              ...prev,
                              trailingStop: { ...prev.trailingStop, atrMultiplier: Number(e.target.value) }
                            }))}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ATR Stop Loss */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={exitSettings.atrStopLoss.enabled}
                      onCheckedChange={(checked) => setExitSettings(prev => ({
                        ...prev,
                        atrStopLoss: { ...prev.atrStopLoss, enabled: checked }
                      }))}
                    />
                    <Label>ATR Stop Loss</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Stop loss based on Average True Range volatility</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {exitSettings.atrStopLoss.enabled && (
                    <div className="space-y-2 ml-6">
                      <Label className="text-sm">ATR Multiplier</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={exitSettings.atrStopLoss.multiplier}
                        onChange={(e) => setExitSettings(prev => ({
                          ...prev,
                          atrStopLoss: { ...prev.atrStopLoss, multiplier: Number(e.target.value) }
                        }))}
                      />
                    </div>
                  )}
                </div>

                {/* Time-based Exit */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={exitSettings.timeBasedExit.enabled}
                      onCheckedChange={(checked) => setExitSettings(prev => ({
                        ...prev,
                        timeBasedExit: { ...prev.timeBasedExit, enabled: checked }
                      }))}
                    />
                    <Label>Time-based Exit</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Exit trades after a specified time period</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {exitSettings.timeBasedExit.enabled && (
                    <div className="space-y-4 ml-6">
                      <Select
                        value={exitSettings.timeBasedExit.mode}
                        onValueChange={(value: 'candles' | 'daily_close' | 'weekly_close') => setExitSettings(prev => ({
                          ...prev,
                          timeBasedExit: { ...prev.timeBasedExit, mode: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="candles">After N Candles</SelectItem>
                          <SelectItem value="daily_close">Daily Close</SelectItem>
                          <SelectItem value="weekly_close">Weekly Close</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {exitSettings.timeBasedExit.mode === 'candles' && (
                        <div className="space-y-2">
                          <Label className="text-sm">Candle Count</Label>
                          <Input
                            type="number"
                            value={exitSettings.timeBasedExit.candleCount}
                            onChange={(e) => setExitSettings(prev => ({
                              ...prev,
                              timeBasedExit: { ...prev.timeBasedExit, candleCount: Number(e.target.value) }
                            }))}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ATR Length (only when relevant) */}
                {showATRLength && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <Label>ATR Length</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          type="number"
                          value={exitSettings.trailingStop.atrLength}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setExitSettings(prev => ({
                              ...prev,
                              trailingStop: { ...prev.trailingStop, atrLength: value },
                              atrStopLoss: { ...prev.atrStopLoss, atrLength: value }
                            }));
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Period for ATR calculation (affects both ATR trailing and ATR stop loss)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {/* Exit Priority */}
                <div className="space-y-3">
                  <Label>Exit Priority (drag to reorder)</Label>
                  <div className="space-y-2">
                    {exitSettings.exitPriority.map((priority, index) => (
                      <div key={priority} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                        <span className="text-sm font-mono">{index + 1}.</span>
                        <span className="flex-1">{priority}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={resetAdvancedExitsToDefault}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Return to Default
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={onPrevious}>
            Previous Page
          </Button>
          <Button onClick={onNext}>
            Continue to Risk Management
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
