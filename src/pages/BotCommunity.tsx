import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Star, Download, Share, TrendingUp, Users } from 'lucide-react';

const BotCommunity = () => {
  // Mock leaderboard data
  const leaderboardBots = [
    {
      id: '1',
      name: 'Golden Cross Master',
      author: 'CryptoTrader99',
      strategy: 'EMA Crossover Pro',
      roi: 157.3,
      sharpe: 2.4,
      downloads: 1247,
      rating: 4.8,
      tier: 'pro'
    },
    {
      id: '2',
      name: 'Volatility Hunter',
      author: 'AlgoWizard',
      strategy: 'ATR Trailing Stops',
      roi: 134.7,
      sharpe: 2.1,
      downloads: 892,
      rating: 4.6,
      tier: 'expert'
    },
    {
      id: '3',
      name: 'Scalping Beast',
      author: 'QuickProfit',
      strategy: 'RSI Mean Reversion',
      roi: 98.2,
      sharpe: 1.9,
      downloads: 654,
      rating: 4.4,
      tier: 'basic'
    }
  ];

  const handleCopyBot = (botId: string) => {
    // In real app, this would copy the bot configuration
    console.log('Copying bot:', botId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                Bot Community
              </h1>
              <p className="text-muted-foreground mt-2">
                Discover and share profitable trading strategies
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Share your bot</p>
              <p className="text-lg font-semibold text-primary">+1 Credit Reward</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-sm text-muted-foreground">Total Bots</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+127%</p>
                  <p className="text-sm text-muted-foreground">Avg ROI</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Download className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">25.3K</p>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <Star className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">4.6</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Performing Bots
            </CardTitle>
            <CardDescription>
              Community's highest rated and most profitable trading bots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboardBots.map((bot, index) => (
                <div
                  key={bot.id}
                  className="flex items-center gap-4 p-4 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-8 text-center">
                    {index === 0 && <Trophy className="w-6 h-6 text-yellow-500 mx-auto" />}
                    {index === 1 && <Trophy className="w-6 h-6 text-gray-400 mx-auto" />}
                    {index === 2 && <Trophy className="w-6 h-6 text-amber-600 mx-auto" />}
                    {index > 2 && <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>}
                  </div>

                  {/* Bot Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{bot.name}</h3>
                      <Badge variant={bot.tier === 'expert' ? 'default' : 'secondary'}>
                        {bot.tier.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Avatar className="w-5 h-5">
                          <AvatarFallback className="text-xs">
                            {bot.author.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{bot.author}</span>
                      </div>
                      <span>•</span>
                      <span>{bot.strategy}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{bot.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-success">+{bot.roi}%</p>
                      <p className="text-muted-foreground">ROI</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{bot.sharpe}</p>
                      <p className="text-muted-foreground">Sharpe</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{bot.downloads}</p>
                      <p className="text-muted-foreground">Downloads</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyBot(bot.id)}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button variant="outline" size="lg">
                Load More Bots
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BotCommunity;