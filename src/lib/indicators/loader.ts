/**
 * Loader for indicator metadata from JSON files
 */

interface IndicatorPreset {
  id: string;
  name: string;
  presetTier: string;
  riskProfile: string;
  designIntent: string;
  [key: string]: any; // Allow additional properties from meta.json
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
    const meta = rsiMeta;
    
    const indicator: IndicatorMetadata = {
      id: meta.identity.id,
      label: meta.identity.label,
      blurb: meta.docs.blurb,
      tags: meta.identity.tags,
      presets: meta.presets || []
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