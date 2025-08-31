import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Crown, TrendingUp, Zap, BarChart, Shuffle, Settings, Lock } from 'lucide-react';
import { PairTemplate, UserTier } from '@/types/botforge';
import { canAccessPairTemplate, getUpgradeMessage, getTierAccess } from '@/lib/tier-access';

interface StepPairTemplateProps {
  selected: PairTemplate | null;
  onSelect: (template: PairTemplate) => void;
  onNext: () => void;
  userTier: UserTier;
}

export function StepPairTemplate({ selected, onSelect, onNext, userTier }: StepPairTemplateProps) {
  const tierAccess = getTierAccess(userTier);
  
  const pairTemplates = [
    {
      template: 'top10' as PairTemplate,
      title: 'Top 10 Pairs',
      description: 'Most liquid and stable cryptocurrency pairs',
      icon: <Crown className="w-8 h-8" />,
      pairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT'],
      tierRequired: 'basic' as UserTier,
      count: '10 pairs'
    },
    {
      template: 'top30' as PairTemplate,
      title: 'Top 30 Pairs',
      description: 'Extended selection of popular trading pairs',
      icon: <TrendingUp className="w-8 h-8" />,
      pairs: ['All Top 10', 'AVAX/USDT', 'DOT/USDT', 'MATIC/USDT', 'LINK/USDT'],
      badge: 'Extended',
      tierRequired: 'pro' as UserTier,
      count: '30 pairs'
    },
    {
      template: 'meme' as PairTemplate,
      title: 'Meme Coins',
      description: 'High volatility meme cryptocurrency pairs',
      icon: <Zap className="w-8 h-8" />,
      pairs: ['DOGE/USDT', 'SHIB/USDT', 'PEPE/USDT', 'FLOKI/USDT', 'WIF/USDT'],
      badge: 'High Risk',
      tierRequired: 'expert' as UserTier,
      count: '20+ pairs'
    },
    {
      template: 'volatility' as PairTemplate,
      title: 'High Volatility',
      description: 'Pairs with significant price movements',
      icon: <BarChart className="w-8 h-8" />,
      pairs: ['Selected by ATR', 'Dynamic selection', 'Risk-adjusted', 'Momentum-based'],
      badge: 'Dynamic',
      tierRequired: 'expert' as UserTier,
      count: '15+ pairs'
    },
    {
      template: 'random' as PairTemplate,
      title: 'Random Sampler',
      description: 'Randomly selected pairs for diverse testing',
      icon: <Shuffle className="w-8 h-8" />,
      pairs: ['Random from top 100', 'Diverse exposure', 'Unbiased selection', 'Market neutral'],
      badge: 'Diverse',
      tierRequired: 'expert' as UserTier,
      count: '10-25 pairs'
    },
    {
      template: 'custom' as PairTemplate,
      title: 'Pick Your Own',
      description: 'Choose specific pairs for your strategy',
      icon: <Settings className="w-8 h-8" />,
      pairs: ['Your selection', 'Custom filters', 'Specific focus', 'Targeted strategy'],
      badge: 'Custom',
      tierRequired: 'expert' as UserTier,
      count: 'Up to 100'
    }
  ];

  const canAccess = (template: PairTemplate) => canAccessPairTemplate(template, userTier);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Select Trading Pairs</h2>
        <p className="text-muted-foreground">
          Choose which cryptocurrency pairs your bot will trade
        </p>
        <div className="mt-4">
          <Badge variant="outline" className="text-sm">
            Your tier: {userTier.toUpperCase()} • {tierAccess.description}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pairTemplates.map((template) => {
          const isAccessible = canAccess(template.template);
          const isSelected = selected === template.template;
          
          return (
            <TooltipProvider key={template.template}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    className={`cursor-pointer transition-all relative ${
                      isSelected
                        ? 'ring-2 ring-green-500 border-green-500 bg-green-500/10'
                        : isAccessible
                        ? 'border-border hover:border-purple-500 hover:bg-purple-500/10 hover:shadow-lg'
                        : 'border-border/50 opacity-60 cursor-not-allowed'
                    }`}
                    onClick={() => isAccessible && onSelect(template.template)}
                  >
                    {!isAccessible && (
                      <div className="absolute top-3 right-3">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-3">
                      <div className="flex items-center justify-center mb-3">
                        <div className={`p-3 rounded-full ${
                          isSelected 
                            ? 'bg-primary/20 text-primary' 
                            : isAccessible 
                            ? 'bg-muted text-muted-foreground' 
                            : 'bg-muted/50 text-muted-foreground/50'
                        }`}>
                          {template.icon}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                        </div>
                        <p className="text-xs text-muted-foreground">{template.count}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-center text-sm mb-3">
                        {template.description}
                      </CardDescription>
                      <div className="space-y-1">
                        {template.pairs.slice(0, 3).map((pair, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            <div className={`w-1 h-1 rounded-full ${
                              isSelected ? 'bg-primary' : 'bg-muted-foreground'
                            }`} />
                            <span className="text-muted-foreground">{pair}</span>
                          </div>
                        ))}
                        {template.pairs.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center pt-1">
                            +{template.pairs.length - 3} more...
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                {!isAccessible && (
                  <TooltipContent>
                    <p>{getUpgradeMessage(template.tierRequired)}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          disabled={!selected}
          size="lg"
          className="px-8"
        >
          Continue to Strategy Selection
        </Button>
      </div>
    </div>
  );
}