// Global BotForge Configuration Store
interface BFConfig {
  global: {
    ruleCap: number;
    operators: Array<{
      key: string;
      label: string;
      tooltip: string;
    }>;
    combiners: Array<{
      key: string;
      label: string;
      tooltip: string;
    }>;
    directions: Array<{
      key: string;
      label: string;
    }>;
    tooltips: Record<string, string>;
    blurbs: Record<string, string>;
  };
  strategies: Record<string, {
    indicatorSettings: Record<string, {
      fields: string[];
    }>;
    tiles: string[];
    operands: Record<string, string[]>;
    defaultSeeds: Array<{
      lhs: string;
      op: string;
      rhs: string | number;
    }>;
  }>;
  operandLabels: Record<string, string>;
  indicatorLabels: Record<string, string>;
}

let BF_CONFIG: BFConfig | null = null;

export const loadBFConfig = async (): Promise<BFConfig> => {
  if (BF_CONFIG) return BF_CONFIG;
  
  try {
    const response = await fetch('/botforge_combined_config.json');
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`);
    }
    BF_CONFIG = await response.json();
    return BF_CONFIG;
  } catch (error) {
    console.error('Failed to load BotForge config:', error);
    throw error;
  }
};

export const getBFConfig = (): BFConfig => {
  if (!BF_CONFIG) {
    throw new Error('BF_CONFIG not loaded. Call loadBFConfig() first.');
  }
  return BF_CONFIG;
};

export const getStrategyConfig = (strategyKey: string) => {
  const config = getBFConfig();
  return config.strategies[strategyKey];
};

export type { BFConfig };