import Papa from 'papaparse';

export interface IndicatorRow {
  code: string;
  name: string;
  values: (number | null)[];
}

export interface ParsedIndicatorCsv {
  years: number[];
  rows: IndicatorRow[];
}

/** Parse a World Bank indicator CSV string, skipping the preamble. */
export function parseIndicatorCsv(csv: string): ParsedIndicatorCsv {
  const parsed = Papa.parse<string[]>(csv, { skipEmptyLines: true });
  const records = parsed.data;

  const headerIndex = records.findIndex((r) => r[0] === 'Country Name');
  if (headerIndex === -1) {
    throw new Error('Could not find the "Country Name" header row');
  }

  const header = records[headerIndex] ?? [];
  const years = header
    .slice(4)
    // Guard against the trailing empty column (real WB rows end with a comma):
    // Number('') is 0, not NaN, so blank cells must be dropped before conversion.
    .map((y) => (y === undefined || y.trim() === '' ? NaN : Number(y)))
    .filter((y) => Number.isFinite(y));

  const rows: IndicatorRow[] = records.slice(headerIndex + 1).map((r) => ({
    name: r[0] ?? '',
    code: r[1] ?? '',
    values: years.map((_, i) => {
      const cell = r[4 + i];
      return cell === undefined || cell === '' ? null : Number(cell);
    }),
  }));

  return { years, rows };
}
