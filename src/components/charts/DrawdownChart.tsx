import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface DrawdownData {
  date: string;
  drawdown: number;
}

interface DrawdownChartProps {
  data: DrawdownData[];
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

export function DrawdownChart({ data, title, subtitle, icon: Icon }: DrawdownChartProps) {
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-red-500">
            Drawdown: {payload[0].value.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-0 bg-gradient-to-br from-card via-card to-card/50 h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/20 flex items-center justify-center shadow-lg">
                <Icon className="w-5 h-5 text-red-500" />
              </div>
            )}
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold leading-none">{title}</CardTitle>
            </div>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-2 ml-13">{subtitle}</p>
          )}
          <div className="flex items-center justify-between mt-2 ml-13">
            <Badge variant="destructive" className="text-xs">
              Max: -8.2%
            </Badge>
            <p className="text-sm text-muted-foreground">
              Drawdown
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <motion.div
            className="h-[320px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeOpacity={0.3}
                />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  domain={['dataMin', 0]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={renderCustomTooltip} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
                <Line
                  type="monotone"
                  dataKey="drawdown"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={3}
                  fill="url(#drawdownGradient)"
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    stroke: 'hsl(var(--chart-2))',
                    strokeWidth: 2,
                    fill: 'hsl(var(--background))'
                  }}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}