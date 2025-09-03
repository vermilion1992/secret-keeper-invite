// Re-export types from the main types file for backward compatibility
export type { 
  Strategy as StrategyConfig, 
  IndicatorConfig, 
  UserTier,
  MarketType,
  PairTemplate,
  Timeframe,
  RiskManagement,
  BacktestParams,
  BacktestResult
} from '@/types/botforge';

export interface Rule {
  id: string;
  operator: string;
  left: any;
  right: any;
}

export interface StrategyState {
  strategyId?: string;
  direction?: string;
  indicatorParams?: Record<string, any>;
  ruleGroup?: {
    rules: Rule[];
  };
}