import { StrategyConfig, StrategyState, IndicatorConfig } from './types';

export function previewStrategy(state: StrategyState, strategy: StrategyConfig, indicators: IndicatorConfig[]): string {
  const dir = state.direction ?? strategy.directionDefault ?? 'long';
  const rules = state.ruleGroup?.rules ?? [];
  const joiner = state.ruleGroup?.joiner ?? 'AND';

  const parts = rules.map(r => {
    const left = prettyRef(r.left, indicators);
    const right = prettyRef(r.right, indicators);
    return `${left} ${prettyOp(r.operator)} ${right}`;
  });

  const entry = parts.length
    ? `Enter ${dir.toUpperCase()} when ${parts.join(` ${joiner} `)}.`
    : `No entry rules yet. Add up to 5.`;

  const ex = strategy.exitDefaults || {};
  const exits: string[] = [];
  if (ex.useATRStop) exits.push(`Stop = ATR×${ex.atrMult ?? 2.0}`);
  if (ex.trailingTPPct) exits.push(`Trailing TP = ${ex.trailingTPPct}%`);
  if (ex.hardTPPct) exits.push(`Hard TP = ${ex.hardTPPct}%`);

  return `${entry} ${exits.length ? `Exits: ${exits.join('; ')}.` : ''} (No Heikin-Ashi.)`;
}

function prettyOp(op: string) {
  switch (op) {
    case 'crosses_above': return 'crosses above';
    case 'crosses_below': return 'crosses below';
    case 'rising': return 'is rising';
    case 'falling': return 'is falling';
    case 'within': return 'is within';
    case 'outside': return 'is outside';
    default: return op;
  }
}

function prettyRef(ref: any, indicators: IndicatorConfig[]): string {
  switch (ref?.kind) {
    case 'price.close': return 'Close';
    case 'price.open': return 'Open';
    case 'price.high': return 'High';
    case 'price.low': return 'Low';
    case 'constant.number': return String(ref?.value ?? '?');
    default: {
      const ind = indicators.find(i => i.id === ref?.indicatorId);
      const label = ind ? ind.label : (ref?.indicatorId ?? 'Indicator');
      return ref?.path ? `${label} (${ref.path})` : label;
    }
  }
}