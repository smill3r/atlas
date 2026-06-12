import { describe, it, expect } from 'vitest';
import { parseIndicatorCsv } from './parse-indicator-csv';

const SAMPLE = `"Data Source","World Development Indicators",

"Last Updated Date","2026-04-08",

"Country Name","Country Code","Indicator Name","Indicator Code","1960","1961","1962"
"Aruba","ABW","Access to electricity (% of population)","EG.ELC.ACCS.ZS","","","100"
"Afghanistan","AFG","Access to electricity (% of population)","EG.ELC.ACCS.ZS","","42.7",""
`;

describe('parseIndicatorCsv', () => {
  it('extracts the year axis from the header row', () => {
    const { years } = parseIndicatorCsv(SAMPLE);
    expect(years).toEqual([1960, 1961, 1962]);
  });

  it('returns one row per country with values aligned to the year axis', () => {
    const { rows } = parseIndicatorCsv(SAMPLE);
    expect(rows).toEqual([
      { code: 'ABW', name: 'Aruba', values: [null, null, 100] },
      { code: 'AFG', name: 'Afghanistan', values: [null, 42.7, null] },
    ]);
  });
});
