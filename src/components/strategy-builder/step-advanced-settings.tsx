import { Strategy, IndicatorConfig, UserTier } from '@/types/botforge';
import { getTierAccess } from '@/lib/tier-access';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, X } from 'lucide-react';

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
  const tierAccess = getTierAccess(userTier);
  const canAddFilters = tierAccess.canAddFilters;

  const availableFilters: IndicatorConfig[] = [
    { id: 'rsi', name: 'RSI', type: 'oscillator', parameters: { period: 14 }, advanced: false },
    { id: 'macd', name: 'MACD', type: 'momentum', parameters: { fast: 12, slow: 26, signal: 9 }, advanced: false },
    { id: 'bb', name: 'Bollinger Bands', type: 'volatility', parameters: { period: 20, std: 2 }, advanced: true },
    { id: 'stoch', name: 'Stochastic', type: 'oscillator', parameters: { k: 14, d: 3 }, advanced: true },
  ];

  const addFilter = (filter: IndicatorConfig) => {
    if (!filterIndicators.find(f => f.id === filter.id)) {
      onUpdateFilters([...filterIndicators, filter]);
    }
  };

  const removeFilter = (id: string) => {
    onUpdateFilters(filterIndicators.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Advanced Settings</h2>
        <p className="text-muted-foreground text-sm">
          Configure additional indicators and parameters for your strategy.
        </p>
      </header>

      {!strategy ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please select a strategy first.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Default Indicators */}
          <div>
            <h3 className="font-medium mb-3">Default Indicators</h3>
            <div className="flex flex-wrap gap-2">
              {strategy.defaultIndicators.map((ind) => (
                <Badge key={ind.id} variant="default" className="text-xs">
                  {ind.name}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Filter Indicators */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Filter Indicators</h3>
              {!canAddFilters && (
                <Badge variant="outline" className="text-xs">
                  Upgrade to {userTier === 'basic' ? 'Pro' : 'Expert'} to unlock
                </Badge>
              )}
            </div>

            {canAddFilters ? (
              <div className="space-y-4">
                {/* Added Filters */}
                {filterIndicators.length > 0 && (
                  <div className="space-y-2">
                    {filterIndicators.map((filter) => (
                      <div key={filter.id} className="flex items-center justify-between p-3 rounded-lg border">
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
                          className="h-8 w-8 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Available Filters */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Available filters:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableFilters
                      .filter(f => !filterIndicators.find(existing => existing.id === f.id))
                      .map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => addFilter(filter)}
                          className="flex items-center justify-between p-3 rounded-lg border border-dashed hover:bg-muted/30 transition"
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
              <Card className="p-4 border-dashed">
                <p className="text-sm text-muted-foreground text-center">
                  Filter indicators are available in Pro and Expert tiers
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end pt-4">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}