import { BacktestParams, Timeframe } from '@/types/botforge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, CalendarIcon } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StepTimeframeProps {
  backtestParams: BacktestParams;
  onUpdate: (params: BacktestParams) => void;
  onNext: () => void;
}

export function StepTimeframe({ backtestParams, onUpdate, onNext }: StepTimeframeProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(365); // days
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 365));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [useCustomRange, setUseCustomRange] = useState(false);

  const timePeriods = [
    { days: 7, label: '7 Days' },
    { days: 30, label: '30 Days' },
    { days: 90, label: '90 Days' },
    { days: 365, label: '1 Year' },
    { days: 1095, label: '3 Years' },
  ];

  const timeframes: { value: Timeframe; label: string }[] = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
  ];

  const updateTimeframe = (timeframe: Timeframe) => {
    onUpdate({
      ...backtestParams,
      timeframe,
      maxPeriod: selectedPeriod,
      candleCount: selectedPeriod
    });
  };

  const updatePeriod = (days: number) => {
    setSelectedPeriod(days);
    onUpdate({
      ...backtestParams,
      maxPeriod: days,
      candleCount: days
    });
  };

  const updateDateRange = () => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setSelectedPeriod(diffDays);
      onUpdate({
        ...backtestParams,
        maxPeriod: diffDays,
        candleCount: diffDays
      });
    }
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
                </div>
                <p className="text-xs text-muted-foreground">
                  Ideal for {tf.value === '1m' || tf.value === '5m' ? 'short-term' : 
                    tf.value === '15m' || tf.value === '1h' ? 'medium-term' : 'long-term'} strategies
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Period Selection */}
      <div>
        <h3 className="font-medium mb-3">Backtest Period</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {timePeriods.map((period) => {
            const isSelected = selectedPeriod === period.days;
            return (
              <button
                key={period.days}
                onClick={() => updatePeriod(period.days)}
                className={`p-3 rounded-lg border transition text-center ${
                  isSelected
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border/60 hover:bg-muted/30'
                }`}
              >
                <div className="font-medium text-sm">{period.label}</div>
              </button>
            );
          })}
        </div>

        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Custom Period</h4>
              <Badge variant="outline" className="text-xs">
                {selectedPeriod} days
              </Badge>
            </div>
            
            <div className="space-y-2">
              <input
                type="range"
                min="7"
                max="1095"
                step="1"
                value={selectedPeriod}
                onChange={(e) => updatePeriod(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>7 days</span>
                <span className="font-medium">{selectedPeriod} days</span>
                <span>3 years</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Date Range Selection */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Date Range (Optional)</h3>
            <Badge variant={useCustomRange ? "default" : "outline"} className="text-xs">
              {useCustomRange ? "Custom Range" : "Latest Data"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="useCustomRange"
              checked={useCustomRange}
              onChange={(e) => setUseCustomRange(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="useCustomRange" className="text-sm">
              Use custom date range instead of latest available data
            </label>
          </div>

          {useCustomRange && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        if (date && endDate) updateDateRange();
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        if (startDate && date) updateDateRange();
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {useCustomRange && startDate && endDate && (
            <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
              <p>
                Selected range: {format(startDate, "MMM dd, yyyy")} to {format(endDate, "MMM dd, yyyy")}
              </p>
              <p>
                Duration: {Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-end pt-4">
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}