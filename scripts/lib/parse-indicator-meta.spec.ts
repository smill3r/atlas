import { describe, it, expect } from 'vitest';
import { parseIndicatorMeta } from './parse-indicator-meta';

const SAMPLE = `"INDICATOR_CODE","INDICATOR_NAME","SOURCE_NOTE","SOURCE_ORGANIZATION",
"EG.ELC.ACCS.ZS","Access to electricity (% of population)","Access to electricity is the percentage of population with access.","SDG 7.1.1, World Bank",
`;

describe('parseIndicatorMeta', () => {
  it('extracts name, description (source note), and source organization', () => {
    const meta = parseIndicatorMeta(SAMPLE);
    expect(meta).toEqual({
      name: 'Access to electricity (% of population)',
      description: 'Access to electricity is the percentage of population with access.',
      source: 'SDG 7.1.1, World Bank',
    });
  });

  it('returns empty strings when the data row is missing', () => {
    const headerOnly = `"INDICATOR_CODE","INDICATOR_NAME","SOURCE_NOTE","SOURCE_ORGANIZATION",\n`;
    expect(parseIndicatorMeta(headerOnly)).toEqual({
      name: '',
      description: '',
      source: '',
    });
  });
});
