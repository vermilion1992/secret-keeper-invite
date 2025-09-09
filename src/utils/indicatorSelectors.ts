import type { Catalog, IndicatorMeta, DesignIntent, IndicatorCategory, PresetMeta } from '@/types/indicator-catalog';

/**
 * Filter indicators by selected design intents and categories
 */
export const selectIndicatorsByFilters = (
  catalog: Catalog,
  intents: DesignIntent[],
  categories: IndicatorCategory[]
) => {
  const byIntent = (indicator: IndicatorMeta) =>
    intents.length === 0 || indicator.presets.some(preset => intents.includes(preset.designIntent));
  
  const byCategory = (indicator: IndicatorMeta) =>
    categories.length === 0 || categories.includes(indicator.category);
  
  return catalog.indicators.filter(indicator => byIntent(indicator) && byCategory(indicator));
};

/**
 * Filter presets by selected design intents
 */
export const selectPresetsByIntent = (
  indicator: IndicatorMeta,
  intents: DesignIntent[]
) => {
  return indicator.presets.filter(preset => 
    intents.length === 0 || intents.includes(preset.designIntent)
  );
};

/**
 * Get count of presets per design intent for an indicator
 */
export const getPresetCountsByIntent = (indicator: IndicatorMeta) => {
  const counts: Record<DesignIntent, number> = {
    Breakout: 0,
    Pullback: 0,
    Filter: 0,
    Momentum: 0,
    MeanReversion: 0
  };

  indicator.presets.forEach(preset => {
    counts[preset.designIntent] = (counts[preset.designIntent] || 0) + 1;
  });

  return counts;
};

/**
 * Get unique design intents present in an indicator's presets
 */
export const getIndicatorDesignIntents = (indicator: IndicatorMeta): DesignIntent[] => {
  const intents = new Set<DesignIntent>();
  indicator.presets.forEach(preset => intents.add(preset.designIntent));
  return Array.from(intents).sort();
};