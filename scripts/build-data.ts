import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { INDICATOR_SOURCES } from './lib/indicator-config';
import { parseIndicatorCsv } from './lib/parse-indicator-csv';
import { parseCountryMetadata } from './lib/parse-country-metadata';
import { parseIndicatorMeta } from './lib/parse-indicator-meta';
import { splitCountries } from './lib/split-countries';
import { alpha3ToNumericId } from './lib/iso-codes';
import { computeScale } from './lib/quantiles';
import type {
  IndicatorManifest,
  IndicatorMeta,
  Country,
  IndicatorData,
} from '../src/app/core/data/models';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = resolve(ROOT, 'datasets');
const OUT_DIR = resolve(ROOT, 'src/assets/data');
const BUCKETS = 6;

function read(dir: string, file: string): string {
  return readFileSync(join(DATA_DIR, dir, file), 'utf8');
}

function main(): void {
  mkdirSync(OUT_DIR, { recursive: true });

  const manifestIndicators: IndicatorMeta[] = [];
  const countriesByCode = new Map<string, Country>();
  const droppedNoNumericId = new Set<string>();
  let yearStart = Infinity;
  let yearEnd = -Infinity;

  for (const src of INDICATOR_SOURCES) {
    const { years, rows } = parseIndicatorCsv(read(src.dir, src.dataCsv));
    const meta = parseCountryMetadata(read(src.dir, src.metaCsv));
    const text = parseIndicatorMeta(read(src.dir, src.indicatorCsv));
    const { isCountry } = splitCountries(meta);

    yearStart = Math.min(yearStart, years[0] ?? yearStart);
    yearEnd = Math.max(yearEnd, years[years.length - 1] ?? yearEnd);

    const countries: IndicatorData['countries'] = {};
    const aggregates: IndicatorData['aggregates'] = {};
    const allValues: (number | null)[] = [];

    for (const row of rows) {
      if (isCountry(row.code)) {
        // Only real-country values define the color scale; aggregates such as
        // the World total would otherwise blow out the max and skew the breaks.
        allValues.push(...row.values);
        countries[row.code] = row.values;
        if (!countriesByCode.has(row.code)) {
          const numericId = alpha3ToNumericId(row.code);
          if (numericId) {
            countriesByCode.set(row.code, {
              code: row.code,
              numericId,
              name: row.name,
              region: meta[row.code]?.region ?? '',
              incomeGroup: meta[row.code]?.incomeGroup ?? '',
            });
          } else {
            droppedNoNumericId.add(`${row.code} (${row.name})`);
          }
        }
      } else {
        aggregates[row.name] = row.values;
      }
    }

    const scale = computeScale(allValues, BUCKETS);

    manifestIndicators.push({
      code: src.code,
      name: text.name || src.code,
      unit: src.unit,
      description: text.description,
      source: text.source,
      min: scale.min,
      max: scale.max,
      breaks: scale.breaks,
    });

    const data: IndicatorData = { code: src.code, countries, aggregates };
    writeFileSync(join(OUT_DIR, `indicator-${src.code}.json`), JSON.stringify(data));
    console.log(
      `wrote indicator-${src.code}.json (${Object.keys(countries).length} countries)`,
    );
  }

  const manifest: IndicatorManifest = {
    yearStart,
    yearEnd,
    indicators: manifestIndicators,
  };
  writeFileSync(join(OUT_DIR, 'indicators.json'), JSON.stringify(manifest, null, 2));

  const countries = [...countriesByCode.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  writeFileSync(join(OUT_DIR, 'countries.json'), JSON.stringify(countries, null, 2));

  console.log(`wrote indicators.json (${manifestIndicators.length} indicators)`);
  console.log(`wrote countries.json (${countries.length} countries)`);

  if (droppedNoNumericId.size > 0) {
    console.warn(
      `note: ${droppedNoNumericId.size} code(s) had a region but no ISO numeric id, ` +
        `so they are excluded from the map: ${[...droppedNoNumericId].join(', ')}`,
    );
  }
}

main();
