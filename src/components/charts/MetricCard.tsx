import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  positive: boolean;
  gradient: string;
  index: number;
}

export function MetricCard({ 
  label, 
  value, 
  subtext, 
  icon: Icon, 
  positive, 
  gradient, 
  index 
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
        {/* Animated background gradient */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        />
        
        {/* Subtle animated border */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 rounded-lg`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 4px, black 4px, black calc(100% - 4px), transparent calc(100% - 4px)), linear-gradient(to right, transparent 4px, black 4px, black calc(100% - 4px), transparent calc(100% - 4px))',
            maskComposite: 'intersect'
          }}
        />

        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between mb-4">
            <motion.div 
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
            >
              <Badge 
                variant={positive ? "default" : "destructive"} 
                className="text-xs transition-colors duration-300"
              >
                {positive ? "Good" : "Risk"}
              </Badge>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
          >
            <p className="text-sm text-muted-foreground font-medium mb-1 leading-tight">{label}</p>
            <motion.p 
              className="text-2xl font-bold mb-1 leading-tight"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: index * 0.1 + 0.6,
                type: "spring",
                stiffness: 200
              }}
            >
              {value}
            </motion.p>
            <p className="text-xs text-muted-foreground leading-tight line-clamp-2">{subtext}</p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}