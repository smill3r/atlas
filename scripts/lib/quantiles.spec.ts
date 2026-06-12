import { describe, it, expect } from 'vitest';
import { computeScale } from './quantiles';

describe('computeScale', () => {
  it('ignores nulls and reports min/max', () => {
    const { min, max } = computeScale([1, null, 5, 3, null, 9], 4);
    expect(min).toBe(1);
    expect(max).toBe(9);
  });

  it('produces (buckets - 1) interior break points by linear interpolation', () => {
    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const { breaks } = computeScale(values, 5);
    expect(breaks).toEqual([1.8, 3.6, 5.4, 7.2]);
  });

  it('returns empty breaks and zeroed min/max when no finite values exist', () => {
    expect(computeScale([null, null], 4)).toEqual({ min: 0, max: 0, breaks: [] });
  });
});
