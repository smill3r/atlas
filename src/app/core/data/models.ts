/** ISO 3166-1 alpha-3 code, e.g. "USA". */
export type Alpha3 = string;

/** A single World Bank indicator's identity + display metadata. */
export interface IndicatorMeta {
  code: string; // e.g. "EG.ELC.ACCS.ZS"
  name: string; // e.g. "Access to electricity (% of population)"
  unit: string; // e.g. "% of population"
  description: string; // source note
  source: string; // source organization
  min: number; // precomputed across all countries/years
  max: number;
  breaks: number[]; // quantile break points for the choropleth scale
}

/** Top-level manifest the app loads first. */
export interface IndicatorManifest {
  yearStart: number;
  yearEnd: number;
  indicators: IndicatorMeta[];
}

/** A real country (has a region). */
export interface Country {
  code: Alpha3;
  numericId: string; // ISO 3166-1 numeric, matches TopoJSON ids; zero-padded
  name: string;
  region: string;
  incomeGroup: string;
}

/** One indicator's values: code -> values aligned to the manifest year axis. */
export interface IndicatorData {
  code: string;
  /** Real countries: alpha-3 -> (number|null)[] aligned to [yearStart..yearEnd]. */
  countries: Record<Alpha3, (number | null)[]>;
  /** Aggregates (regions/income/world): name -> values, for comparison lines. */
  aggregates: Record<string, (number | null)[]>;
}
