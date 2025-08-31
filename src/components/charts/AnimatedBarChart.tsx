import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface AnimatedBarChartProps {
  data: Array<{
    month: string;
    return: number;
    trades?: number;
  }>;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<any>;
}

export function AnimatedBarChart({ data, title, subtitle, icon: Icon }: AnimatedBarChartProps) {
  const avgReturn = data.reduce((sum, item) => sum + item.return, 0) / data.length;
  const positiveMonths = data.filter(item => item.return > 0).length;
  const winRate = (positiveMonths / data.length) * 100;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-lg p-3 shadow-lg"
        >
          <p className="font-medium text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">Return:</span>
              <span className={`font-medium ${data.return >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {data.return > 0 ? '+' : ''}{data.return}%
              </span>
            </div>
            {data.trades && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Trades:</span>
                <span className="font-medium">{data.trades}</span>
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const getBarColor = (value: number) => {
    if (value >= 5) return 'hsl(var(--chart-2))'; // Green for good performance
    if (value >= 0) return 'hsl(var(--chart-1))'; // Light green for positive
    if (value >= -5) return 'hsl(var(--chart-4))'; // Orange for small loss
    return 'hsl(var(--destructive))'; // Red for significant loss
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-card via-card to-card/50 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold leading-none">{title}</CardTitle>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Shows percentage profit or loss each month. A quick way to spot hot streaks, losing periods, and seasonal effects in your strategy.</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-2 ml-13">{subtitle}</p>
          )}
          <div className="flex items-center justify-between mt-2 ml-13">
            <Badge variant="outline" className="text-xs">
              {positiveMonths}/{data.length} positive
            </Badge>
            <p className="text-sm text-muted-foreground">
              Avg: {avgReturn > 0 ? '+' : ''}{avgReturn.toFixed(1)}%
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  className="opacity-30" 
                />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  y={0} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="2 2" 
                  strokeOpacity={0.7}
                />
                <Bar 
                  dataKey="return" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.return >= 0 ? 'url(#positiveGradient)' : 'url(#negativeGradient)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}