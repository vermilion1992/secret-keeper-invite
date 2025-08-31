import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, Users, Bot, MessageCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useCryptoPrices } from "@/hooks/use-crypto-prices";

const Index = () => {
  const navigate = useNavigate();
  const { prices } = useCryptoPrices(30000);

  const areaData = useMemo(() => (
    Array.from({ length: 12 }).map((_, i) => ({
      month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
      pnl: Math.round(50 + Math.sin(i / 2) * 40 + i * 5),
      equity: Math.round(60 + Math.cos(i / 2) * 30 + i * 6),
    }))
  ), []);

  const barData = useMemo(() => (
    Array.from({ length: 7 }).map((_, i) => ({
      day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
      sales: Math.round(20 + Math.random() * 80),
      revenue: Math.round(20 + Math.random() * 80),
    }))
  ), []);

  const [miniChat, setMiniChat] = useState<string>("");

  const Stat = ({ label, value, change }:{ label:string; value:string; change:number | undefined }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        {typeof change === 'number' && (
          <span className={`text-sm font-medium ${change >= 0 ? 'text-success' : 'text-destructive'}`}>{change.toFixed(2)}%</span>
        )}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your bots and the market</p>
          </div>
          <Button onClick={() => navigate('/strategy-builder')} className="gap-2">
            Start Building Now <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Stat label="BTC Price" value={prices.bitcoin ? `$${prices.bitcoin.usd.toLocaleString()}` : '—'} change={prices.bitcoin?.change24h} />
          <Stat label="ETH Price" value={prices.ethereum ? `$${prices.ethereum.usd.toLocaleString()}` : '—'} change={prices.ethereum?.change24h} />
          <Stat label="SOL Price" value={prices.solana ? `$${prices.solana.usd.toLocaleString()}` : '—'} change={prices.solana?.change24h} />
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Backtests Performed</p>
                <p className="text-2xl font-semibold">8,247</p>
              </div>
              <div className="text-sm text-success">+15.8% this week</div>
            </div>
          </Card>
        </div>

        {/* App Features + Top Bot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>What you can do</CardTitle>
              <CardDescription>Build, backtest, share and manage bots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link to="/strategy-builder" className="hover-scale">
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <TrendingUp className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Strategy Builder</p>
                      <p className="text-sm text-muted-foreground">Wizard-driven creation with risk controls and backtesting.</p>
                    </div>
                  </div>
                </Link>
                <Link to="/bot-community" className="hover-scale">
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Bot Community</p>
                      <p className="text-sm text-muted-foreground">Share bots, discover top performers and collaborate.</p>
                    </div>
                  </div>
                </Link>
                <Link to="/my-bots" className="hover-scale">
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <Bot className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">My Bots</p>
                      <p className="text-sm text-muted-foreground">Manage, export and deploy your personal bots.</p>
                    </div>
                  </div>
                </Link>
                <Link to="/ai-chat" className="hover-scale">
                  <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <MessageCircle className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">AI Strategy Chat</p>
                      <p className="text-sm text-muted-foreground">Get instant guidance and iterate on ideas faster.</p>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="mt-6">
                <Button onClick={() => navigate('/strategy-builder')} className="gap-2">
                  Start Building Now <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-yellow-500">#1</span>
                Top Community Bot
              </CardTitle>
              <CardDescription>Most profitable bot this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Momentum King</p>
                    <p className="text-sm text-muted-foreground">by @cryptomaster</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-success">+127.3%</p>
                    <p className="text-xs text-muted-foreground">7-day return</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pairs:</span>
                    <span>BTC/USDT, ETH/USDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Timeframe:</span>
                    <span>15m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Win Rate:</span>
                    <span>68.4%</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/bot-community')}>
                  View Bot Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Chat - Full Width Bottom */}
        <Card>
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
                  value={miniChat}
                  onChange={(e) => setMiniChat(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/ai-chat')}
                />
              </div>
              <Button onClick={() => navigate('/ai-chat')} className="gap-2">
                Open Chat <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
