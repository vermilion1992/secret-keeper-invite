import { useEffect } from "react";
import { useIndicatorCatalog, selectIndicatorsByFilters } from "@/state/indicatorCatalog";
import type { DesignIntent, IndicatorMeta } from "@/state/indicatorTypes";

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm border transition-colors ${
        selected ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-accent-foreground/20"
      } focus:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      {label}
    </button>
  );
}

export default function IndicatorsPage() {
  const { catalog, filters, setIntents, setCategories, hydrateFromUrl, toQuery, load } = useIndicatorCatalog();

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

  const toggle = <T extends string>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const filtered = selectIndicatorsByFilters(catalog, filters.intents, filters.categories);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Indicators</h1>

      {/* Design Intent chips */}
      <div>
        <div className="mb-3 text-sm font-medium text-foreground">Design Intent</div>
        <div className="flex flex-wrap gap-2">
          {catalog.allDesignIntents.map((di) => (
            <Chip
              key={di}
              label={di}
              selected={filters.intents.includes(di)}
              onClick={() => setIntents(toggle(filters.intents, di))}
            />
          ))}
          {filters.intents.length > 0 && (
            <button className="text-sm text-muted-foreground hover:text-foreground underline ml-2" onClick={() => setIntents([])}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div>
        <div className="mb-3 text-sm font-medium text-foreground">Category</div>
        <div className="flex flex-wrap gap-2">
          {catalog.allCategories.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={filters.categories.includes(c)}
              onClick={() => setCategories(toggle(filters.categories, c))}
            />
          ))}
          {filters.categories.length > 0 && (
            <button className="text-sm text-muted-foreground hover:text-foreground underline ml-2" onClick={() => setCategories([])}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((ind) => (
          <IndicatorCard key={ind.id} ind={ind} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-8 text-center rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground mb-2">No indicators match the selected filters.</p>
          <button 
            className="text-primary hover:text-primary/80 underline" 
            onClick={() => { setIntents([]); setCategories([]); }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function IndicatorCard({ ind }: { ind: IndicatorMeta }) {
  return (
    <a 
      href={`/indicator/${ind.id}`} 
      className="block rounded-lg border border-border p-4 bg-card hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-card-foreground">{ind.label}</div>
        <span className="text-xs rounded-full px-2 py-0.5 bg-muted text-muted-foreground border">
          {ind.category}
        </span>
      </div>
      <div className="text-sm text-muted-foreground mb-3">
        {ind.tags?.slice?.(0,5)?.join?.(" • ")}
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {Array.from(new Set(ind.presets.map(p => p.designIntent))).map((d) => (
          <span 
            key={d} 
            className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            {d}
          </span>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        {ind.presets.length} presets
      </div>
    </a>
  );
}