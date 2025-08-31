import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommandLineIcon, ArrowDownTrayIcon, ShareIcon, ArrowTrendingUpIcon, CalendarIcon, CogIcon } from '@heroicons/react/24/outline';

const MyBots = () => {
  // Mock user bots data
  const userBots = [
    {
      id: '1',
      name: 'My Golden Cross',
      strategy: 'EMA Crossover Pro',
      marketType: 'spot',
      pairTemplate: 'top10',
      roi: 45.3,
      sharpe: 1.8,
      createdAt: '2024-08-25',
      status: 'backtested',
      isShared: true
    },
    {
      id: '2',
      name: 'Scalping Bot v2',
      strategy: 'RSI Mean Reversion',
      marketType: 'perps',
      pairTemplate: 'top30',
      roi: 23.7,
      sharpe: 1.2,
      createdAt: '2024-08-20',
      status: 'draft',
      isShared: false
    }
  ];

  const handleDownloadBot = (botId: string) => {
    // In real app, this would generate and download the .py file
    console.log('Downloading bot:', botId);
  };

  const handleShareBot = (botId: string) => {
    // In real app, this would share to community and reward +1 credit
    console.log('Sharing bot:', botId);
  };

  const handleEditBot = (botId: string) => {
    // In real app, this would open the bot in strategy builder
    console.log('Editing bot:', botId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <CommandLineIcon className="w-8 h-8 text-primary" />
                My Bots
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your created and downloaded trading bots
              </p>
            </div>
            <Button size="lg" className="flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5" />
              Create New Bot
            </Button>
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
                  <CommandLineIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userBots.length}</p>
                  <p className="text-sm text-muted-foreground">Total Bots</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/20 rounded-full">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">+34.5%</p>
                  <p className="text-sm text-muted-foreground">Avg ROI</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <ShareIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Shared</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <ArrowDownTrayIcon className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bots List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Trading Bots</CardTitle>
            <CardDescription>
              Download Python files or edit your bot configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userBots.length === 0 ? (
              <div className="text-center py-12">
                <CommandLineIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bots yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first trading bot to get started
                </p>
                <Button>Create Your First Bot</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userBots.map((bot) => (
                  <div
                    key={bot.id}
                    className="flex items-center gap-4 p-6 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    {/* Bot Icon & Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <CommandLineIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{bot.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{bot.strategy}</span>
                            <span>•</span>
                            <span>{bot.marketType.toUpperCase()}</span>
                            <span>•</span>
                            <span>{bot.pairTemplate.replace(/(\d+)/, ' $1').toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={bot.status === 'backtested' ? 'default' : 'secondary'}
                        >
                          {bot.status}
                        </Badge>
                        {bot.isShared && (
                          <Badge variant="outline" className="border-success text-success">
                            Shared (+1 Credit)
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(bot.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    {bot.status === 'backtested' && (
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className={`font-semibold ${bot.roi > 0 ? 'text-success' : 'text-destructive'}`}>
                            {bot.roi > 0 ? '+' : ''}{bot.roi}%
                          </p>
                          <p className="text-muted-foreground">ROI</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">{bot.sharpe}</p>
                          <p className="text-muted-foreground">Sharpe</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBot(bot.id)}
                        className="flex items-center gap-1"
                      >
                        <CogIcon className="w-4 h-4" />
                        Edit
                      </Button>
                      
                      {bot.status === 'backtested' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleDownloadBot(bot.id)}
                            className="flex items-center gap-1"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Download .py
                          </Button>
                          
                          {!bot.isShared && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShareBot(bot.id)}
                              className="flex items-center gap-1"
                            >
                              <ShareIcon className="w-4 h-4" />
                              Share (+1 Credit)
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyBots;