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
import { Info, ChevronDown, Settings, TrendingUp, BarChart3, Target, AlertTriangle, RotateCcw, X, Plus } from 'lucide-react';
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

export function StepAdvancedSettings({ 
  strategy, 
  selectedStrategyKey,
  filterIndicators, 
  onUpdateFilters, 
  onNext, 
  onPrevious,
  userTier 
}: StepAdvancedSettingsProps) {
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

  // Exit settings  
  const [exitSettings, setExitSettings] = useState({
    stopLossEnabled: true,
    stopLossType: 'percentage',
    stopLossValue: 5.0,
    trailingStopEnabled: false,
    trailingStopType: 'percentage',
    trailingStopValue: 2.0,
    takeProfitEnabled: true,
    takeProfitType: 'percentage', 
    takeProfitValue: 10.0,
    atrStopEnabled: false,
    atrTrailingEnabled: false,
    atrLength: 14,
    atrMultiplier: 2.0
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
                      <Label className="capitalize">{field}</Label>
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

        {/* Advanced Exit Settings */}
        <Collapsible open={isAdvancedExitOpen} onOpenChange={setIsAdvancedExitOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <CardTitle>Advanced Exit Settings</CardTitle>
                    <Badge variant="secondary">Optional</Badge>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedExitOpen ? 'rotate-180' : ''}`} />
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
                      <Label>Stop Loss</Label>
                    </div>
                    {exitSettings.stopLossEnabled && (
                      <div className="space-y-2 ml-6">
                        <Select
                          value={exitSettings.stopLossType}
                          onValueChange={(value) => setExitSettings(prev => ({ ...prev, stopLossType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Price</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          step="0.1"
                          value={exitSettings.stopLossValue}
                          onChange={(e) => setExitSettings(prev => ({ ...prev, stopLossValue: Number(e.target.value) }))}
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
                      <Label>Take Profit</Label>
                    </div>
                    {exitSettings.takeProfitEnabled && (
                      <div className="space-y-2 ml-6">
                        <Select
                          value={exitSettings.takeProfitType}
                          onValueChange={(value) => setExitSettings(prev => ({ ...prev, takeProfitType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Price</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          step="0.1"
                          value={exitSettings.takeProfitValue}
                          onChange={(e) => setExitSettings(prev => ({ ...prev, takeProfitValue: Number(e.target.value) }))}
                        />
                      </div>
                    )}
                  </div>

                  {/* ATR Stop */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={exitSettings.atrStopEnabled}
                        onCheckedChange={(checked) => setExitSettings(prev => ({ ...prev, atrStopEnabled: checked }))}
                      />
                      <Label>ATR Stop</Label>
                    </div>
                    {exitSettings.atrStopEnabled && (
                      <div className="space-y-2 ml-6">
                        <Label>ATR Length</Label>
                        <Input
                          type="number"
                          value={exitSettings.atrLength}
                          onChange={(e) => setExitSettings(prev => ({ ...prev, atrLength: Number(e.target.value) }))}
                        />
                        <Label>ATR Multiplier</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={exitSettings.atrMultiplier}
                          onChange={(e) => setExitSettings(prev => ({ ...prev, atrMultiplier: Number(e.target.value) }))}
                        />
                      </div>
                    )}
                  </div>

                  {/* ATR Trailing */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={exitSettings.atrTrailingEnabled}
                        onCheckedChange={(checked) => setExitSettings(prev => ({ ...prev, atrTrailingEnabled: checked }))}
                      />
                      <Label>ATR Trailing</Label>
                    </div>
                    {exitSettings.atrTrailingEnabled && (
                      <div className="space-y-2 ml-6">
                        <Label>ATR Length</Label>
                        <Input
                          type="number"
                          value={exitSettings.atrLength}
                          onChange={(e) => setExitSettings(prev => ({ ...prev, atrLength: Number(e.target.value) }))}
                        />
                        <Label>ATR Multiplier</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={exitSettings.atrMultiplier}
                          onChange={(e) => setExitSettings(prev => ({ ...prev, atrMultiplier: Number(e.target.value) }))}
                        />
                      </div>
                    )}
                  </div>
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
            Continue to Risk Management
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
