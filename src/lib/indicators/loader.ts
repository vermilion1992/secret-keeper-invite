/**
 * Loader for indicator metadata from JSON files
 */

interface IndicatorPreset {
  id: string;
  label: string;
  blurb: string;
  designIntent: string;
  riskProfile: string;
  badges: string[];
  tags: string[];
  isHero?: boolean;
  seedParams: Record<string, any>;
  rules: any;
  riskDefaults: Record<string, any>;
}

interface IndicatorMetadata {
  id: string;
  label: string;
  blurb: string;
  tags?: string[];
  presets: IndicatorPreset[];
}

interface LoadedIndicator {
  indicator: IndicatorMetadata;
  presets: IndicatorPreset[];
}

/**
 * Load RSI indicator metadata
 */
export async function loadRSIIndicator(): Promise<LoadedIndicator | null> {
  try {
    // Import RSI metadata statically
    const rsiMeta = await import('@/indicators/rsi/meta.json');
    
    const indicator: IndicatorMetadata = {
      id: rsiMeta.id,
      label: rsiMeta.label,
      blurb: rsiMeta.blurb,
      tags: rsiMeta.tags,
      presets: rsiMeta.presets || []
    };

    return {
      indicator,
      presets: indicator.presets
    };
  } catch (error) {
    console.error('Failed to load RSI indicator:', error);
    return null;
  }
}