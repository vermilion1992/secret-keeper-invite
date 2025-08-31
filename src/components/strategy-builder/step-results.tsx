import { useState } from 'react';
import { BacktestResult } from '@/types/botforge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Share2, TrendingUp, TrendingDown, Percent, Target } from 'lucide-react';

interface StepResultsProps {
  backtestResult: BacktestResult;
  onExport: (format: 'python' | 'json', botName: string) => void;
  onShare: (botName: string) => void;
}

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
  const result = mockResult; // Use mock data

  const metrics = [
    { label: 'ROI', value: `${result.roi}%`, icon: TrendingUp, positive: result.roi > 0 },
    { label: 'Sharpe Ratio', value: result.sharpe.toString(), icon: Target, positive: result.sharpe > 1 },
    { label: 'Max Drawdown', value: `${result.drawdown}%`, icon: TrendingDown, positive: result.drawdown > -15 },
    { label: 'Win Rate', value: `${result.winrate}%`, icon: Percent, positive: result.winrate > 60 },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">Backtest Results</h2>
        <p className="text-muted-foreground text-sm">
          Review your strategy's performance and save or export your bot.
        </p>
      </header>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                metric.positive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                <metric.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="font-semibold">{metric.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="p-6">
        <h3 className="font-medium mb-4">Performance Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Trades:</span>
            <span className="font-medium">{result.avgTrades}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profitable Trades:</span>
            <span className="font-medium">{Math.round(result.avgTrades * result.winrate / 100)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Risk-Adjusted Return:</span>
            <span className={`font-medium ${result.sharpe > 1 ? 'text-green-500' : 'text-red-500'}`}>
              {result.sharpe > 1 ? 'Good' : 'Poor'}
            </span>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Bot Naming & Export */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="botName" className="text-sm font-medium">Bot Name</Label>
          <Input
            id="botName"
            placeholder="My Awesome Trading Bot"
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => onExport('python', botName || 'Untitled Bot')} 
            disabled={!botName.trim()}
            variant="default"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export Python (.zip)
          </Button>
          
          <Button 
            onClick={() => onExport('json', botName || 'Untitled Bot')} 
            disabled={!botName.trim()}
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
          
          <Button 
            onClick={() => onShare(botName || 'Untitled Bot')} 
            disabled={!botName.trim()}
            variant="secondary"
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share to Community
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Sharing to community saves 1 credit • Python export includes strategy files and documentation
        </p>
      </div>
    </div>
  );
}