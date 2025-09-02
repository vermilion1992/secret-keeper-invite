import { Strategy, IndicatorConfig, UserTier } from '@/types/botforge';
import { getTierAccess } from '@/lib/tier-access';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, X, Info, ChevronDown, Settings, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface StepAdvancedSettingsProps {
  strategy: Strategy | null;
  filterIndicators: IndicatorConfig[];
  onUpdateFilters: (filters: IndicatorConfig[]) => void;
  onNext: () => void;
  userTier: UserTier;
}

export function StepAdvancedSettings({ 
  strategy, 
  filterIndicators, 
  onUpdateFilters, 
  onNext, 
  userTier 
}: StepAdvancedSettingsProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [strategyParams, setStrategyParams] = useState({
    emaFast: 20,
    emaSlow: 50,
    rsiLength: 14,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    sourceType: 'close',
    maType: 'EMA',
    entryCondition: 'ema_cross',
    exitMethod: 'signal_crossback',
    tradeDirection: 'both',
    reentryBars: 0
  });

  const tierAccess = getTierAccess(userTier);
  const canAddFilters = tierAccess.canAddFilters;

  const availableFilters: IndicatorConfig[] = [
    { id: 'rsi', name: 'RSI', type: 'oscillator', parameters: { period: 14 }, advanced: false },
    { id: 'macd', name: 'MACD', type: 'momentum', parameters: { fast: 12, slow: 26, signal: 9 }, advanced: false },
    { id: 'bb', name: 'Bollinger Bands', type: 'volatility', parameters: { period: 20, std: 2 }, advanced: true },
    { id: 'stoch', name: 'Stochastic', type: 'oscillator', parameters: { k: 14, d: 3 }, advanced: true },
  ];

  const updateParam = (key: string, value: any) => {
    setStrategyParams(prev => ({ ...prev, [key]: value }));
  };

  const addFilter = (filter: IndicatorConfig) => {
    if (!filterIndicators.find(f => f.id === filter.id)) {
      onUpdateFilters([...filterIndicators, filter]);
    }
  };

  const removeFilter = (id: string) => {
    onUpdateFilters(filterIndicators.filter(f => f.id !== id));
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
            Configure strategy parameters and fine-tune your trading logic
          </p>
        </header>

        {!strategy ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Please select a strategy first.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Default Settings - Always Visible */}
            <Card className="frosted">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Core Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        value={[strategyParams.emaFast]}
                        onValueChange={([value]) => updateParam('emaFast', value)}
                        max={100}
                        min={5}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5</span>
                        <span className="font-medium text-foreground">{strategyParams.emaFast}</span>
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
                        value={[strategyParams.emaSlow]}
                        onValueChange={([value]) => updateParam('emaSlow', value)}
                        max={200}
                        min={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>10</span>
                        <span className="font-medium text-foreground">{strategyParams.emaSlow}</span>
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
                      value={strategyParams.rsiLength}
                      onChange={(e) => updateParam('rsiLength', Number(e.target.value))}
                      min="2"
                      max="50"
                      className="bg-background/50"
                    />
                  </div>

                  {/* MACD Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">MACD (Fast/Slow/Signal)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Standard MACD configuration. Adjust to make signals faster or slower.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        value={strategyParams.macdFast}
                        onChange={(e) => updateParam('macdFast', Number(e.target.value))}
                        placeholder="12"
                        className="bg-background/50"
                      />
                      <Input
                        type="number"
                        value={strategyParams.macdSlow}
                        onChange={(e) => updateParam('macdSlow', Number(e.target.value))}
                        placeholder="26"
                        className="bg-background/50"
                      />
                      <Input
                        type="number"
                        value={strategyParams.macdSignal}
                        onChange={(e) => updateParam('macdSignal', Number(e.target.value))}
                        placeholder="9"
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Options - Collapsible */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg border hover:border-primary/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Advanced Options</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Expert Settings</Badge>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="space-y-4 mt-4">
                  {/* Indicator Fine-tuning */}
                  <Card className="frosted">
                    <CardHeader>
                      <CardTitle className="text-base">Indicator Fine-tuning</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Source Type</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Price data source for calculations: Close, Open, High-Low average, or OHLC average.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={strategyParams.sourceType} onValueChange={(value) => updateParam('sourceType', value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="close">Close</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="hl2">HL2 (High+Low)/2</SelectItem>
                            <SelectItem value="ohlc4">OHLC4 Average</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Moving Average Type</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Type of moving average: EMA (faster), SMA (smoother), or WMA (weighted).</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={strategyParams.maType} onValueChange={(value) => updateParam('maType', value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EMA">EMA</SelectItem>
                            <SelectItem value="SMA">SMA</SelectItem>
                            <SelectItem value="WMA">WMA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strategy Logic */}
                  <Card className="frosted">
                    <CardHeader>
                      <CardTitle className="text-base">Strategy Logic</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Entry Conditions</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Define what must happen for a trade to open.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={strategyParams.entryCondition} onValueChange={(value) => updateParam('entryCondition', value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ema_cross">EMA Cross</SelectItem>
                            <SelectItem value="rsi_threshold">RSI Threshold</SelectItem>
                            <SelectItem value="macd_cross">MACD Cross</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Exit Method</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Control how trades are closed once opened.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Select value={strategyParams.exitMethod} onValueChange={(value) => updateParam('exitMethod', value)}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="signal_crossback">Signal Crossback</SelectItem>
                            <SelectItem value="fixed_tp">Fixed Take Profit</SelectItem>
                            <SelectItem value="trailing_stop">Trailing Stop</SelectItem>
                            <SelectItem value="timed_exit">Timed Exit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

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
                        <Select value={strategyParams.tradeDirection} onValueChange={(value) => updateParam('tradeDirection', value)}>
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

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Re-entry Bars</Label>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Prevent over-trading by spacing out entries. 0 = no restriction.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          value={strategyParams.reentryBars}
                          onChange={(e) => updateParam('reentryBars', Number(e.target.value))}
                          min="0"
                          max="100"
                          className="bg-background/50"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Filters */}
                  <Card className="frosted">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Additional Filters</CardTitle>
                        {!canAddFilters && (
                          <Badge variant="outline" className="text-xs">
                            Upgrade to {userTier === 'basic' ? 'Pro' : 'Expert'} to unlock
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {canAddFilters ? (
                        <div className="space-y-4">
                          {/* Added Filters */}
                          {filterIndicators.length > 0 && (
                            <div className="space-y-2">
                              {filterIndicators.map((filter) => (
                                <div key={filter.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/30">
                                  <div>
                                    <span className="font-medium text-sm">{filter.name}</span>
                                    <p className="text-xs text-muted-foreground">
                                      {Object.entries(filter.parameters).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFilter(filter.id)}
                                    className="h-8 w-8 p-0 hover:bg-destructive/10"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Available Filters */}
                          <div>
                            <p className="text-sm text-muted-foreground mb-3">Available filters:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {availableFilters
                                .filter(f => !filterIndicators.find(existing => existing.id === f.id))
                                .map((filter) => (
                                  <button
                                    key={filter.id}
                                    onClick={() => addFilter(filter)}
                                    className="flex items-center justify-between p-3 rounded-lg border border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200"
                                  >
                                    <div className="text-left">
                                      <span className="font-medium text-sm">{filter.name}</span>
                                      {filter.advanced && (
                                        <Badge variant="secondary" className="ml-2 text-xs">Advanced</Badge>
                                      )}
                                    </div>
                                    <Plus className="w-4 h-4 text-muted-foreground" />
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center border border-dashed rounded-lg bg-background/30">
                          <p className="text-sm text-muted-foreground">
                            Filter indicators are available in Pro and Expert tiers
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        <div className="flex items-center justify-end pt-6">
          <Button onClick={onNext} size="lg" className="px-8">
            Continue to Risk Management
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}