import type { DesignIntent, IndicatorCategory } from '@/types/indicator-catalog';

export interface URLFilters {
  intents: DesignIntent[];
  categories: IndicatorCategory[];
}

/**
 * Parse URL search params into filter state
 */
export const parseURLFilters = (searchParams: URLSearchParams): URLFilters => {
  const intentParam = searchParams.get('intent');
  const categoryParam = searchParams.get('cat');

  const intents = intentParam 
    ? intentParam.split(',').filter(Boolean) as DesignIntent[]
    : [];
  
  const categories = categoryParam 
    ? categoryParam.split(',').filter(Boolean) as IndicatorCategory[]
    : [];

  return { intents, categories };
};

/**
 * Convert filter state to URL search params
 */
export const filtersToURLParams = (filters: URLFilters): URLSearchParams => {
  const params = new URLSearchParams();
  
  if (filters.intents.length > 0) {
    params.set('intent', filters.intents.join(','));
  }
  
  if (filters.categories.length > 0) {
    params.set('cat', filters.categories.join(','));
  }
  
  return params;
};

/**
 * Update URL with new filter state
 */
export const updateURLWithFilters = (filters: URLFilters, navigate: (url: string) => void, basePath: string) => {
  const params = filtersToURLParams(filters);
  const search = params.toString();
  const newPath = search ? `${basePath}?${search}` : basePath;
  navigate(newPath);
};