import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useIndicatorCatalog, selectPresetsByIntent } from "@/state/indicatorCatalog";
import type { DesignIntent } from "@/state/indicatorTypes";

export default function IndicatorDetail() {
  const { id } = useParams();
  const { catalog, filters, setIntents, hydrateFromUrl, toQuery, load } = useIndicatorCatalog();

  useEffect(() => {
    load();
    hydrateFromUrl(location.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const q = toQuery();
    const url = q ? `${location.pathname}${q}` : location.pathname;
    history.replaceState(null, "", url);
  }, [filters, toQuery]);

  if (!catalog) return null;
  const ind = catalog.indicators.find((i) => i.id === id);
  if (!ind) return <div className="p-6 text-center text-muted-foreground">Indicator not found.</div>;

  const intentsForThis = useMemo(
    () => Array.from(new Set(ind.presets.map((p) => p.designIntent))),
    [ind.presets]
  );

  const presets = selectPresetsByIntent(ind, filters.intents);

  const toggle = <T extends string>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{ind.label}</h1>
        <p className="text-muted-foreground">{ind.category} • {ind.tier}</p>
      </div>

      {/* Intent filter chips (local to catalog store) */}
      <div>
        <div className="mb-3 text-sm font-medium text-foreground">Design Intent</div>
        <div className="flex flex-wrap gap-2">
          {intentsForThis.map((di) => (
            <button
              key={di}
              role="button"
              aria-pressed={filters.intents.includes(di)}
              onClick={() => setIntents(toggle(filters.intents, di))}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm border transition-colors ${
                filters.intents.includes(di) 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background text-foreground border-border hover:border-accent-foreground/20"
              } focus:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            >
              {di} 
              <span className="ml-1.5 text-[10px] opacity-70">
                ({ind.presets.filter(p => p.designIntent === di).length})
              </span>
            </button>
          ))}
          {filters.intents.length > 0 && (
            <button 
              className="text-sm text-muted-foreground hover:text-foreground underline ml-2" 
              onClick={() => setIntents([])}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Presets • {ind.presets.length}{filters.intents.length ? ` (filtered: ${presets.length})` : ""}
        </div>
      </div>

      {/* Presets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {presets.map((p) => (
          <div key={p.id} className="rounded-lg border border-border p-4 bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-card-foreground">{p.name}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                p.presetTier === "Hero" 
                  ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800" 
                  : "bg-muted text-muted-foreground border-border"
              }`}>
                {p.presetTier}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {p.designIntent}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                {p.riskProfile}
              </span>
            </div>
            <a 
              href={`/strategy-builder?from=${encodeURIComponent(ind.id)}&preset=${encodeURIComponent(p.id)}`} 
              className="inline-block text-primary hover:text-primary/80 underline"
            >
              Use this preset
            </a>
          </div>
        ))}
      </div>

      {presets.length === 0 && (
        <div className="p-8 text-center rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground mb-2">No presets match the selected intent.</p>
          <button 
            className="text-primary hover:text-primary/80 underline" 
            onClick={() => setIntents([])}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}