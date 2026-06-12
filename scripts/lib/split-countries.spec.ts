import { describe, it, expect } from 'vitest';
import { splitCountries } from './split-countries';

const meta = {
  ABW: { region: 'Latin America & Caribbean', incomeGroup: 'High income' },
  AFE: { region: '', incomeGroup: '' },
  AFG: { region: 'South Asia', incomeGroup: 'Low income' },
};

describe('splitCountries', () => {
  it('classifies codes with a region as real countries', () => {
    const { isCountry } = splitCountries(meta);
    expect(isCountry('ABW')).toBe(true);
    expect(isCountry('AFG')).toBe(true);
  });

  it('classifies codes without a region as aggregates', () => {
    const { isCountry } = splitCountries(meta);
    expect(isCountry('AFE')).toBe(false);
    expect(isCountry('UNKNOWN')).toBe(false);
  });
});
