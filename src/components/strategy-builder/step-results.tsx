import { useState } from 'react';
import { motion } from 'framer-motion';
import { BacktestResult } from '@/types/botforge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Share2, TrendingUp, TrendingDown, Percent, Target, BarChart3, LineChart } from 'lucide-react';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { MetricCard } from '@/components/charts/MetricCard';

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
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.header 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2 
          className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Backtest Results
        </motion.h2>
        <motion.p 
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Professional analysis of your strategy's historical performance
        </motion.p>
      </motion.header>

      {/* Enhanced Performance Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            subtext={metric.subtext}
            icon={metric.icon}
            positive={metric.positive}
            gradient={metric.gradient}
            index={index}
          />
        ))}
      </motion.div>

      {/* Chart Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <AnimatedLineChart
          data={equityData}
          title="Portfolio Equity Curve"
          subtitle="Strategy vs Benchmark Performance"
          icon={LineChart}
          showBenchmark={true}
          gradientId="equityGradient"
        />

        <AnimatedBarChart
          data={monthlyReturns}
          title="Monthly Returns"
          subtitle="Profit/Loss Distribution by Month"
          icon={BarChart3}
        />
      </motion.div>

      {/* Trade Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-card via-card to-card/50">
          <CardHeader>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 }}
            >
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full" />
                Trade Analysis Summary
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: result.avgTrades, label: "Total Trades", color: "text-primary", delay: 1.4 },
                { value: Math.round(result.avgTrades * result.winrate / 100), label: "Winning Trades", color: "text-emerald-500", delay: 1.5 },
                { value: result.avgTrades - Math.round(result.avgTrades * result.winrate / 100), label: "Losing Trades", color: "text-red-500", delay: 1.6 },
                { value: "1.85", label: "Avg Win/Loss", color: "text-blue-500", delay: 1.7 }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  className="text-center group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: stat.delay }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.p 
                    className={`text-3xl font-bold ${stat.color} group-hover:scale-110 transition-transform duration-200`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: stat.delay + 0.1,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator className="my-8" />

      {/* Enhanced Export Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.8 }}
      >
        <Card className="shadow-lg border-primary/20 hover:shadow-xl transition-shadow duration-300">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
          >
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Download className="w-5 h-5" />
                </motion.div>
                Export Your Trading Bot
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate production-ready code and share with the community
              </p>
            </CardHeader>
          </motion.div>
          <CardContent className="p-6">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0 }}
            >
              <div>
                <Label htmlFor="botName" className="text-sm font-medium">Bot Name *</Label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Input
                    id="botName"
                    placeholder="Enter a memorable name for your trading bot"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="mt-2"
                  />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    onClick: () => onExport('python', botName || 'Untitled Bot'),
                    variant: "default" as const,
                    gradient: "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                    title: "Python Package",
                    subtitle: "Complete .zip with docs",
                    delay: 2.1
                  },
                  {
                    onClick: () => onExport('json', botName || 'Untitled Bot'),
                    variant: "outline" as const,
                    gradient: "border-2",
                    title: "JSON Config",
                    subtitle: "Configuration only",
                    delay: 2.2
                  },
                  {
                    onClick: () => onShare(botName || 'Untitled Bot'),
                    variant: "secondary" as const,
                    gradient: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800",
                    title: "Share & Earn",
                    subtitle: "+1 Credit Reward",
                    delay: 2.3
                  }
                ].map((button, index) => (
                  <motion.div
                    key={button.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: button.delay }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={button.onClick}
                      disabled={!botName.trim()}
                      variant={button.variant}
                      size="lg"
                      className={`h-auto py-4 flex-col gap-2 ${button.gradient} transition-all duration-300`}
                    >
                      <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                      >
                        <Download className="w-5 h-5" />
                      </motion.div>
                      <div className="text-center">
                        <div className="font-semibold">{button.title}</div>
                        <div className={`text-xs ${button.title === "Share & Earn" ? "text-green-600 dark:text-green-400" : button.variant === "default" ? "opacity-90" : "text-muted-foreground"}`}>
                          {button.subtitle}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="bg-muted/30 rounded-lg p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.4 }}
              >
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong>Python Package</strong> includes strategy implementation, risk management, documentation, and setup instructions. 
                  <strong>JSON Config</strong> contains strategy parameters for integration. 
                  <strong>Share to Community</strong> makes your bot public and earns you 1 credit.
                </p>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}