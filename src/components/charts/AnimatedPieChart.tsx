import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon, Info } from 'lucide-react';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface AnimatedPieChartProps {
  data: PieChartData[];
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

export function AnimatedPieChart({ data, title, subtitle, icon: Icon }: AnimatedPieChartProps) {
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toFixed(1)}% of trades
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
                      <p className="max-w-xs">Shows the breakdown of trades by outcome size. Helps you see if the strategy wins with many small gains, a few big winners, or suffers from large losses.</p>
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
              {(data[0]?.value + data[1]?.value || 0).toFixed(1)}% total wins
            </Badge>
            <p className="text-sm text-muted-foreground">
              Overall Win Rate
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <motion.div
            className="h-[300px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={data}
                   cx="50%"
                   cy="45%"
                   outerRadius={85}
                   innerRadius={35}
                   paddingAngle={2}
                   dataKey="value"
                   animationBegin={0}
                   animationDuration={1000}
                 >
                   {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip content={renderCustomTooltip} />
                 <Legend 
                   verticalAlign="bottom" 
                   height={60}
                   wrapperStyle={{
                     paddingTop: '10px',
                     fontSize: '12px',
                     lineHeight: '1.2'
                   }}
                   formatter={(value, entry: any) => (
                     <span style={{ color: entry.color, fontSize: '11px' }}>{value}</span>
                   )}
                   layout="horizontal"
                   align="center"
                 />
               </PieChart>
             </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}