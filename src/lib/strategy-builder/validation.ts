import { RuleGroup, Operator, OperandKind, StrategyConfig } from './types';

const RULE_CAP = 5;

export function validateRuleGroup(g: RuleGroup, strategy: StrategyConfig): string[] {
  const errors: string[] = [];
  if (!g) return ['No rules configured'];
  if (g.rules.length > RULE_CAP) errors.push(`Max ${RULE_CAP} rules allowed.`);

  const allowedOps = new Set(strategy.allowedOperators);
  for (const r of g.rules) {
    if (!allowedOps.has(r.operator as Operator)) {
      errors.push(`Operator ${r.operator} not allowed for this strategy.`);
    }
    // Type compatibility checks
    const L = r.left.kind, R = r.right.kind;
    const numericKinds: OperandKind[] = ['price.close','price.open','price.high','price.low','constant.number','indicator.value','indicator.band.upper','indicator.band.lower'];
    const isNumL = numericKinds.includes(L), isNumR = numericKinds.includes(R);
    if (!isNumL || !isNumR) errors.push('Operands must be numeric-like for this operator.');
  }
  return errors;
}