import { RuleGroup, Operator, OperandKind, StrategyConfig } from './types';

const RULE_CAP = 5;
const NUMERIC: OperandKind[] = [
  'price.close','price.open','price.high','price.low',
  'constant.number','indicator.value','indicator.band.upper','indicator.band.lower'
];

export function validateRuleGroup(g: RuleGroup, strategy: StrategyConfig): string[] {
  const errors: string[] = [];
  if (!g) return ['No rules configured'];
  if (g.rules.length > RULE_CAP) errors.push(`Max ${RULE_CAP} rules allowed.`);
  const allowed = new Set(strategy.allowedOperators);
  for (const r of g.rules) {
    if (!allowed.has(r.operator as Operator)) errors.push(`Operator ${r.operator} not allowed for ${strategy.label}.`);
    if (!NUMERIC.includes(r.left.kind) || !NUMERIC.includes(r.right.kind)) errors.push('Operands must be numeric-like.');
  }
  return errors;
}