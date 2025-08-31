import { RiskManagement, UserTier } from '@/types/botforge';
import { getTierAccess } from '@/lib/tier-access';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface StepRiskManagementProps {
  riskManagement: RiskManagement;
  onUpdate: (risk: RiskManagement) => void;
  onNext: () => void;
  userTier: UserTier;
  marketType: string | null;
}

export function StepRiskManagement({ 
  riskManagement, 
  onUpdate, 
  onNext, 
  userTier, 
  marketType 
}: StepRiskManagementProps) {
  const tierAccess = getTierAccess(userTier);
  const canUseTrailing = tierAccess.canUseTrailingTP;
  const isPerps = marketType === 'perps';

  const updateField = (field: keyof RiskManagement, value: number) => {
    onUpdate({ ...riskManagement, [field]: value });
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Risk Management</h2>
        <p className="text-muted-foreground text-sm">
          Configure your risk parameters and position sizing.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Capital Allocation */}
        <Card className="p-4">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Capital Allocation (%)</Label>
            <div className="space-y-2">
              <Slider
                value={[riskManagement.capitalAllocation]}
                onValueChange={([value]) => updateField('capitalAllocation', value)}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1%</span>
                <span className="font-medium">{riskManagement.capitalAllocation}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stop Loss */}
        <Card className="p-4">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Stop Loss (%)</Label>
            <Input
              type="number"
              value={riskManagement.stopLoss}
              onChange={(e) => updateField('stopLoss', Number(e.target.value))}
              min="0.1"
              max="50"
              step="0.1"
              placeholder="5.0"
            />
          </div>
        </Card>

        {/* Take Profit */}
        <Card className="p-4">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Take Profit (%)</Label>
            <Input
              type="number"
              value={riskManagement.takeProfit}
              onChange={(e) => updateField('takeProfit', Number(e.target.value))}
              min="0.1"
              max="200"
              step="0.1"
              placeholder="10.0"
            />
          </div>
        </Card>

        {/* Trailing Take Profit */}
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Trailing Take Profit (%)</Label>
              {!canUseTrailing && (
                <Badge variant="outline" className="text-xs">Expert Only</Badge>
              )}
            </div>
            <Input
              type="number"
              value={riskManagement.trailingTakeProfit || ''}
              onChange={(e) => updateField('trailingTakeProfit', Number(e.target.value))}
              min="0.1"
              max="50"
              step="0.1"
              placeholder="2.0"
              disabled={!canUseTrailing}
            />
            {!canUseTrailing && (
              <p className="text-xs text-muted-foreground">
                Upgrade to Expert tier to use trailing take profit
              </p>
            )}
          </div>
        </Card>

        {/* Leverage (Perps only) */}
        {isPerps && (
          <Card className="p-4">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Leverage Multiplier</Label>
              <div className="space-y-2">
                <Slider
                  value={[riskManagement.leverageMultiplier || 1]}
                  onValueChange={([value]) => updateField('leverageMultiplier', value)}
                  max={10}
                  min={1}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1x</span>
                  <span className="font-medium">{riskManagement.leverageMultiplier || 1}x</span>
                  <span>10x</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Percent Per Trade */}
        <Card className="p-4">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Max % Per Trade</Label>
            <Input
              type="number"
              value={riskManagement.percentPerTrade || ''}
              onChange={(e) => updateField('percentPerTrade', Number(e.target.value))}
              min="0.1"
              max="20"
              step="0.1"
              placeholder="2.0"
            />
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-end pt-4">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}