export type Direction = 'long' | 'short';
export type Joiner = 'AND' | 'OR';
export type Operator =
  | '>' | '>=' | '<' | '<=' | '==' 
  | 'crosses_above' | 'crosses_below'
  | 'rising' | 'falling' | 'within' | 'outside';

export type OperandKind =
  | 'price.close' | 'price.open' | 'price.high' | 'price.low'
  | 'constant.number'
  | 'indicator.value' | 'indicator.band.upper' | 'indicator.band.lower';

export interface OperandRef {
  kind: OperandKind;
  indicatorId?: string; // for indicator.*
  path?: string;        // e.g. "20", "line", "signal", "upper"
  value?: number;       // for constant.number
}

export interface Rule {
  id: string;
  left: OperandRef;
  operator: Operator;
  right: OperandRef;
}

export interface RuleGroup {
  joiner: Joiner;
  rules: Rule[]; // max 5
}

export interface IndicatorConfig {
  id: string;
  label: string;
  blurb: string;
  params: Record<string, { type: 'int'|'float'|'bool'|'enum'; default: number|boolean|string; min?: number; max?: number; options?: string[] }>;
  outputs: string[];
}

export interface StrategyConfig {
  id: string;
  label: string;
  blurb: string;
  directionDefault: Direction;
  allowedIndicators: string[];
  allowedOperators: Operator[];
  defaultIndicatorParams?: Record<string, Record<string, number|boolean|string>>;
  exitDefaults?: { useATRStop?: boolean; atrMult?: number; trailingTPPct?: number; hardTPPct?: number };
}

export interface StrategyState {
  strategyId: string; // may be id or label; resolver will canonicalize
  direction: Direction;
  indicatorParams: Record<string, Record<string, number|boolean|string>>;
  ruleGroup: RuleGroup;
  metadata?: {
    indicatorId?: string;
    indicatorLabel?: string;
    presetId?: string | null;
    presetLabel?: string;
    riskDefaults?: Record<string, any>;
    riskTemplates?: Record<string, any>;
    params?: Record<string, any>;
    seedParams?: Record<string, any>;
    designIntent?: string;
    riskProfile?: string;
  };
}

export interface PythonExportPayload {
  strategy: StrategyState;
  resolved: {
    strategy: StrategyConfig;
    indicators: IndicatorConfig[];
  };
}