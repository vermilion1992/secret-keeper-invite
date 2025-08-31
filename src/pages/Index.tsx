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
                <p className="text-sm text-muted-foreground">Community Members</p>
                <p className="text-2xl font-semibold">12,482</p>
              </div>
              <div className="text-sm text-success">+3.2% WoW</div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Portfolio Equity</CardTitle>
              <CardDescription>Simulated equity curve across the year</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ pnl: { label: 'PnL', color: 'hsl(var(--primary))' }}}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="fillEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="10%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="equity" stroke="hsl(var(--primary))" fill="url(#fillEquity)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Profit</CardTitle>
              <CardDescription>Sales vs revenue (mock)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ sales: { label: 'Sales', color: 'hsl(var(--primary))' }, revenue: { label: 'Revenue', color: 'hsl(var(--success))' }}}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
                  <Bar dataKey="revenue" fill="hsl(var(--success))" radius={[4,4,0,0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* App Features + Mini Chat */}
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
              <CardTitle>Quick Chat</CardTitle>
              <CardDescription>Ask the AI anything</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">Try a prompt:</div>
                <div className="rounded-md border p-3 text-sm">Suggest a momentum strategy for BTC on 1h</div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none"
                    placeholder="Ask about a strategy..."
                    value={miniChat}
                    onChange={(e) => setMiniChat(e.target.value)}
                  />
                  <Button onClick={() => navigate('/ai-chat')} variant="secondary">Open Chat</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
