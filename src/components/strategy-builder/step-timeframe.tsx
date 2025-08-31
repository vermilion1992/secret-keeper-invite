import { BacktestParams, Timeframe, CANDLE_CAPS } from '@/types/botforge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface StepTimeframeProps {
  backtestParams: BacktestParams;
  onUpdate: (params: BacktestParams) => void;
  onNext: () => void;
}

export function StepTimeframe({ backtestParams, onUpdate, onNext }: StepTimeframeProps) {
  const timeframes: { value: Timeframe; label: string; recommended: boolean }[] = [
    { value: '1m', label: '1 Minute', recommended: false },
    { value: '5m', label: '5 Minutes', recommended: false },
    { value: '15m', label: '15 Minutes', recommended: true },
    { value: '1h', label: '1 Hour', recommended: true },
    { value: '4h', label: '4 Hours', recommended: true },
    { value: '1d', label: '1 Day', recommended: false },
  ];

  const updateTimeframe = (timeframe: Timeframe) => {
    const maxCandles = CANDLE_CAPS[timeframe];
    onUpdate({
      ...backtestParams,
      timeframe,
      maxPeriod: maxCandles,
      candleCount: Math.min(backtestParams.candleCount, maxCandles)
    });
  };

  const updateCandleCount = (count: number) => {
    const maxCandles = CANDLE_CAPS[backtestParams.timeframe];
    onUpdate({
      ...backtestParams,
      candleCount: Math.min(count, maxCandles)
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Timeframe Selection</h2>
        <p className="text-muted-foreground text-sm">
          Choose the timeframe for your strategy and backtest period.
        </p>
      </header>

      {/* Timeframe Selection */}
      <div>
        <h3 className="font-medium mb-3">Timeframe</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {timeframes.map((tf) => {
            const isSelected = backtestParams.timeframe === tf.value;
            return (
              <button
                key={tf.value}
                onClick={() => updateTimeframe(tf.value)}
                className={`p-4 rounded-lg border transition text-left ${
                  isSelected
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border/60 hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{tf.label}</span>
                  {tf.recommended && (
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Max: {CANDLE_CAPS[tf.value].toLocaleString()} candles
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Candle Count */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Backtest Period</h3>
            <Badge variant="outline" className="text-xs">
              {backtestParams.candleCount.toLocaleString()} / {CANDLE_CAPS[backtestParams.timeframe].toLocaleString()} candles
            </Badge>
          </div>
          
          <div className="space-y-2">
            <input
              type="range"
              min="100"
              max={CANDLE_CAPS[backtestParams.timeframe]}
              step="100"
              value={backtestParams.candleCount}
              onChange={(e) => updateCandleCount(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100</span>
              <span className="font-medium">{backtestParams.candleCount.toLocaleString()}</span>
              <span>{CANDLE_CAPS[backtestParams.timeframe].toLocaleString()}</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Approximately {Math.round(backtestParams.candleCount / (backtestParams.timeframe === '1m' ? 1440 : 
                backtestParams.timeframe === '5m' ? 288 :
                backtestParams.timeframe === '15m' ? 96 :
                backtestParams.timeframe === '1h' ? 24 :
                backtestParams.timeframe === '4h' ? 6 : 1))} days of data
            </p>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-end pt-4">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}