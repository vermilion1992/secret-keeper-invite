import { StrategyConfig, IndicatorConfig } from './types';

// Load JSON at runtime
export async function loadConfigs(): Promise<{ strategies: StrategyConfig[]; indicators: IndicatorConfig[] }> {
  const res = await fetch('/botforge_combined_config.json', { cache: 'no-store' });
  return res.json();
}

export function getStrategy(strategies: StrategyConfig[], id: string) {
  const s = strategies.find(x => x.id === id);
  if (!s) throw new Error(`Strategy not found: ${id}`);
  return s;
}

export function filterIndicators(indicators: IndicatorConfig[], allowedIds: string[]) {
  return indicators.filter(x => allowedIds.includes(x.id));
}