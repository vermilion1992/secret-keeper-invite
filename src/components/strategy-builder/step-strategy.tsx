import { Strategy, STRATEGIES, UserTier } from '@/types/botforge';
import { canAccessStrategy } from '@/lib/tier-access';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface StepStrategyProps {
  selected: Strategy | null;
  onSelect: (strategy: Strategy) => void;
  onNext: () => void;
  userTier: UserTier;
}

export function StepStrategy({ selected, onSelect, onNext, userTier }: StepStrategyProps) {
  const accessible = STRATEGIES.filter((s) => canAccessStrategy(s, userTier));
  const locked = STRATEGIES.filter((s) => !canAccessStrategy(s, userTier));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Choose a strategy</h2>
          <p className="text-muted-foreground text-sm">Strategies come with pre-configured indicators you can tweak later.</p>
        </div>
        <Badge variant="secondary" className="uppercase">{userTier} tier</Badge>
      </header>

      <ScrollArea className="h-[420px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accessible.map((s) => {
            const isSelected = selected?.id === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s)}
                className={`text-left rounded-lg border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                  isSelected ? 'border-primary/50 bg-primary/10' : 'border-border/60 hover:bg-muted/30'
                }`}
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{s.name}</h3>
                    <Badge variant="outline" className="text-xs">{s.tier}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.defaultIndicators.slice(0, 4).map((ind) => (
                      <Badge key={ind.id} variant="secondary" className="text-xs">{ind.name}</Badge>
                    ))}
                    {s.defaultIndicators.length > 4 && (
                      <Badge variant="secondary" className="text-xs">+{s.defaultIndicators.length - 4} more</Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {locked.length > 0 && (
            <Card className="p-4 border-dashed">
              <div className="flex items-start gap-3">
                <Lock className="w-4 h-4 text-muted-foreground mt-1" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {locked.length} strategies are locked for your tier. Upgrade to unlock more templates.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {locked.slice(0, 6).map((s) => (
                      <Badge key={s.id} variant="outline" className="text-xs">{s.name}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={() => onNext()} disabled={!selected}>Continue</Button>
      </div>
    </div>
  );
}
