import { RiskManagement, UserTier } from '@/types/botforge';
import { getTierAccess } from '@/lib/tier-access';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, Info, ChevronDown, DollarSign, TrendingDown, Clock, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface StepRiskManagementProps {
  riskManagement: RiskManagement;
  onUpdate: (risk: RiskManagement) => void;
  onNext: () => void;
  onPrevious: () => void;
  userTier: UserTier;
  marketType: string | null;
}

export function StepRiskManagement({ 
  riskManagement, 
  onUpdate, 
  onNext, 
  onPrevious,
  userTier, 
  marketType 
}: StepRiskManagementProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSessionWindowsOpen, setIsSessionWindowsOpen] = useState(false);
  const tierAccess = getTierAccess(userTier);

  // Expanded risk settings state
  const [riskSettings, setRiskSettings] = useState({
    // Core settings
    riskPerTrade: 1.5,
    maxPositionSize: 10000,
    maxConcurrentTrades: 3,
    
    // Portfolio limits
    dailyLossLimit: 5.0,
    dailyTradeLimit: 10,
    drawdownKillSwitch: 15.0,
    
    // Allocation limits
    maxAllocationPerAsset: 20.0,
    
    // Session controls
    sessionWindows: {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'UTC'
    },
    noTradeWindows: {
      enabled: false,
      windows: []
    }
  });

  const resetToDefault = (section: 'core' | 'advanced' | 'all') => {
    const defaults = {
      riskPerTrade: 1.5,
      maxPositionSize: 10000,
      maxConcurrentTrades: 3,
      dailyLossLimit: 5.0,
      dailyTradeLimit: 10,
      drawdownKillSwitch: 15.0,
      maxAllocationPerAsset: 20.0,
      sessionWindows: {
        enabled: false,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC'
      },
      noTradeWindows: {
        enabled: false,
        windows: []
      }
    };

    if (section === 'core') {
      setRiskSettings(prev => ({
        ...prev,
        riskPerTrade: defaults.riskPerTrade,
        maxPositionSize: defaults.maxPositionSize,
        maxConcurrentTrades: defaults.maxConcurrentTrades
      }));
    } else if (section === 'advanced') {
      setRiskSettings(prev => ({
        ...prev,
        dailyLossLimit: defaults.dailyLossLimit,
        dailyTradeLimit: defaults.dailyTradeLimit,
        drawdownKillSwitch: defaults.drawdownKillSwitch,
        maxAllocationPerAsset: defaults.maxAllocationPerAsset
      }));
    } else {
      setRiskSettings(defaults);
    }
  };

  const updateRiskField = (field: string, value: any) => {
    setRiskSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Risk Management</h2>
          </div>
          <p className="text-muted-foreground">
            Portfolio-wide safety and sizing rules to protect your capital
          </p>
        </header>

        {/* Core Risk Parameters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-primary" />
                Core Risk Parameters
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetToDefault('core')}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Return to Default
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Risk per Trade */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Risk per Trade (%)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">How much of your account balance to risk on each trade. Default: 1.5%</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[riskSettings.riskPerTrade]}
                    onValueChange={([value]) => updateRiskField('riskPerTrade', value)}
                    max={10}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5%</span>
                    <span className="font-medium text-foreground">{riskSettings.riskPerTrade}%</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>

              {/* Max Position Size */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Max Position Size ($)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Maximum notional value per position regardless of account size</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  value={riskSettings.maxPositionSize}
                  onChange={(e) => updateRiskField('maxPositionSize', Number(e.target.value))}
                  min="100"
                  step="100"
                />
              </div>

              {/* Max Concurrent Trades */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Max Open Trades</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Maximum number of concurrent open positions</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  value={riskSettings.maxConcurrentTrades}
                  onChange={(e) => updateRiskField('maxConcurrentTrades', Number(e.target.value))}
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Protection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="w-5 h-5 text-primary" />
                Portfolio Protection
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetToDefault('advanced')}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Return to Default
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Daily Loss Limit */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Daily Loss Limit (%)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Maximum daily loss before trading stops for the day</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  value={riskSettings.dailyLossLimit}
                  onChange={(e) => updateRiskField('dailyLossLimit', Number(e.target.value))}
                  min="1"
                  max="50"
                />
              </div>

              {/* Daily Trade Limit */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Daily Trade Limit</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Maximum number of trades per day</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  value={riskSettings.dailyTradeLimit}
                  onChange={(e) => updateRiskField('dailyTradeLimit', Number(e.target.value))}
                  min="1"
                  max="100"
                />
              </div>

              {/* Drawdown Kill-Switch */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Drawdown Kill-Switch (%)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Stop all trading when total equity drawdown reaches this level</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  value={riskSettings.drawdownKillSwitch}
                  onChange={(e) => updateRiskField('drawdownKillSwitch', Number(e.target.value))}
                  min="5"
                  max="50"
                />
              </div>

              {/* Max Allocation per Asset */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Max Allocation per Asset (%)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Maximum percentage of portfolio allocated to any single asset</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  step="1"
                  value={riskSettings.maxAllocationPerAsset}
                  onChange={(e) => updateRiskField('maxAllocationPerAsset', Number(e.target.value))}
                  min="5"
                  max="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Management */}
        <Collapsible open={isSessionWindowsOpen} onOpenChange={setIsSessionWindowsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <CardTitle>Session Management</CardTitle>
                    <Badge variant="secondary">Optional</Badge>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Control when the strategy can trade</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isSessionWindowsOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Trading Hours */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={riskSettings.sessionWindows.enabled}
                        onCheckedChange={(checked) => updateRiskField('sessionWindows', {
                          ...riskSettings.sessionWindows,
                          enabled: checked
                        })}
                      />
                      <Label>Trading Hours</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Restrict trading to specific hours of the day</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {riskSettings.sessionWindows.enabled && (
                      <div className="space-y-2 ml-6">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-sm">Start Time</Label>
                            <Input
                              type="time"
                              value={riskSettings.sessionWindows.startTime}
                              onChange={(e) => updateRiskField('sessionWindows', {
                                ...riskSettings.sessionWindows,
                                startTime: e.target.value
                              })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-sm">End Time</Label>
                            <Input
                              type="time"
                              value={riskSettings.sessionWindows.endTime}
                              onChange={(e) => updateRiskField('sessionWindows', {
                                ...riskSettings.sessionWindows,
                                endTime: e.target.value
                              })}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm">Timezone</Label>
                          <Select
                            value={riskSettings.sessionWindows.timezone}
                            onValueChange={(value) => updateRiskField('sessionWindows', {
                              ...riskSettings.sessionWindows,
                              timezone: value
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="US/Eastern">US/Eastern</SelectItem>
                              <SelectItem value="US/Pacific">US/Pacific</SelectItem>
                              <SelectItem value="Europe/London">Europe/London</SelectItem>
                              <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* No-Trade Windows */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={riskSettings.noTradeWindows.enabled}
                        onCheckedChange={(checked) => updateRiskField('noTradeWindows', {
                          ...riskSettings.noTradeWindows,
                          enabled: checked
                        })}
                      />
                      <Label>No-Trade Windows</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Block trading during specific events (e.g., news releases, market open/close)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {riskSettings.noTradeWindows.enabled && (
                      <div className="space-y-2 ml-6">
                        <p className="text-sm text-muted-foreground">
                          Configure specific time windows when trading should be paused
                        </p>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add No-Trade Window
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <div className="flex items-center justify-between pt-6">
          <Button onClick={onPrevious} variant="outline" size="lg" className="px-8">
            Previous Page
          </Button>
          <Button onClick={onNext} size="lg" className="px-8">
            Continue to Timeframe Selection
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}