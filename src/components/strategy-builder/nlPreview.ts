import { StrategyState, Rule } from './correlation';
import { Strategy as StrategyConfig, IndicatorConfig } from '@/types/botforge';

export function previewStrategy(
  state: StrategyState, 
  strategy: StrategyConfig, 
  indicators: IndicatorConfig[]
): string {
  const rules = state.ruleGroup?.rules || [];
  
  if (rules.length === 0) {
    return `${strategy.name} strategy with default entry conditions.`;
  }

  const ruleTexts = rules.map(rule => {
    const leftText = formatOperand(rule.left);
    const rightText = formatOperand(rule.right);
    const operatorText = formatOperator(rule.operator);
    
    return `${leftText} ${operatorText} ${rightText}`;
  });

  const direction = state.direction || 'long';
  const connector = ruleTexts.length > 1 ? ' and ' : '';
  
  return `${direction.charAt(0).toUpperCase() + direction.slice(1)} when ${ruleTexts.join(connector)}.`;
}

function formatOperand(operand: any): string {
  if (typeof operand === 'string') return operand;
  if (typeof operand === 'number') return String(operand);
  if (operand?.kind === 'price.close') return 'Close';
  if (operand?.kind === 'price.open') return 'Open';
  if (operand?.kind === 'price.high') return 'High';
  if (operand?.kind === 'price.low') return 'Low';
  if (operand?.kind === 'constant.number') return String(operand.value ?? '?');
  if (operand?.indicatorId) {
    const label = operand.indicatorId;
    return operand?.path ? `${label} (${operand.path})` : label;
  }
  return 'Value';
}

function formatOperator(operator: string): string {
  const operatorMap: Record<string, string> = {
    'crosses_above': 'crosses above',
    'crosses_below': 'crosses below',
    'is_above': 'is above',
    'is_below': 'is below',
    'is_true': 'is true',
    'rising': 'is rising',
    'falling': 'is falling',
    'within': 'is within',
    'outside': 'is outside',
  };
  
  return operatorMap[operator] || operator;
}