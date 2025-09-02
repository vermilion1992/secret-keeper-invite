import { BacktestParams, Timeframe } from '@/types/botforge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Clock, CalendarIcon, Info, ChevronDown, Timer, BarChart2 } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StepTimeframeProps {
  backtestParams: BacktestParams;
  onUpdate: (params: BacktestParams) => void;
  onNext: () => void;
}

export function StepTimeframe({ backtestParams, onUpdate, onNext }: StepTimeframeProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(365); // days
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 365));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [higherTimeframe, setHigherTimeframe] = useState('1d');
  const [executionTiming, setExecutionTiming] = useState('bar_close');

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
    <TooltipProvider>
      <div className="space-y-6">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Timer className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Timeframe Selection</h2>
          </div>
          <p className="text-muted-foreground">
            Define the data interval and timing for signals and filters
          </p>
        </header>

        {/* Default Settings - Always Visible */}
        <Card className="frosted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-primary" />
              Primary Timeframe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="font-medium">Chart Interval</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">The candle interval used for trade signals. Shorter timeframes = more frequent signals.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {timeframes.map((tf) => {
                  const isSelected = backtestParams.timeframe === tf.value;
                  return (
                    <button
                      key={tf.value}
                      onClick={() => updateTimeframe(tf.value)}
                      className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : 'border-border/60 hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="font-medium">{tf.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ideal for {tf.value === '1m' || tf.value === '5m' ? 'scalping' : 
                          tf.value === '15m' || tf.value === '1h' ? 'day trading' : 'swing trading'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Backtest Period Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="font-medium">Backtest Period</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">How much historical data to use for testing your strategy. More data = more reliable results.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {timePeriods.map((period) => {
                  const isSelected = selectedPeriod === period.days;
                  return (
                    <button
                      key={period.days}
                      onClick={() => updatePeriod(period.days)}
                      className={`p-3 rounded-lg border transition-all duration-200 text-center ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border/60 hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      <div className="font-medium text-sm">{period.label}</div>
                    </button>
                  );
                })}
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
                  <CardTitle className="text-lg">Advanced Timing Options</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Multi-Timeframe</Badge>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="space-y-4 mt-4">
              {/* Higher Timeframe Filters */}
              <Card className="frosted">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart2 className="w-4 h-4 text-primary" />
                    Higher Timeframe Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Trend Filter Timeframe</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Confirm trades with higher timeframe trend direction. Helps filter out counter-trend signals.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select value={higherTimeframe} onValueChange={setHigherTimeframe}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="4h">4 Hours</SelectItem>
                        <SelectItem value="1d">Daily</SelectItem>
                        <SelectItem value="1w">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Multi-Timeframe Setup</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Combine multiple timeframes to reduce false signals. Example: signals on 4h but confirmation from 1d.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="text-xs">Single TF</Button>
                      <Button variant="default" className="text-xs">Multi TF</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Execution Timing */}
              <Card className="frosted">
                <CardHeader>
                  <CardTitle className="text-base">Execution Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Signal Execution</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Decide when the bot executes trades after a signal is detected. Bar close is more reliable but slower.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select value={executionTiming} onValueChange={setExecutionTiming}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar_close">At Bar Close (Recommended)</SelectItem>
                        <SelectItem value="next_bar_open">Next Bar Open</SelectItem>
                        <SelectItem value="immediate">Immediate (Real-time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Date Range */}
              <Card className="frosted">
                <CardHeader>
                  <CardTitle className="text-base">Custom Date Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="useCustomRange"
                        checked={useCustomRange}
                        onChange={(e) => setUseCustomRange(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="useCustomRange" className="text-sm font-medium">
                        Use custom date range instead of latest available data
                      </label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Test your strategy on specific historical periods, useful for crisis testing or seasonal analysis.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {useCustomRange && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal bg-background/50",
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
                          <Label className="text-sm font-medium mb-2 block">End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal bg-background/50",
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
                      <div className="text-sm text-muted-foreground bg-primary/5 border border-primary/20 p-3 rounded-lg">
                        <p className="font-medium text-foreground">
                          Selected range: {format(startDate, "MMM dd, yyyy")} to {format(endDate, "MMM dd, yyyy")}
                        </p>
                        <p>
                          Duration: {Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex items-center justify-end pt-6">
          <Button onClick={onNext} size="lg" className="px-8">
            Continue to Backtest
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}