import { RiskManagement, UserTier } from '@/types/botforge';
import { getTierAccess } from '@/lib/tier-access';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Shield, Info, ChevronDown, DollarSign, TrendingDown } from 'lucide-react';
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
  const tierAccess = getTierAccess(userTier);
  const canUseTrailing = tierAccess.canUseTrailingTP;
  const isPerps = marketType === 'perps';

  const defaultRiskSettings = {
    capitalAllocation: 1.5,
    leverageMultiplier: 2,
    percentPerTrade: 3
  };

  const resetToDefault = (section: 'core' | 'all') => {
    if (section === 'core') {
      onUpdate({
        ...riskManagement,
        capitalAllocation: defaultRiskSettings.capitalAllocation,
        leverageMultiplier: defaultRiskSettings.leverageMultiplier,
        percentPerTrade: defaultRiskSettings.percentPerTrade
      });
    } else {
      onUpdate({
        ...riskManagement,
        capitalAllocation: defaultRiskSettings.capitalAllocation,
        leverageMultiplier: defaultRiskSettings.leverageMultiplier,
        percentPerTrade: defaultRiskSettings.percentPerTrade
      });
    }
  };

  const updateField = (field: keyof RiskManagement, value: number) => {
    onUpdate({ ...riskManagement, [field]: value });
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
            Apply portfolio-wide safety and sizing rules to protect your capital
          </p>
        </header>

        {/* Default Settings - Always Visible */}
        <Card className="frosted">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-primary" />
                Core Risk Parameters
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefault('core')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Return to Default
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    value={[riskManagement.capitalAllocation || 1.5]}
                    onValueChange={([value]) => updateField('capitalAllocation', value)}
                    max={10}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5%</span>
                    <span className="font-medium text-foreground">{riskManagement.capitalAllocation || 1.5}%</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>

              {/* Max Leverage */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Max Leverage</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Cap the maximum leverage used. Protects against over-leveraged positions. Default: 2x</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-2">
                  <Slider
                    value={[riskManagement.leverageMultiplier || 2]}
                    onValueChange={([value]) => updateField('leverageMultiplier', value)}
                    max={10}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1x</span>
                    <span className="font-medium text-foreground">{riskManagement.leverageMultiplier || 2}x</span>
                    <span>10x</span>
                  </div>
                </div>
              </div>

              {/* Max Concurrent Trades */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="font-medium">Max Concurrent Trades</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Limits how many trades can run at once to control exposure. Default: 3</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="number"
                  value={riskManagement.percentPerTrade || 3}
                  onChange={(e) => updateField('percentPerTrade', Number(e.target.value))}
                  min="1"
                  max="20"
                  className="bg-background/50"
                />
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
                  <CardTitle className="text-lg">Advanced Risk Controls</CardTitle>
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
              <Card className="frosted">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingDown className="w-4 h-4 text-primary" />
                    Advanced Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Notional Cap */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Notional Cap per Trade ($)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Absolute maximum size per trade, regardless of account balance. Example: $50</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      placeholder="50"
                      className="bg-background/50"
                    />
                  </div>

                  {/* Daily Drawdown Stop */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Daily Drawdown Stop (%)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">If total losses in a day reach this limit, trading halts until reset. Example: 5%</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      placeholder="5"
                      min="1"
                      max="20"
                      step="0.1"
                      className="bg-background/50"
                    />
                  </div>

                  {/* Allocation Limits */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Max Allocation per Asset (%)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Maximum portion of portfolio allocated to a single coin or position. Example: 20%</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      placeholder="20"
                      min="5"
                      max="50"
                      className="bg-background/50"
                    />
                  </div>

                  {/* Position Sizing Method */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Position Sizing Method</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Choose how trade sizes are calculated. Volatility-based adapts to changing market conditions.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" className="text-xs">Fixed %</Button>
                      <Button variant="default" className="text-xs">Volatility</Button>
                      <Button variant="outline" className="text-xs">Custom</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex items-center justify-between pt-6">
          <Button onClick={onPrevious} variant="outline" size="lg" className="px-8">
            Previous
          </Button>
          <Button onClick={() => {
            // Save step completion status
            if (typeof window !== "undefined") {
              localStorage.setItem("bf_step5_complete", "true");
            }
            onNext();
          }} size="lg" className="px-8">
            Continue to Timeframe Selection
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}