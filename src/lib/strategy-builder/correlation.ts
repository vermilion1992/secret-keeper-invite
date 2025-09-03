import { StrategyConfig, IndicatorConfig } from './types';

function normalize(x: string) {
  return (x || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/\s+/g, '_');
}

export async function loadConfigs(): Promise<{ strategies: StrategyConfig[]; indicators: IndicatorConfig[] }> {
  const bust = Date.now();
  const res = await fetch(`/botforge_combined_config.json?v=${bust}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load config JSON: ${res.status}`);
  return res.json();
}

function resolveStrategyId(input: string, strategies: StrategyConfig[]): string | undefined {
  // 1) exact id
  if (strategies.some(s => s.id === input)) return input;

  // 2) by normalized label
  const norm = normalize(input);
  const byLabel = strategies.find(s => normalize(s.label) === norm);
  if (byLabel) return byLabel.id;

  return undefined;
}

export function getStrategy(strategies: StrategyConfig[], idOrLabel: string) {
  const resolvedId = resolveStrategyId(idOrLabel, strategies);
  if (!resolvedId) {
    const ids = strategies.map(s => s.id).join(', ');
    throw new Error(`Strategy not found: "${idOrLabel}". Available ids: ${ids}`);
  }
  const s = strategies.find(x => x.id === resolvedId)!;
  return s;
}

export function filterIndicators(indicators: IndicatorConfig[], allowedIds: string[]) {
  return indicators.filter(x => allowedIds.includes(x.id));
}