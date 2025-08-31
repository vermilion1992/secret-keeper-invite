import { useState } from 'react';
import { BacktestResult } from '@/types/botforge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Share2, TrendingUp, TrendingDown, Percent, Target, BarChart3, LineChart } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface StepResultsProps {
  backtestResult: BacktestResult;
  onExport: (format: 'python' | 'json', botName: string) => void;
  onShare: (botName: string) => void;
}

// Mock equity curve data (portfolio value over time)
const equityData = [
  { date: 'Jan', value: 10000, benchmark: 10000 },
  { date: 'Feb', value: 10850, benchmark: 10200 },
  { date: 'Mar', value: 11200, benchmark: 10150 },
  { date: 'Apr', value: 10950, benchmark: 10300 },
  { date: 'May', value: 11800, benchmark: 10250 },
  { date: 'Jun', value: 12100, benchmark: 10400 },
  { date: 'Jul', value: 11950, benchmark: 10350 },
  { date: 'Aug', value: 12650, benchmark: 10500 },
  { date: 'Sep', value: 12350, benchmark: 10450 },
  { date: 'Oct', value: 13200, benchmark: 10600 },
  { date: 'Nov', value: 12900, benchmark: 10550 },
  { date: 'Dec', value: 12350, benchmark: 10700 }
];

// Mock monthly returns data
const monthlyReturns = [
  { month: 'Jan', return: 8.5, trades: 12 },
  { month: 'Feb', return: 3.2, trades: 15 },
  { month: 'Mar', return: -2.1, trades: 8 },
  { month: 'Apr', return: 7.8, trades: 18 },
  { month: 'May', return: 2.5, trades: 14 },
  { month: 'Jun', return: -1.2, trades: 10 },
  { month: 'Jul', return: 5.9, trades: 16 },
  { month: 'Aug', return: -0.8, trades: 11 },
  { month: 'Sep', return: 6.9, trades: 19 },
  { month: 'Oct', return: -1.9, trades: 9 },
  { month: 'Nov', return: 4.1, trades: 13 },
  { month: 'Dec', return: -4.3, trades: 7 }
];

// Mock backtest result
const mockResult: BacktestResult = {
  roi: 23.5,
  sharpe: 1.8,
  drawdown: -8.2,
  winrate: 67.3,
  avgTrades: 156,
  equityCurve: [],
  tradeDistribution: []
};

export function StepResults({ onExport, onShare }: StepResultsProps) {
  const [botName, setBotName] = useState('');
  const result = mockResult;

  const metrics = [
    { 
      label: 'Total Return', 
      value: `+${result.roi}%`, 
      subtext: 'vs -2.1% benchmark',
      icon: TrendingUp, 
      positive: result.roi > 0,
      gradient: 'from-emerald-500 to-green-600'
    },
    { 
      label: 'Sharpe Ratio', 
      value: result.sharpe.toString(), 
      subtext: 'Risk-adjusted return',
      icon: Target, 
      positive: result.sharpe > 1,
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      label: 'Max Drawdown', 
      value: `${result.drawdown}%`, 
      subtext: 'Worst losing streak',
      icon: TrendingDown, 
      positive: result.drawdown > -15,
      gradient: 'from-orange-500 to-red-500'
    },
    { 
      label: 'Win Rate', 
      value: `${result.winrate}%`, 
      subtext: `${Math.round(result.avgTrades * result.winrate / 100)} profitable trades`,
      icon: Percent, 
      positive: result.winrate > 60,
      gradient: 'from-purple-500 to-purple-600'
    },
  ];

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
          Backtest Results
        </h2>
        <p className="text-muted-foreground">
          Professional analysis of your strategy's historical performance
        </p>
      </header>

      {/* Enhanced Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.label} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5`} />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center shadow-lg`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <Badge variant={metric.positive ? "default" : "destructive"} className="text-xs">
                  {metric.positive ? "Good" : "Risk"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                <p className="text-2xl font-bold mb-1">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.subtext}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Equity Curve Chart */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LineChart className="w-5 h-5 text-primary" />
              Portfolio Equity Curve
            </CardTitle>
            <p className="text-sm text-muted-foreground">Strategy vs Benchmark Performance</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={equityData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                    tickFormatter={(value) => `$${(value/1000).toFixed(1)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: string) => [
                      `$${value.toLocaleString()}`, 
                      name === 'value' ? 'Strategy' : 'Benchmark'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="benchmark" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Returns Chart */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              Monthly Returns
            </CardTitle>
            <p className="text-sm text-muted-foreground">Profit/Loss Distribution by Month</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: string) => [
                      `${value}%`, 
                      name === 'return' ? 'Return' : 'Trades'
                    ]}
                  />
                  <Bar dataKey="return" radius={[4, 4, 0, 0]}>
                    {monthlyReturns.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.return >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trade Summary */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Trade Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{result.avgTrades}</p>
              <p className="text-sm text-muted-foreground">Total Trades</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{Math.round(result.avgTrades * result.winrate / 100)}</p>
              <p className="text-sm text-muted-foreground">Winning Trades</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{result.avgTrades - Math.round(result.avgTrades * result.winrate / 100)}</p>
              <p className="text-sm text-muted-foreground">Losing Trades</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">1.85</p>
              <p className="text-sm text-muted-foreground">Avg Win/Loss</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Enhanced Export Section */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Your Trading Bot
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate production-ready code and share with the community
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <Label htmlFor="botName" className="text-sm font-medium">Bot Name *</Label>
              <Input
                id="botName"
                placeholder="Enter a memorable name for your trading bot"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => onExport('python', botName || 'Untitled Bot')} 
                disabled={!botName.trim()}
                variant="default"
                size="lg"
                className="h-auto py-4 flex-col gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Download className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-semibold">Python Package</div>
                  <div className="text-xs opacity-90">Complete .zip with docs</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => onExport('json', botName || 'Untitled Bot')} 
                disabled={!botName.trim()}
                variant="outline"
                size="lg"
                className="h-auto py-4 flex-col gap-2 border-2"
              >
                <Download className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-semibold">JSON Config</div>
                  <div className="text-xs text-muted-foreground">Configuration only</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => onShare(botName || 'Untitled Bot')} 
                disabled={!botName.trim()}
                variant="secondary"
                size="lg"
                className="h-auto py-4 flex-col gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800"
              >
                <Share2 className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-semibold">Share & Earn</div>
                  <div className="text-xs text-green-600 dark:text-green-400">+1 Credit Reward</div>
                </div>
              </Button>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>Python Package</strong> includes strategy implementation, risk management, documentation, and setup instructions. 
                <strong>JSON Config</strong> contains strategy parameters for integration. 
                <strong>Share to Community</strong> makes your bot public and earns you 1 credit.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}