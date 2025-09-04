import type { StrategyConfig, Rule } from './types';

export function templatesForIndicator(indicatorId: string, strategy: StrategyConfig): Rule[] {
  const id = indicatorId;
  const mk = (left:any, op:any, right:any): Rule => ({ id: crypto.randomUUID?.() ?? Math.random().toString(36), left, operator: op, right });

  switch (id) {
    case 'ema':
      return [
        mk({kind:'indicator.value', indicatorId:'ema', path:'fast'}, 'crosses_above', {kind:'indicator.value', indicatorId:'ema', path:'slow'}),
        mk({kind:'price.close'}, '>', {kind:'indicator.value', indicatorId:'ema', path:'20'}),
      ];
    case 'rsi':
      return [
        mk({kind:'indicator.value', indicatorId:'rsi', path:'value'}, '>', {kind:'constant.number', value:55}),
        mk({kind:'indicator.value', indicatorId:'rsi', path:'value'}, 'crosses_above', {kind:'constant.number', value:50}),
      ];
    case 'bb':
      return [
        mk({kind:'price.close'}, 'within', {kind:'indicator.band.upper', indicatorId:'bb', path:'upper'}),
      ];
    case 'macd':
      return [
        mk({kind:'indicator.value', indicatorId:'macd', path:'line'}, 'crosses_above', {kind:'indicator.value', indicatorId:'macd', path:'signal'}),
      ];
    default:
      return [];
  }
}