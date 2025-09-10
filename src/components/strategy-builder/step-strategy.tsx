import { Strategy, UserTier } from '@/types/botforge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChipGroup } from '@/components/ui/chips';
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Gauge,
  Settings,
  Crown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useIndicatorCatalog, selectIndicatorsByFilters, selectPresetsByIntent } from '@/state/indicatorCatalog';
import type { DesignIntent } from '@/state/indicatorTypes';

interface StepStrategyProps {
  selected: Strategy | null;
  onSelect: (strategy: Strategy) => void;
  onNext: () => void;
  onPrevious: () => void;
  userTier: UserTier;
}

const getIndicatorIcon = (category: string) => {
  switch (category) {
    case 'Trend': return TrendingUp;
    case 'Momentum': return Activity;
    case 'Volatility': return Gauge;
    case 'Volume': return BarChart3;
    default: return Settings;
  }
};

export function StepStrategy({ selected, onSelect, onNext, onPrevious, userTier }: StepStrategyProps) {
  const navigate = useNavigate();
  const [selectedIntents, setSelectedIntents] = useState<DesignIntent[]>([]);
  const { toast } = useToast();
  const { catalog, load } = useIndicatorCatalog();

  // Load catalog on mount
  useEffect(() => {
    load();
  }, [load]);

  // Filter data based on catalog
  const filteredIndicators = catalog ? selectIndicatorsByFilters(catalog, selectedIntents, []) : [];
  const allPresets = catalog ? catalog.indicators.flatMap(ind => 
    selectPresetsByIntent(ind, selectedIntents).map(preset => ({
      ...preset,
      indicatorId: ind.id,
      indicatorLabel: ind.label,
      indicatorCategory: ind.category
    }))
  ) : [];

  // Get filter options
  const intentOptions = catalog ? catalog.allDesignIntents.map(intent => ({
    value: intent,
    label: intent,
    count: catalog.indicators.reduce((acc, ind) => 
      acc + ind.presets.filter(p => p.designIntent === intent).length, 0
    )
  })) : [];

  const renderIndicatorTile = (indicator: any) => {
    const Icon = getIndicatorIcon(indicator.category);
    const isSelected = selected?.id === `indicator:${indicator.id}`;

    const handleIndicatorClick = () => {
      try {
        onSelect({ 
          id: `indicator:${indicator.id}`,
          name: indicator.label, 
          description: indicator.blurb || '',
          tier: 'basic',
          defaultIndicators: [],
          canAddFilters: true
        });
        
        navigate(`/strategy-builder/advanced?indicator=${indicator.id}&preset=`);
      } catch (e) {
        toast({
          title: "Selection failed",
          description: "Could not select this indicator. Please try again.",
          variant: "destructive"
        });
      }
    };

    return (
      <TooltipProvider key={indicator.id}>
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-md border hover-scale ${
            isSelected
            ? 'ring-2 ring-success border-success bg-success/10'
            : 'hover:border-primary hover:bg-primary/10'
          }`}
          onClick={handleIndicatorClick}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Icon className={`h-6 w-6 ${isSelected ? 'text-success' : 'text-primary'}`} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{indicator.label}</h3>
                <p className="text-muted-foreground text-sm">{indicator.blurb || ''}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {indicator.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {indicator.presets.length} presets
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </TooltipProvider>
    );
  };

  const renderPresetTile = (preset: any) => {
    const isSelected = selected?.id === preset.id;
    const Icon = preset.presetTier === 'Hero' ? Crown : getIndicatorIcon(preset.indicatorCategory);

    const handlePresetClick = () => {
      try {
        onSelect({ 
          id: preset.id,
          name: preset.name, 
          description: preset.blurb || '',
          tier: 'basic',
          defaultIndicators: [],
          canAddFilters: true
        });
        
        navigate(`/strategy-builder/advanced?indicator=${preset.indicatorId}&preset=${preset.id}`);
      } catch (e) {
        toast({
          title: "Selection failed",
          description: "Could not select this preset. Please try again.",
          variant: "destructive"
        });
      }
    };

    return (
      <TooltipProvider key={preset.id}>
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-md border hover-scale ${
            isSelected
            ? 'ring-2 ring-success border-success bg-success/10'
            : 'hover:border-primary hover:bg-primary/10'
          }`}
          onClick={handlePresetClick}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${isSelected ? 'text-success' : 'text-primary'}`} />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-tight truncate">
                  {preset.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {preset.indicatorLabel}
                </p>
              </div>
              {preset.presetTier === 'Hero' && (
                <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
                  Hero
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 space-y-2">
            <div className="flex flex-wrap gap-1">
              <Badge className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
                {preset.designIntent}
              </Badge>
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {preset.riskProfile}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  };

  if (!catalog) {
    return (
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Choose a strategy</h2>
            <p className="text-muted-foreground text-sm">Loading indicators and strategies...</p>
          </div>
          <Badge variant="secondary" className="uppercase">{userTier} tier</Badge>
        </header>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Choose a strategy</h2>
          <p className="text-muted-foreground text-sm">Select from {catalog.indicators.length} indicators or {allPresets.length} prebuilt strategies.</p>
        </div>
        <Badge variant="secondary" className="uppercase">{userTier} tier</Badge>
      </header>

      <Tabs defaultValue="indicators" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="indicators">Indicators ({filteredIndicators.length})</TabsTrigger>
          <TabsTrigger value="strategies">Prebuilt Strategies ({allPresets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="space-y-4">
          {intentOptions.length > 0 && (
            <ChipGroup
              label="Filter by Design Intent"
              options={intentOptions}
              selected={selectedIntents}
              onSelectionChange={(selected) => setSelectedIntents(selected as DesignIntent[])}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIndicators.map(indicator => renderIndicatorTile(indicator))}
          </div>

          {filteredIndicators.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {selectedIntents.length > 0 
                  ? "No indicators match the selected filters." 
                  : "No indicators available."
                }
              </p>
              {selectedIntents.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setSelectedIntents([])}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          {intentOptions.length > 0 && (
            <ChipGroup
              label="Filter by Design Intent"
              options={intentOptions}
              selected={selectedIntents}
              onSelectionChange={(selected) => setSelectedIntents(selected as DesignIntent[])}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPresets.map(preset => renderPresetTile(preset))}
          </div>

          {allPresets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {selectedIntents.length > 0 
                  ? "No presets match the selected filters." 
                  : "No presets available."
                }
              </p>
              {selectedIntents.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setSelectedIntents([])}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-6">
        <Button onClick={onPrevious} variant="outline" size="lg" className="px-8">
          Previous
        </Button>
        <Button onClick={onNext} disabled={!selected} size="lg" className="px-8">
          Continue to Advanced Settings
        </Button>
      </div>
    </div>
  );
}