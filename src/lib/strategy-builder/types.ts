export type Direction = 'long' | 'short';
export type Joiner = 'AND' | 'OR';
export type Operator =
  | '>'
  | '>='
  | '<'
  | '<='
  | '=='
  | 'crosses_above'
  | 'crosses_below'
  | 'rising'
  | 'falling'
  | 'within'      // e.g., within a band
  | 'outside';

export type OperandKind =
  | 'price.close'
  | 'price.open'
  | 'price.high'
  | 'price.low'
  | 'constant.number'
  | 'indicator.value'
  | 'indicator.band.upper'
  | 'indicator.band.lower';

export interface OperandRef {
  kind: OperandKind;
  indicatorId?: string;     // when kind starts with indicator.*
  path?: string;            // e.g. "ema.20", "bb.upper", "macd.hist"
  value?: number;           // when constant.number
}

export interface Rule {
  id: string;
  left: OperandRef;
  operator: Operator;
  right: OperandRef;
}

export interface RuleGroup {
  joiner: Joiner;          // AND/OR across rules
  rules: Rule[];           // cap = 5
}

export interface IndicatorConfig {
  id: string;              // e.g., "ema", "rsi"
  label: string;
  blurb: string;           // tooltip
  params: Record<string, { type: 'int'|'float'|'bool'|'enum'; default: number|boolean|string; min?: number; max?: number; options?: string[] }>;
  outputs: string[];       // e.g., ["value"], or ["upper","lower"] for bands, or ["line","signal","hist"]
}

export interface StrategyConfig {
  id: string;              // e.g., "ema_crossover_pro"
  label: string;
  blurb: string;           // tooltip
  directionDefault: Direction; // default "long"
  allowedIndicators: string[]; // indicator ids
  allowedOperators: Operator[];
  defaultIndicatorParams?: Record<string, Record<string, number|boolean|string>>;
  exitDefaults?: { useATRStop?: boolean; atrMult?: number; trailingTPPct?: number; hardTPPct?: number };
}

export interface StrategyState {
  strategyId: string;
  direction: Direction;
  indicatorParams: Record<string, Record<string, number|boolean|string>>;
  ruleGroup: RuleGroup; // rules start empty
}

export interface BuilderProgress {
  step1_saved: boolean;
  step2_saved: boolean;
  step3_saved: boolean;
  step4_saved: boolean;
  step5_saved: boolean;
}

export interface PythonExportPayload {
  strategy: StrategyState;
  resolved: {
    strategy: StrategyConfig;
    indicators: IndicatorConfig[];
  };
}