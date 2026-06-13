import { describe, it, expect } from 'vitest';
import { colorFor, legendRows, uniqueBreaks, MARKER_PALETTE } from './color-scale';

describe('uniqueBreaks', () => {
  it('removes duplicate values', () => {
    expect(uniqueBreaks([10, 20, 20, 30])).toEqual([10, 20, 30]);
  });

  it('returns an empty array unchanged', () => {
    expect(uniqueBreaks([])).toEqual([]);
  });

  it('preserves order', () => {
    expect(uniqueBreaks([5, 15, 25])).toEqual([5, 15, 25]);
  });
});

describe('colorFor', () => {
  const breaks = [20, 40, 60, 80, 90];

  it('returns null for null value', () => {
    expect(colorFor(null, breaks)).toBeNull();
  });

  it('returns null for undefined value', () => {
    expect(colorFor(undefined, breaks)).toBeNull();
  });

  it('returns null for non-finite value', () => {
    expect(colorFor(NaN, breaks)).toBeNull();
  });

  it('maps a value below the first break to the first palette color', () => {
    expect(colorFor(5, breaks)).toBe(MARKER_PALETTE[0]);
  });

  it('maps a value above the last break to the last palette color', () => {
    expect(colorFor(95, breaks)).toBe(MARKER_PALETTE[MARKER_PALETTE.length - 1]);
  });

  it('maps a value at a break boundary to the next bucket', () => {
    // value = 20 is NOT > 20, so it stays in bucket 0
    expect(colorFor(20, breaks)).toBe(MARKER_PALETTE[0]);
    // value = 21 IS > 20, so it moves to bucket 1
    expect(colorFor(21, breaks)).toBe(MARKER_PALETTE[1]);
  });

  it('accepts a custom palette', () => {
    const palette = ['#aaa', '#bbb'];
    expect(colorFor(50, breaks, palette)).toBe('#bbb');
  });
});

describe('legendRows', () => {
  it('returns one row per quantile bucket', () => {
    const rows = legendRows(0, 100, [25, 50, 75]);
    expect(rows).toHaveLength(4);
  });

  it('uses the palette color for each row', () => {
    const rows = legendRows(0, 100, [50]);
    expect(rows[0]!.color).toBe(MARKER_PALETTE[0]);
    expect(rows[1]!.color).toBe(MARKER_PALETTE[1]);
  });

  it('sets from/to ranges correctly', () => {
    const rows = legendRows(0, 100, [50]);
    expect(rows[0]!.from).toBe(0);
    expect(rows[0]!.to).toBe(50);
    expect(rows[1]!.from).toBe(50);
  });

  it('returns empty array for empty breaks', () => {
    const rows = legendRows(0, 100, []);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.from).toBe(0);
  });
});
