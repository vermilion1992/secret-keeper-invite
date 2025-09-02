import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, BarChart3 } from 'lucide-react';

interface StepBacktestProps {
  onNext: () => void;
  onPrevious: () => void;
  onRunBacktest: () => void;
  isLoading?: boolean;
}

export function StepBacktest({ onNext, onPrevious, onRunBacktest, isLoading = false }: StepBacktestProps) {
  const [backtestStarted, setBacktestStarted] = useState(false);

  const handleRunBacktest = () => {
    setBacktestStarted(true);
    onRunBacktest();
    // Simulate backtest completion
    setTimeout(() => {
      onNext();
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Run Backtest</h2>
        <p className="text-muted-foreground text-sm">
          Execute your strategy against historical data to see how it would have performed.
        </p>
      </header>

      {!backtestStarted ? (
        <Card className="p-8 text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Ready to Backtest</h3>
              <p className="text-muted-foreground text-sm">
                Your strategy configuration is complete. Run a backtest to see historical performance metrics.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline">Historical Data</Badge>
              <Badge variant="outline">Performance Metrics</Badge>
              <Badge variant="outline">Risk Analysis</Badge>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={onPrevious} variant="outline" size="lg" className="px-8">
                Previous
              </Button>
              <Button 
                onClick={handleRunBacktest} 
                disabled={isLoading}
                className="gap-2 px-8"
                size="lg"
              >
                <Play className="w-4 h-4" />
                Run Backtest
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Running Backtest...</h3>
              <p className="text-muted-foreground text-sm">
                Processing historical data and calculating performance metrics.
              </p>
            </div>

            <div className="space-y-2">
              <Progress value={66} className="h-2" />
              <p className="text-xs text-muted-foreground">Analyzing trading signals...</p>
            </div>
            
            <div className="flex justify-between pt-6">
              <Button onClick={onPrevious} variant="outline" size="lg" className="px-8">
                Previous
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}