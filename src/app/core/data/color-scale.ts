/**
 * Marker-style sequential palette (light -> hot), applied like highlighter ink.
 * Six classes to match the six quantile buckets produced by the data pipeline.
 */
export const MARKER_PALETTE: readonly string[] = [
  '#FFE45E', // pale highlighter yellow
  '#FFC23C', // amber
  '#FF9F1C', // orange
  '#FF6B35', // vermilion
  '#F7414F', // marker red
  '#C71F66', // deep magenta
];

/** The color used for countries with no value for the active indicator/year. */
export const NO_DATA_COLOR = 'transparent';

/**
 * Quantile breaks can collapse onto each other when many countries sit at a
 * ceiling (e.g. electricity access at 100%). Duplicate breaks make the top
 * color class unreachable, so dedupe before building the scale.
 */
export function uniqueBreaks(breaks: readonly number[]): number[] {
  return [...new Set(breaks)];
}

/**
 * Map a value to a marker color using threshold (quantile) classification.
 * `null`/`undefined` returns null so the caller can render the "no data" state.
 */
export function colorFor(
  value: number | null | undefined,
  breaks: readonly number[],
  palette: readonly string[] = MARKER_PALETTE,
): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  const thresholds = uniqueBreaks(breaks);
  let bucket = 0;
  while (bucket < thresholds.length && value > thresholds[bucket]!) {
    bucket++;
  }
  return palette[Math.min(bucket, palette.length - 1)] ?? palette[palette.length - 1]!;
}

/** Build legend rows (label + color) from min/max + breaks for an indicator. */
export interface LegendRow {
  color: string;
  from: number;
  to: number | null; // null = open-ended (… and up)
}

export function legendRows(
  min: number,
  max: number,
  breaks: readonly number[],
  palette: readonly string[] = MARKER_PALETTE,
): LegendRow[] {
  const thresholds = uniqueBreaks(breaks);
  const edges = [min, ...thresholds];
  return edges.map((from, i) => ({
    color: palette[Math.min(i, palette.length - 1)]!,
    from,
    to: i < thresholds.length ? thresholds[i]! : max === thresholds[thresholds.length - 1] ? null : max,
  }));
}
