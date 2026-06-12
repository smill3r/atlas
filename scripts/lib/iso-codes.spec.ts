import { describe, it, expect } from 'vitest';
import { alpha3ToNumericId } from './iso-codes';

describe('alpha3ToNumericId', () => {
  it('maps known countries to zero-padded ISO numeric ids', () => {
    expect(alpha3ToNumericId('USA')).toBe('840');
    expect(alpha3ToNumericId('ABW')).toBe('533');
    expect(alpha3ToNumericId('AFG')).toBe('004'); // zero-padded to 3 digits
  });

  it('returns null for non-country / aggregate codes', () => {
    expect(alpha3ToNumericId('AFE')).toBeNull();
    expect(alpha3ToNumericId('ZZZ')).toBeNull();
  });
});
