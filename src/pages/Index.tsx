import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowTrendingUpIcon, UsersIcon, CommandLineIcon, ChatBubbleLeftRightIcon, ArrowRightIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useCryptoPrices } from "@/hooks/use-crypto-prices";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, CartesianGrid, ReferenceLine } from "recharts";

const Index = () => {
  const navigate = useNavigate();
  const { prices } = useCryptoPrices(30000);
  // Small performance chart data for top bot
  const topBotPerformanceData = useMemo(() => (
    Array.from({ length: 7 }).map((_, i) => ({
      date: `Day ${i + 1}`,
      value: 10000 + (i * 450) + (Math.sin(i / 2) * 300) + (Math.random() * 200 - 100),
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

          {/* Top Community Bot + Performance Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Top Community Bot details */}
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
              </CardContent>
            </Card>

            {/* Right: Performance Chart */}
            <Card className="hover:shadow-[0_0_8px_hsl(var(--primary)/0.18)] transition-all duration-150">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Top Bot Performance
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InformationCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">7-day equity curve based on simulated performance.</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <CardDescription>7-day equity curve</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={topBotPerformanceData} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.3} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`} />
                      <ReferenceLine y={topBotPerformanceData[0]?.value || 0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
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
