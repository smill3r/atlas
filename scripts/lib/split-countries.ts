import type { CountryMetaEntry } from './parse-country-metadata';

export function splitCountries(meta: Record<string, CountryMetaEntry>) {
  const isCountry = (code: string): boolean => {
    const entry = meta[code];
    return !!entry && entry.region.trim() !== '';
  };
  return { isCountry };
}
