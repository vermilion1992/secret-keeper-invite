import { ALIASES, FALLBACK_CONFIG, normalize } from './configFallback';
import type { StrategyConfig, IndicatorConfig } from './types';

function shapeOK(data:any) { return data && Array.isArray(data.strategies) && Array.isArray(data.indicators); }

async function tryFetch(path:string) {
  try {
    const res = await fetch(`${path}?v=${Date.now()}`, { cache:'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return shapeOK(json) ? json : null;
  } catch { return null; }
}

export async function loadConfigs(): Promise<{ strategies: StrategyConfig[]; indicators: IndicatorConfig[] }> {
  // Try public JSON(s), then fall back to compiled defaults
  const fromMain = await tryFetch('/botforge_combined_config.json');
  const fromAlt  = await tryFetch('/botforge_config.json');
  const data = fromMain || fromAlt || FALLBACK_CONFIG;

  const strategies: StrategyConfig[] = data.strategies as any;
  const indicators: IndicatorConfig[] = data.indicators as any;

  return { strategies, indicators };
}

function resolveStrategyId(input: string, strategies: StrategyConfig[]): string | undefined {
  if (!input) return undefined;

  // 1) exact id
  if (strategies.some(s => s.id === input)) return input;

  // 2) alias by normalized label
  const aliased = ALIASES[normalize(input)];
  if (aliased && strategies.some(s => s.id === aliased)) return aliased;

  // 3) exact label
  const byLabel = strategies.find(s => s.label === input);
  if (byLabel) return byLabel.id;

  // 4) normalized label
  const norm = normalize(input);
  const byNormLabel = strategies.find(s => normalize(s.label) === norm);
  if (byNormLabel) return byNormLabel.id;

  // 5) normalized id contains
  const byContains = strategies.find(s => normalize(s.id).includes(norm));
  if (byContains) return byContains.id;

  return undefined;
}

export function getStrategy(strategies: StrategyConfig[], idOrLabel: string) {
  const resolvedId = resolveStrategyId(idOrLabel, strategies);
  if (!resolvedId) {
    const ids = strategies.map(s => s.id).join(', ');
    throw new Error(`Strategy not found: "${idOrLabel}". Available: ${ids}`);
  }
  return strategies.find(s => s.id === resolvedId)!;
}

export function filterIndicators(indicators: IndicatorConfig[], allowedIds: string[]) {
  return indicators.filter(x => allowedIds.includes(x.id));
}