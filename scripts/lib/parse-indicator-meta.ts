import Papa from 'papaparse';

export interface IndicatorMetaText {
  name: string;
  description: string;
  source: string;
}

export function parseIndicatorMeta(csv: string): IndicatorMetaText {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });
  const row = parsed.data[0] ?? {};
  return {
    name: row['INDICATOR_NAME'] ?? '',
    description: row['SOURCE_NOTE'] ?? '',
    source: row['SOURCE_ORGANIZATION'] ?? '',
  };
}
