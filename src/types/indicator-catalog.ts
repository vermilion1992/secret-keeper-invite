export type DesignIntent = "Breakout" | "Pullback" | "Filter" | "Momentum" | "MeanReversion";
export type RiskProfile = "Conservative" | "Balanced" | "Aggressive";
export type IndicatorCategory = "Trend" | "Momentum" | "Volatility" | "Volume" | "Other";
export type IndicatorTier = "CORE" | "PRO";

export interface PresetMeta {
  id: string;
  name: string;
  presetTier: "Normal" | "Hero";
  designIntent: DesignIntent;
  riskProfile: RiskProfile;
  [key: string]: any; // Allow additional properties from meta.json
}

export interface IndicatorMeta {
  id: string;
  label: string;
  category: IndicatorCategory;
  tier: IndicatorTier;
  tags: string[];
  presets: PresetMeta[];
  blurb?: string;
}

export interface Catalog {
  indicators: IndicatorMeta[];
  allDesignIntents: DesignIntent[];
  allCategories: IndicatorCategory[];
}

export interface FilterState {
  intents: DesignIntent[];
  categories: IndicatorCategory[];
}