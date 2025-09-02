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
import { Info, ChevronDown, Settings, TrendingUp } from 'lucide-react';
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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
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

  const updateExitSetting = (key: string, value: any) => {
    setExitSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefault = (section: 'basic' | 'all') => {
    if (section === 'basic') {
      setExitSettings(prev => ({
        ...prev,
        stopLoss: defaultExitSettings.stopLoss,
        takeProfit: defaultExitSettings.takeProfit
      }));
    } else {
      setExitSettings(defaultExitSettings);
    }
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
            Configure exit strategies and risk controls for your bot
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Basic Exit Settings
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetToDefault('basic')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Return to Default
                  </Button>
                </div>
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
                    />
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
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Exit Options - Collapsible */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg border hover:border-primary/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Advanced Exit Options</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetToDefault('all')}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Reset All
                        </Button>
                        <Badge variant="outline">Expert Settings</Badge>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="space-y-4 mt-4">
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