import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowTrendingUpIcon, UsersIcon, CommandLineIcon, ChatBubbleLeftRightIcon, ArrowRightIcon, InformationCircleIcon, ChartBarIcon, ArrowUpIcon, ChartPieIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useCryptoPrices } from "@/hooks/use-crypto-prices";
import { AnimatedLineChart } from "@/components/charts/AnimatedLineChart";
import { AnimatedBarChart } from "@/components/charts/AnimatedBarChart";
import { AnimatedPieChart } from "@/components/charts/AnimatedPieChart";
import { DrawdownChart } from "@/components/charts/DrawdownChart";

const Index = () => {
  const navigate = useNavigate();
  const { prices } = useCryptoPrices(30000);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  // Portfolio ROI data
  const portfolioData = useMemo(() => (
    Array.from({ length: 30 }).map((_, i) => ({
      date: `Day ${i + 1}`,
      value: 10000 + (Math.sin(i / 5) * 2000) + (i * 150) + (Math.random() * 500 - 250),
      benchmark: 10000 + (i * 50) + (Math.random() * 200 - 100),
    }))
  ), []);

  // Monthly performance data
  const monthlyData = useMemo(() => (
    Array.from({ length: 12 }).map((_, i) => ({
      month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
      return: Math.round((Math.sin(i / 2) * 8 + Math.random() * 12 - 4) * 10) / 10,
      trades: Math.round(15 + Math.random() * 20),
    }))
  ), []);

  // Trade outcome distribution data
  const tradeOutcomeData = useMemo(() => [
    { name: 'Big Wins (≥ +2R)', value: 22.5, color: 'hsl(var(--chart-1))' },
    { name: 'Small Wins (< +2R)', value: 43.8, color: 'hsl(var(--chart-2))' },
    { name: 'Break-even', value: 8.2, color: 'hsl(var(--chart-3))' },
    { name: 'Small Losses (< -2R)', value: 18.7, color: 'hsl(var(--chart-4))' },
    { name: 'Big Losses (≥ -2R)', value: 6.8, color: 'hsl(var(--chart-5))' },
  ], []);

  // Drawdown data
  const drawdownData = useMemo(() => (
    Array.from({ length: 30 }).map((_, i) => ({
      date: `Day ${i + 1}`,
      drawdown: Math.min(0, -Math.abs(Math.sin(i / 7) * 5) - Math.random() * 3),
    }))
  ), []);

  const Stat = ({ label, value, change }:{ label:string; value:string; change:number | undefined }) => (
    <Card className="p-4 hover:shadow-[0_0_8px_hsl(var(--primary)/0.18)] transition-all duration-150">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold">{value}</p>
            {typeof change === 'number' && (
              <span className={`text-sm font-medium ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const ChartCard = ({ children, title, isExpanded, onToggle }: { 
    children: React.ReactNode; 
    title: string; 
    isExpanded: boolean; 
    onToggle: () => void; 
  }) => (
    <div className={`transition-all duration-300 ${isExpanded ? 'col-span-full' : ''}`}>
      <Card className="h-full hover:shadow-[0_0_8px_hsl(var(--primary)/0.18)] transition-all duration-150">
        <div className="p-6 h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? '−' : '+'}
            </Button>
          </div>
          {children}
        </div>
      </Card>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Overview of your bots and the market</p>
            </div>
            <Button onClick={() => navigate('/strategy-builder')} className="gap-2">
              Start Building Now <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Ticker Tiles - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Stat label="BTC Price" value={prices.bitcoin ? `$${prices.bitcoin.usd.toLocaleString()}` : '—'} change={prices.bitcoin?.change24h} />
            <Stat label="ETH Price" value={prices.ethereum ? `$${prices.ethereum.usd.toLocaleString()}` : '—'} change={prices.ethereum?.change24h} />
            <Stat label="SOL Price" value={prices.solana ? `$${prices.solana.usd.toLocaleString()}` : '—'} change={prices.solana?.change24h} />
            <Card className="p-4 hover:shadow-[0_0_8px_hsl(var(--primary)/0.18)] transition-all duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bots Created</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-semibold">142</p>
                    <span className="text-sm font-medium text-success">+23.4%</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">this week</div>
              </div>
            </Card>
          </div>

          {/* Top Community Bot - Full Width */}
          <Card className="hover:shadow-[0_0_8px_hsl(var(--primary)/0.18)] transition-all duration-150">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-yellow-500">#1</span>
                  Top Community Bot
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InformationCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">This highlights the most profitable community-shared bot of the week. Copy its settings or view details to see how it trades.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>Most profitable bot this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                {/* Left side: Bot details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-semibold">Momentum King</p>
                      <p className="text-sm text-muted-foreground">by @cryptomaster</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-success">+127.3%</p>
                      <p className="text-xs text-muted-foreground">7-day return</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pairs:</span>
                      <span>BTC/USDT, ETH/USDT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeframe:</span>
                      <span>15m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win Rate:</span>
                      <span>68.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sharpe Ratio:</span>
                      <span>2.14</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => navigate('/bot-community')} className="flex-1">
                      View Bot Details
                    </Button>
                    <Button variant="outline" className="flex-1 opacity-50 cursor-not-allowed">
                      Copy Settings (Pro)
                    </Button>
                  </div>
                </div>
                
                {/* Right side: Compact performance chart */}
                <div className="h-[200px]">
                  <div className="h-full w-full bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <ArrowUpIcon className="h-8 w-8 text-success mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Performance Chart</p>
                      <p className="text-xs text-muted-foreground">7-day equity curve</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard 
              title="Portfolio ROI Curve"
              isExpanded={expandedChart === 'roi'}
              onToggle={() => setExpandedChart(expandedChart === 'roi' ? null : 'roi')}
            >
              {expandedChart === 'roi' ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">Portfolio ROI Curve</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InformationCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Shows the growth of your strategy's returns vs. initial capital.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Visualizes how your portfolio value changes over time, benchmarked against starting capital.</p>
                  <AnimatedLineChart 
                    data={portfolioData}
                    title=""
                    icon={ChartBarIcon}
                  />
                </div>
              ) : (
                <div className="h-[200px] bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ChartBarIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Portfolio ROI</p>
                    <p className="text-xs text-muted-foreground">Click to expand</p>
                  </div>
                </div>
              )}
            </ChartCard>

            <ChartCard 
              title="Monthly Performance"
              isExpanded={expandedChart === 'monthly'}
              onToggle={() => setExpandedChart(expandedChart === 'monthly' ? null : 'monthly')}
            >
              {expandedChart === 'monthly' ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">Monthly Performance</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InformationCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Breakdown of profits and losses by month.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Quickly compare performance across months to spot trends or streaks.</p>
                  <AnimatedBarChart 
                    data={monthlyData}
                    title=""
                    icon={ChartBarIcon}
                  />
                </div>
              ) : (
                <div className="h-[200px] bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ChartBarIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Monthly Returns</p>
                    <p className="text-xs text-muted-foreground">Click to expand</p>
                  </div>
                </div>
              )}
            </ChartCard>

            <ChartCard 
              title="Trade Outcome Distribution"
              isExpanded={expandedChart === 'outcomes'}
              onToggle={() => setExpandedChart(expandedChart === 'outcomes' ? null : 'outcomes')}
            >
              {expandedChart === 'outcomes' ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">Trade Outcome Distribution</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InformationCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Breakdown of trade results into winners, losers, and breakeven.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Highlights whether your strategy relies on big wins, steady gains, or suffers large losses.</p>
                  <AnimatedPieChart 
                    data={tradeOutcomeData}
                    title=""
                    subtitle=""
                    icon={ChartPieIcon}
                  />
                </div>
              ) : (
                <div className="h-[200px] bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ChartPieIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium">Trade Outcomes</p>
                    <p className="text-xs text-muted-foreground">Click to expand</p>
                  </div>
                </div>
              )}
            </ChartCard>

            <ChartCard 
              title="Drawdown Over Time"
              isExpanded={expandedChart === 'drawdown'}
              onToggle={() => setExpandedChart(expandedChart === 'drawdown' ? null : 'drawdown')}
            >
              {expandedChart === 'drawdown' ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">Drawdown Over Time</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InformationCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Measures peak-to-trough equity decline.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Shows the worst declines during the test, helping assess capital risk exposure.</p>
                  <DrawdownChart 
                    data={drawdownData}
                    title=""
                    subtitle=""
                    icon={ArrowDownIcon}
                  />
                </div>
              ) : (
                <div className="h-[200px] bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ArrowDownIcon className="h-8 w-8 text-destructive mx-auto mb-2" />
                    <p className="text-sm font-medium">Drawdown Risk</p>
                    <p className="text-xs text-muted-foreground">Click to expand</p>
                  </div>
                </div>
              )}
            </ChartCard>
          </div>

          {/* App Features */}
          <Card className="hover:shadow-[0_0_8px_hsl(var(--primary)/0.18)] transition-all duration-150">
            <CardHeader>
              <CardTitle>What you can do</CardTitle>
              <CardDescription>Build, backtest, share and manage bots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/strategy-builder" className="transition-transform duration-150 hover:scale-[1.005]">
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:shadow-[0_0_8px_hsl(var(--primary)/0.18)] transition-all duration-150">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Strategy Builder</p>
                      <p className="text-sm text-muted-foreground">Wizard-driven creation with risk controls and backtesting.</p>
                    </div>
                  </div>
                </Link>
                <Link to="/bot-community" className="transition-transform duration-150 hover:scale-[1.005]">
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:shadow-[0_0_8px_hsl(var(--primary)/0.18)] transition-all duration-150">
                    <UsersIcon className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Bot Community</p>
                      <p className="text-sm text-muted-foreground">Share bots, discover top performers and collaborate.</p>
                    </div>
                  </div>
                </Link>
                <Link to="/my-bots" className="transition-transform duration-150 hover:scale-[1.005]">
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:shadow-[0_0_8px_hsl(var(--primary)/0.18)] transition-all duration-150">
                    <CommandLineIcon className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">My Bots</p>
                      <p className="text-sm text-muted-foreground">Manage, export and deploy your personal bots.</p>
                    </div>
                  </div>
                </Link>
                <Link to="/ai-chat" className="transition-transform duration-150 hover:scale-[1.005]">
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:shadow-[0_0_8px_hsl(var(--primary)/0.18)] transition-all duration-150">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">AI Strategy Chat</p>
                      <p className="text-sm text-muted-foreground">Get instant guidance and iterate on ideas faster.</p>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="mt-6">
                <Button onClick={() => navigate('/strategy-builder')} className="gap-2">
                  Start Building Now <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Chat - Full Width Bottom */}
          <Card className="hover:shadow-[0_0_8px_hsl(var(--primary)/0.18)] transition-all duration-150">
            <CardHeader>
              <CardTitle>Quick AI Chat</CardTitle>
              <CardDescription>Get instant strategy guidance and ideas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <input
                    className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Ask about strategies, market analysis, or get trading ideas..."
                    onKeyDown={(e) => e.key === 'Enter' && navigate('/ai-chat')}
                  />
                </div>
                <Button onClick={() => navigate('/ai-chat')} className="gap-2">
                  Open Chat <ChatBubbleLeftRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Index;
