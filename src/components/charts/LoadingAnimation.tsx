import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

export function ChartLoadingAnimation() {
  return (
    <Card className="h-[400px] flex items-center justify-center">
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative">
          {/* Animated chart bars */}
          <div className="flex items-end space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="w-3 bg-gradient-to-t from-primary/60 to-primary rounded-t-sm"
                initial={{ height: 20 }}
                animate={{ 
                  height: [20, 40, 30, 50, 35],
                  opacity: [0.4, 1, 0.6, 1, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          {/* Floating data points */}
          <motion.div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2"
            animate={{ 
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-2 h-2 rounded-full bg-primary" />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm font-medium text-muted-foreground">
            Analyzing performance data...
          </p>
          <motion.div
            className="flex justify-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full bg-primary"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}

export function MetricLoadingAnimation() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            className="w-12 h-12 rounded-xl bg-muted"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="w-16 h-5 bg-muted rounded"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.3
            }}
          />
        </div>
        
        <div className="space-y-2">
          <motion.div
            className="w-20 h-4 bg-muted rounded"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.6
            }}
          />
          <motion.div
            className="w-16 h-6 bg-muted rounded"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 0.9
            }}
          />
          <motion.div
            className="w-24 h-3 bg-muted rounded"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: 1.2
            }}
          />
        </div>
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </CardContent>
    </Card>
  );
}