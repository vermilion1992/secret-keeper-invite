import { create } from "zustand";
import type { Catalog, IndicatorMeta, PresetMeta, DesignIntent } from "./indicatorTypes";
import { FALLBACK } from "./indicatorCatalogFallback";

const INTENTS: DesignIntent[] = ["Breakout","Pullback","Filter","Momentum","MeanReversion"];

function toUnix(p: string) { return p.replace(/\\/g, "/"); }

function validateIndicator(path: string, data: any): IndicatorMeta | null {
  const p = toUnix(path);
  const parts = p.split("/");
  const ix = parts.lastIndexOf("indicators");
  const folder = ix >= 0 ? parts[ix + 1] : undefined;

  const id: string | undefined = data?.identity?.id;
  const label: string | undefined = data?.identity?.label;
  const category: any = data?.identity?.category;
  const tier: any = data?.identity?.tier;
  const tags: string[] = Array.isArray(data?.identity?.tags) ? data.identity.tags : (data?.tags ?? []);

  if (!id || !folder || id !== folder) {
    console.warn(`[catalog] skip: id/folder mismatch`, { path, id, folder });
    return null;
  }
  if (!label || !category || !tier) {
    console.warn(`[catalog] skip: missing identity fields`, { path, id, label, category, tier });
    return null;
  }

  const rawPresets: any[] = Array.isArray(data?.presets) ? data.presets : [];
  const presets: PresetMeta[] = rawPresets
    .map((p) => {
      const ok =
        p?.id && p?.name &&
        (p?.presetTier === "Normal" || p?.presetTier === "Hero") &&
        INTENTS.includes(p?.designIntent) &&
        ["Conservative","Balanced","Aggressive"].includes(p?.riskProfile);
      if (!ok) {
        console.warn(`[catalog] preset skipped`, { path, presetId: p?.id, reason: "invalid fields" });
        return null;
      }
      return {
        id: p.id,
        name: p.name,
        presetTier: p.presetTier,
        designIntent: p.designIntent,
        riskProfile: p.riskProfile
      } as PresetMeta;
    })
    .filter(Boolean) as PresetMeta[];

  if (presets.length === 0) {
    console.warn(`[catalog] skip: no valid presets`, { path, id });
    return null;
  }

  return {
    id,
    label,
    category,
    tier,
    tags,
    presets
  };
}

function buildCatalog(files: Record<string, any>): Catalog {
  const indicators: IndicatorMeta[] = [];
  for (const [path, mod] of Object.entries(files)) {
    // Vite glob with import: 'default' gives the JSON directly
    const data = mod as any;
    const ind = validateIndicator(path, data);
    if (ind) indicators.push(ind);
  }

  // Diagnostics
  const presetTotal = indicators.reduce((acc, i) => acc + i.presets.length, 0);
  console.info(`[catalog] loaded indicators: ${indicators.length}, presets: ${presetTotal}`);

  // Derived unions for chips
  const allDesignIntents = Array.from(
    new Set(indicators.flatMap((i) => i.presets.map((p) => p.designIntent)))
  ) as DesignIntent[];
  const allCategories = Array.from(new Set(indicators.map((i) => i.category)));

  return { indicators, allDesignIntents, allCategories };
}

type FilterState = {
  intents: DesignIntent[];
  categories: IndicatorMeta["category"][];
};

type CatalogState = {
  catalog: Catalog | null;
  filters: FilterState;
  setIntents: (ints: DesignIntent[]) => void;
  setCategories: (cats: IndicatorMeta["category"][]) => void;
  hydrateFromUrl: (search: string) => void;
  toQuery: () => string;
  load: () => void;
};

export const useIndicatorCatalog = create<CatalogState>((set, get) => ({
  catalog: null,
  filters: { intents: [], categories: [] }, // IMPORTANT: empty = show all
  setIntents: (ints) => set((s) => ({ filters: { ...s.filters, intents: ints } })),
  setCategories: (cats) => set((s) => ({ filters: { ...s.filters, categories: cats } })),
  hydrateFromUrl: (search) => {
    const params = new URLSearchParams(search);
    const intents = (params.get("intent") || "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => INTENTS.includes(s as DesignIntent)) as DesignIntent[];
    const categories = (params.get("cat") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as IndicatorMeta["category"][];
    set({ filters: { intents, categories } });
  },
  toQuery: () => {
    const { filters } = get();
    const qs = new URLSearchParams();
    if (filters.intents.length) qs.set("intent", filters.intents.join(","));
    if (filters.categories.length) qs.set("cat", filters.categories.join(","));
    const str = qs.toString();
    return str ? `?${str}` : "";
  },
  load: () => {
    // Use multiple glob roots to avoid env path issues (Lovable/Vite)
    const g1 = import.meta.glob("/src/indicators/*/meta.json", { eager: true, import: "default" }) as Record<string, any>;
    const g2 = import.meta.glob("./indicators/*/meta.json", { eager: true, import: "default" }) as Record<string, any>;
    const g3 = import.meta.glob("../indicators/*/meta.json", { eager: true, import: "default" }) as Record<string, any>;
    const files = Object.keys(g1).length + Object.keys(g2).length + Object.keys(g3).length
      ? { ...g1, ...g2, ...g3 }
      : FALLBACK;
    const catalog = buildCatalog(files);
    set({ catalog });
    // Toast once per session
    if (!sessionStorage.getItem("catalog_toast_shown")) {
      const n = catalog.indicators.length;
      console.info(`Loaded ${n} indicators`);
      sessionStorage.setItem("catalog_toast_shown", "1");
    }
  }
}));

// Selectors
export function selectIndicatorsByFilters(catalog: Catalog, intents: DesignIntent[], cats: IndicatorMeta["category"][]) {
  const byIntent = (ind: IndicatorMeta) =>
    intents.length === 0 || ind.presets.some((p) => intents.includes(p.designIntent));
  const byCat = (ind: IndicatorMeta) => cats.length === 0 || cats.includes(ind.category);
  return catalog.indicators.filter((ind) => byIntent(ind) && byCat(ind));
}

export function selectPresetsByIntent(indicator: IndicatorMeta, intents: DesignIntent[]) {
  return indicator.presets.filter((p) => (intents.length ? intents.includes(p.designIntent) : true));
}