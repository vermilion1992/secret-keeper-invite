import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BacktestResult } from '@/types/botforge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Share2, TrendingUp, TrendingDown, Percent, Target, BarChart3, LineChart, PieChart, TrendingDown as DrawdownIcon, GitCompare, Maximize2, Minimize2, Info } from 'lucide-react';
import { AnimatedLineChart } from '@/components/charts/AnimatedLineChart';
import { AnimatedBarChart } from '@/components/charts/AnimatedBarChart';
import { AnimatedPieChart } from '@/components/charts/AnimatedPieChart';
import { DrawdownChart } from '@/components/charts/DrawdownChart';
import { MetricCard } from '@/components/charts/MetricCard';
import { createPortal } from 'react-dom';

interface StepResultsProps {
  backtestResult: BacktestResult;
  onExport: (format: 'python' | 'json', botName: string) => void;
  onShare: (botName: string) => void;
  onPrevious: () => void;
  onCompare?: () => void;
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

// Mock trade outcome distribution data for pie chart
const tradeDistribution = [
  { name: 'Big Wins (≥ +2R)', value: 23.1, color: 'hsl(var(--chart-1))' },
  { name: 'Small Wins (< +2R)', value: 44.2, color: 'hsl(var(--chart-2))' },
  { name: 'Break-even Trades', value: 5.8, color: 'hsl(var(--chart-3))' },
  { name: 'Small Losses (< -2R)', value: 19.2, color: 'hsl(var(--chart-4))' },
  { name: 'Big Losses (≥ -2R)', value: 7.7, color: 'hsl(var(--chart-5))' }
];

// Mock drawdown data
const drawdownData = [
  { date: 'Jan', drawdown: 0 },
  { date: 'Feb', drawdown: -1.2 },
  { date: 'Mar', drawdown: -0.8 },
  { date: 'Apr', drawdown: -2.1 },
  { date: 'May', drawdown: -1.5 },
  { date: 'Jun', drawdown: -3.2 },
  { date: 'Jul', drawdown: -2.8 },
  { date: 'Aug', drawdown: -4.1 },
  { date: 'Sep', drawdown: -3.5 },
  { date: 'Oct', drawdown: -8.2 },
  { date: 'Nov', drawdown: -6.1 },
  { date: 'Dec', drawdown: -4.8 }
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

export function StepResults({ onExport, onShare, onPrevious, onCompare = () => console.log('Compare backtests') }: StepResultsProps) {
  const [botName, setBotName] = useState('');
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
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

  const openModal = (chartId: string) => {
    setExpandedChart(chartId);
    setIsClosing(false);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setExpandedChart(null);
      setIsClosing(false);
      document.body.style.overflow = '';
    }, 200);
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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

      {/* Trade Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-card via-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full" />
                Trade Analysis Summary
              </CardTitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onCompare?.()}
                className="gap-2"
              >
                <GitCompare className="w-4 h-4" />
                Compare Previous
              </Button>
            </motion.div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: result.avgTrades, label: "Total Trades", color: "text-primary", delay: 1.1 },
                { value: Math.round(result.avgTrades * result.winrate / 100), label: "Winning Trades", color: "text-emerald-500", delay: 1.2 },
                { value: result.avgTrades - Math.round(result.avgTrades * result.winrate / 100), label: "Losing Trades", color: "text-red-500", delay: 1.3 },
                { value: "1.85", label: "Avg Win/Loss", color: "text-blue-500", delay: 1.4 }
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

      {/* Advanced Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <TooltipProvider>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-card via-card to-card/50">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="advanced-stats" className="border-none">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full" />
                      Advanced Statistics
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        {
                          label: "Biggest Winner",
                          value: "+$2,450 (18.3%)",
                          tooltip: "The most profitable single trade in both dollar amount and percentage"
                        },
                        {
                          label: "Biggest Loser", 
                          value: "-$890 (6.2%)",
                          tooltip: "The largest loss on a single trade in both dollar amount and percentage"
                        },
                        {
                          label: "Average Trade Duration",
                          value: "2.4 days",
                          tooltip: "Average time a position is held from entry to exit"
                        },
                        {
                          label: "Longest Trade Duration",
                          value: "12.3 days",
                          tooltip: "The maximum time any single position was held"
                        },
                        {
                          label: "Shortest Trade Duration",
                          value: "0.3 days",
                          tooltip: "The minimum time any single position was held"
                        },
                        {
                          label: "Long vs Short Breakdown",
                          value: "68% Long / 32% Short",
                          tooltip: "Percentage distribution between long and short positions"
                        },
                        {
                          label: "Win Rate (Longs)",
                          value: "71.2%",
                          tooltip: "Percentage of profitable long positions"
                        },
                        {
                          label: "Win Rate (Shorts)",
                          value: "58.9%",
                          tooltip: "Percentage of profitable short positions"
                        },
                        {
                          label: "Profit Factor",
                          value: "1.85",
                          tooltip: "Gross profit divided by gross loss. Values > 1.0 indicate profitability"
                        },
                        {
                          label: "Expectancy",
                          value: "$45.20",
                          tooltip: "Average expected return per trade based on historical performance"
                        },
                        {
                          label: "Kelly %",
                          value: "12.3%",
                          tooltip: "Optimal position size according to Kelly Criterion for risk management"
                        },
                        {
                          label: "Trade Frequency",
                          value: "13 per month",
                          tooltip: "Average number of trades executed per time period"
                        },
                        {
                          label: "Equity Peak vs Valley",
                          value: "$13,200 / $9,850",
                          tooltip: "Highest and lowest portfolio values during the backtest period"
                        },
                        {
                          label: "Max Consecutive Wins",
                          value: "8 trades",
                          tooltip: "Longest streak of consecutive profitable trades"
                        },
                        {
                          label: "Max Consecutive Losses",
                          value: "4 trades",
                          tooltip: "Longest streak of consecutive losing trades"
                        },
                        {
                          label: "Recovery Factor",
                          value: "2.87",
                          tooltip: "Net profit divided by maximum drawdown. Higher values indicate better recovery"
                        },
                        {
                          label: "Average Risk:Reward Ratio",
                          value: "1:1.9",
                          tooltip: "Average ratio of risk taken to potential reward per trade"
                        },
                        {
                          label: "Average Position Size",
                          value: "8.5%",
                          tooltip: "Average proportion of your capital allocated per trade. Higher values = more aggressive sizing."
                        }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          className="flex items-start justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05 }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-foreground">{stat.label}</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{stat.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <p className="text-lg font-semibold text-primary">{stat.value}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TooltipProvider>
      </motion.div>

      {/* Chart Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
      >
        {/* Equity Chart */}
        <div 
          className="cursor-pointer hover-scale"
          onClick={() => openModal('equity')}
        >
          <div className="relative">
            <AnimatedLineChart
              data={equityData}
              title="Return on Investment"
              subtitle="Strategy vs Benchmark Performance"
              icon={LineChart}
              showBenchmark={true}
              gradientId="equityGradient"
            />
          </div>
        </div>

        {/* Monthly Returns Chart */}
        <div 
          className="cursor-pointer hover-scale"
          onClick={() => openModal('returns')}
        >
          <div className="relative">
            <AnimatedBarChart
              data={monthlyReturns}
              title="Monthly Returns"
              subtitle="Profit/Loss Distribution by Month"
              icon={BarChart3}
            />
          </div>
        </div>

        {/* Trade Distribution Chart */}
        <div 
          className="cursor-pointer hover-scale"
          onClick={() => openModal('distribution')}
        >
          <div className="relative">
            <AnimatedPieChart
              data={tradeDistribution}
              title="Trade Outcome"
              subtitle="Trade Outcome Breakdown"
              icon={PieChart}
            />
          </div>
        </div>

        {/* Drawdown Chart */}
        <div 
          className="cursor-pointer hover-scale"
          onClick={() => openModal('drawdown')}
        >
          <div className="relative">
            <DrawdownChart
              data={drawdownData}
              title="Drawdown Over Time"
              subtitle="Risk Assessment Over Time"
              icon={DrawdownIcon}
            />
          </div>
        </div>
      </motion.div>

      {/* Chart Modal with Constellation Background */}
      {expandedChart && createPortal(
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            overflow: 'hidden'
          }}
          onClick={closeModal}
        >
          {/* Constellation Background Effect */}
          <div className="absolute inset-0 overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none">
              {/* Generate constellation stars */}
              {[...Array(40)].map((_, i) => {
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const size = 1.5 + Math.random() * 2.5;
                return (
                  <circle
                    key={`star-${i}`}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r={size}
                    fill="hsl(0 0% 100% / 0.9)"
                    className="animate-pulse"
                    style={{
                      animationDelay: `${Math.random() * 4}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                      filter: 'drop-shadow(0 0 6px hsl(var(--primary)))'
                    }}
                  />
                );
              })}
              
              {/* Generate connecting lines */}
              {[...Array(15)].map((_, i) => {
                const x1 = Math.random() * 100;
                const y1 = Math.random() * 100;
                const x2 = x1 + (Math.random() - 0.5) * 30;
                const y2 = y1 + (Math.random() - 0.5) * 30;
                return (
                  <line
                    key={`line-${i}`}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${Math.max(0, Math.min(100, x2))}%`}
                    y2={`${Math.max(0, Math.min(100, y2))}%`}
                    stroke="hsl(var(--primary) / 0.3)"
                    strokeWidth="1"
                    className="opacity-60"
                    style={{
                      animation: 'constellation-pulse 8s ease-in-out infinite',
                      animationDelay: `${Math.random() * 3}s`
                    }}
                  />
                );
              })}
            </svg>
          </div>
          
          <div
            className={`bg-white dark:bg-gray-900 border border-border rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] relative z-10 ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {expandedChart === 'equity' && <LineChart className="h-6 w-6 text-primary" />}
                    {expandedChart === 'returns' && <BarChart3 className="h-6 w-6 text-primary" />}
                    {expandedChart === 'distribution' && <PieChart className="h-6 w-6 text-primary" />}
                    {expandedChart === 'drawdown' && <DrawdownIcon className="h-6 w-6 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-foreground">
                        {expandedChart === 'equity' && 'Return on Investment'}
                        {expandedChart === 'returns' && 'Monthly Returns'}
                        {expandedChart === 'distribution' && 'Trade Outcome Distribution'}
                        {expandedChart === 'drawdown' && 'Drawdown Analysis'}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {expandedChart === 'equity' && 'Strategy vs Benchmark Performance'}
                      {expandedChart === 'returns' && 'Profit/Loss Distribution by Month'}
                      {expandedChart === 'distribution' && 'Trade Outcome Breakdown'}
                      {expandedChart === 'drawdown' && 'Risk Assessment Over Time'}
                    </p>
                    <div className="bg-muted/30 p-3 rounded-lg border-l-4 border-primary">
                      <p className="text-sm text-foreground">
                        {expandedChart === 'equity' && 'Portfolio value over time compared to benchmark performance. Shows long-term compounding effects and sustainability of your strategy gains.'}
                        {expandedChart === 'returns' && 'Percentage returns and trade activity breakdown by month. Identifies seasonal patterns, consistency, and peak performance periods.'}
                        {expandedChart === 'distribution' && 'Distribution of trade outcomes by win/loss magnitude. Shows whether strategy relies on big wins vs steady gains and risk exposure.'}
                        {expandedChart === 'drawdown' && 'Peak-to-trough decline showing risk and recovery periods. Measures worst-case scenarios and your strategy\'s bounce-back ability.'}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              
              <div className="h-[60vh]">
                {expandedChart === 'equity' && (
                  <AnimatedLineChart
                    data={equityData}
                    title=""
                    subtitle=""
                    icon={LineChart}
                    showBenchmark={true}
                    gradientId="equityGradient"
                  />
                )}
                {expandedChart === 'returns' && (
                  <AnimatedBarChart
                    data={monthlyReturns}
                    title=""
                    subtitle=""
                    icon={BarChart3}
                  />
                )}
                {expandedChart === 'distribution' && (
                  <AnimatedPieChart
                    data={tradeDistribution}
                    title=""
                    subtitle=""
                    icon={PieChart}
                  />
                )}
                {expandedChart === 'drawdown' && (
                  <DrawdownChart
                    data={drawdownData}
                    title=""
                    subtitle=""
                    icon={DrawdownIcon}
                  />
                )}
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {!expandedChart && <Separator className="my-8" />}

      {/* Enhanced Export Section */}
      {!expandedChart && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.0 }}
        >
          <Card className="shadow-lg border-primary/20 hover:shadow-xl transition-shadow duration-300">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.1 }}
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
                transition={{ delay: 2.2 }}
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
      )}
    </motion.div>
  );
}