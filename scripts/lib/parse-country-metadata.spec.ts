import { describe, it, expect } from 'vitest';
import { parseCountryMetadata } from './parse-country-metadata';

const SAMPLE = `"Country Code","Region","IncomeGroup","SpecialNotes","TableName"
"ABW","Latin America & Caribbean","High income","","Aruba"
"AFE","","","26 countries...","Africa Eastern and Southern"
"AFG","South Asia","Low income","","Afghanistan"
`;

describe('parseCountryMetadata', () => {
  it('maps each country code to its region and income group', () => {
    const meta = parseCountryMetadata(SAMPLE);
    expect(meta['ABW']).toEqual({
      region: 'Latin America & Caribbean',
      incomeGroup: 'High income',
    });
    expect(meta['AFG']).toEqual({ region: 'South Asia', incomeGroup: 'Low income' });
  });

  it('represents aggregates with an empty region', () => {
    const meta = parseCountryMetadata(SAMPLE);
    expect(meta['AFE']).toEqual({ region: '', incomeGroup: '' });
  });
});
