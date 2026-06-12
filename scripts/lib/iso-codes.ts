import countries from 'i18n-iso-countries';

/**
 * Map a World Bank ISO alpha-3 code to the ISO 3166-1 numeric id
 * (zero-padded to 3 digits) used by world-atlas TopoJSON. Returns null
 * for aggregates / unknown codes.
 */
export function alpha3ToNumericId(alpha3: string): string | null {
  const numeric = countries.alpha3ToNumeric(alpha3);
  if (!numeric) return null;
  return String(numeric).padStart(3, '0');
}
