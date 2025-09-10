export type DesignIntent = "Breakout" | "Pullback" | "Filter" | "Momentum" | "MeanReversion";
export type RiskProfile = "Conservative" | "Balanced" | "Aggressive";

export interface PresetMeta {
  id: string;
  name: string;
  presetTier: "Normal" | "Hero";
  designIntent: DesignIntent;
  riskProfile: RiskProfile;
}

export interface IndicatorMeta {
  id: string;
  label: string;
  category: "Trend" | "Momentum" | "Volatility" | "Volume" | "Other";
  tier: "CORE" | "PRO";
  tags: string[];
  presets: PresetMeta[];
}

export interface Catalog {
  indicators: IndicatorMeta[];
  allDesignIntents: DesignIntent[];
  allCategories: IndicatorMeta["category"][];
}