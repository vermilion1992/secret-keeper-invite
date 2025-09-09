import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Catalog, IndicatorMeta, DesignIntent, IndicatorCategory, PresetMeta } from '@/types/indicator-catalog';

interface IndicatorCatalogStore {
  catalog: Catalog | null;
  isLoaded: boolean;
  error: string | null;
  toastShown: boolean;
  loadCatalog: () => Promise<void>;
  setToastShown: () => void;
}

// Available indicators to scan
const AVAILABLE_INDICATORS = [
  'atr', 'dema', 'ema', 'hma', 'kama', 'macd', 'rsi', 'sma', 'tema', 'vwma', 'wma'
];

const VALID_DESIGN_INTENTS: DesignIntent[] = [
  "Breakout", "Pullback", "Filter", "Momentum", "MeanReversion"
];

const VALID_CATEGORIES: IndicatorCategory[] = [
  "Trend", "Momentum", "Volatility", "Volume", "Other"
];

/**
 * Validate a single preset for required fields and enum values
 */
function validatePreset(preset: any, indicatorId: string): PresetMeta | null {
  try {
    if (!preset.id || !preset.name || !preset.designIntent || !preset.riskProfile) {
      console.warn(`Preset missing required fields in ${indicatorId}:`, preset.id);
      return null;
    }

    if (!VALID_DESIGN_INTENTS.includes(preset.designIntent)) {
      console.warn(`Invalid designIntent "${preset.designIntent}" in ${indicatorId}:${preset.id}`);
      return null;
    }

    if (!["Conservative", "Balanced", "Aggressive"].includes(preset.riskProfile)) {
      console.warn(`Invalid riskProfile "${preset.riskProfile}" in ${indicatorId}:${preset.id}`);
      return null;
    }

    return {
      id: preset.id,
      name: preset.name,
      presetTier: preset.presetTier || "Normal",
      designIntent: preset.designIntent,
      riskProfile: preset.riskProfile,
      ...preset // Include all other properties
    };
  } catch (error) {
    console.warn(`Error validating preset in ${indicatorId}:`, error);
    return null;
  }
}

/**
 * Load and validate a single indicator
 */
async function loadIndicator(indicatorId: string): Promise<IndicatorMeta | null> {
  try {
    const meta = await import(`@/indicators/${indicatorId}/meta.json`);
    
    // Validate structure
    if (!meta.identity?.id || !meta.identity?.label || !meta.identity?.category) {
      console.warn(`Invalid structure in ${indicatorId}/meta.json`);
      return null;
    }

    // Validate folder name matches identity.id
    if (meta.identity.id !== indicatorId) {
      console.warn(`Folder name "${indicatorId}" doesn't match identity.id "${meta.identity.id}"`);
      return null;
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(meta.identity.category)) {
      console.warn(`Invalid category "${meta.identity.category}" in ${indicatorId}`);
      return null;
    }

    // Validate and filter presets
    const validPresets: PresetMeta[] = [];
    if (meta.presets && Array.isArray(meta.presets)) {
      for (const preset of meta.presets) {
        const validPreset = validatePreset(preset, indicatorId);
        if (validPreset) {
          validPresets.push(validPreset);
        }
      }
    }

    return {
      id: meta.identity.id,
      label: meta.identity.label,
      category: meta.identity.category,
      tier: meta.identity.tier || "CORE",
      tags: meta.identity.tags || [],
      presets: validPresets,
      blurb: meta.docs?.blurb
    };
  } catch (error) {
    console.warn(`Failed to load ${indicatorId}:`, error);
    return null;
  }
}

/**
 * Build the catalog by scanning all available indicators
 */
async function buildCatalog(): Promise<Catalog> {
  const indicators: IndicatorMeta[] = [];
  
  // Load all indicators in parallel
  const results = await Promise.allSettled(
    AVAILABLE_INDICATORS.map(id => loadIndicator(id))
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      indicators.push(result.value);
    } else {
      console.warn(`Failed to load indicator ${AVAILABLE_INDICATORS[index]}`);
    }
  });

  // Derive unique design intents and categories from loaded data
  const allDesignIntents = new Set<DesignIntent>();
  const allCategories = new Set<IndicatorCategory>();

  indicators.forEach(indicator => {
    allCategories.add(indicator.category);
    indicator.presets.forEach(preset => {
      allDesignIntents.add(preset.designIntent);
    });
  });

  return {
    indicators,
    allDesignIntents: Array.from(allDesignIntents).sort(),
    allCategories: Array.from(allCategories).sort()
  };
}

export const useIndicatorCatalog = create<IndicatorCatalogStore>()(
  persist(
    (set, get) => ({
      catalog: null,
      isLoaded: false,
      error: null,
      toastShown: false,

      loadCatalog: async () => {
        try {
          set({ error: null });
          const catalog = await buildCatalog();
          set({ catalog, isLoaded: true });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load indicator catalog';
          set({ error: errorMessage, isLoaded: true });
          console.error('Error loading indicator catalog:', error);
        }
      },

      setToastShown: () => set({ toastShown: true })
    }),
    {
      name: 'indicator-catalog-storage',
      partialize: (state) => ({ 
        toastShown: state.toastShown 
      })
    }
  )
);