import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { MarketType } from '@/types/botforge';

interface StepMarketTypeProps {
  selected: MarketType | null;
  onSelect: (type: MarketType) => void;
  onNext: () => void;
}

export function StepMarketType({ selected, onSelect, onNext }: StepMarketTypeProps) {
  const marketTypes = [
    {
      type: 'spot' as MarketType,
      title: 'Spot Trading',
      description: 'Traditional buy and sell cryptocurrency trading',
      icon: <TrendingUp className="w-8 h-8" />,
      features: ['Direct ownership', 'Lower risk', 'No funding fees', 'Perfect for beginners']
    },
    {
      type: 'perps' as MarketType,
      title: 'Perpetual Futures',
      description: 'Leverage trading with perpetual contracts',
      icon: <BarChart3 className="w-8 h-8" />,
      features: ['Leverage up to 100x', 'Short selling', 'Funding fees', 'Advanced traders'],
      badge: 'Advanced'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Market Type</h2>
        <p className="text-muted-foreground">
          Select the type of trading market for your bot strategy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {marketTypes.map((market) => (
          <Card
            key={market.type}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selected === market.type
                ? 'ring-2 ring-primary border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => onSelect(market.type)}
          >
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className={`p-4 rounded-full ${
                  selected === market.type ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {market.icon}
                </div>
              </div>
              <div className="flex items-center justify-center mb-2">
                <CardTitle className="text-xl">{market.title}</CardTitle>
              </div>
              <CardDescription className="text-center">
                {market.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {market.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      selected === market.type ? 'bg-primary' : 'bg-muted-foreground'
                    }`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          disabled={!selected}
          size="lg"
          className="px-8"
        >
          Continue to Pair Selection
        </Button>
      </div>
    </div>
  );
}