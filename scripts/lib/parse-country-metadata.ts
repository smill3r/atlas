import Papa from 'papaparse';

export interface CountryMetaEntry {
  region: string;
  incomeGroup: string;
}

export function parseCountryMetadata(csv: string): Record<string, CountryMetaEntry> {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const out: Record<string, CountryMetaEntry> = {};
  for (const row of parsed.data) {
    const code = row['Country Code'];
    if (!code) continue;
    out[code] = {
      region: row['Region'] ?? '',
      incomeGroup: row['IncomeGroup'] ?? '',
    };
  }
  return out;
}
