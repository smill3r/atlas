import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { INDICATOR_REPOSITORY } from '../data/indicator-repository';
import { Country, IndicatorData, IndicatorMeta } from '../data/models';
import { colorFor, legendRows } from '../data/color-scale';
import { MapProjectionService } from '../map/map-projection.service';

export type LoadStatus = 'loading' | 'loaded' | 'error';

/** One indicator's data for the selected country, ready for the sheet. */
export interface CountryIndicatorStat {
  meta: IndicatorMeta;
  series: (number | null)[];
  value: number | null; // value at the selected year
  percentile: number | null; // 0–100 global rank at the selected year
  trend: 'up' | 'down' | 'flat' | null; // 5-year direction
}

export interface CountryProfile {
  country: Country;
  stats: CountryIndicatorStat[];
}

/** Glanceable insight card for the active indicator at the selected year. */
export interface HeroStat {
  icon: string;
  headline: string;
  subline: string | null;
  percent: number | null; // 0–100 for the progress bar fill
  trend: 'up' | 'down' | 'flat' | null;
}

@Injectable({ providedIn: 'root' })
export class AtlasStore {
  private readonly repo = inject(INDICATOR_REPOSITORY);
  private readonly projection = inject(MapProjectionService);

  // --- Async resources (RxJS -> signals) ------------------------------------

  readonly manifest = toSignal(this.repo.getManifest(), { initialValue: null });
  readonly countries = toSignal(this.repo.getCountries(), { initialValue: [] });
  readonly shapes = toSignal(this.projection.getCountryShapes(), {
    initialValue: [],
  });
  readonly features = toSignal(this.projection.getCountryFeatures(), {
    initialValue: [],
  });

  /** Flat choropleth vs spinning globe; defaults to globe on small screens. */
  readonly mapMode = signal<'flat' | 'globe'>(
    typeof window !== 'undefined' && window.innerWidth <= 720 ? 'globe' : 'flat',
  );

  toggleMapMode(): void {
    this.mapMode.update((m) => (m === 'flat' ? 'globe' : 'flat'));
  }

  /**
   * All indicator datasets, loaded once: manifest -> forkJoin over indicators.
   * Drives both the choropleth and the multi-indicator country sheet.
   */
  private readonly dataResult = toSignal(
    this.repo.getManifest().pipe(
      switchMap((m) =>
        forkJoin(
          m.indicators.map((i) =>
            this.repo.getIndicator(i.code).pipe(map((d) => [i.code, d] as const)),
          ),
        ),
      ),
      map(
        (entries) =>
          ({
            status: 'loaded' as const,
            data: Object.fromEntries(entries) as Record<string, IndicatorData>,
          }) as const,
      ),
      startWith({ status: 'loading' as const }),
      catchError((error) => of({ status: 'error' as const, error })),
    ),
    { initialValue: { status: 'loading' as const } },
  );

  readonly loadStatus = computed<LoadStatus>(() => this.dataResult().status);
  private readonly indicatorsByCode = computed<Record<string, IndicatorData>>(() => {
    const r = this.dataResult();
    return r.status === 'loaded' ? r.data : {};
  });

  // --- View state -----------------------------------------------------------

  private readonly selectedIndicatorRaw = signal<string | null>(null);
  private readonly selectedYearRaw = signal<number | null>(null);
  readonly selectedCountryCode = signal<string | null>(null);
  readonly hoveredNumericId = signal<string | null>(null);
  readonly searchQuery = signal('');

  /** Effective selection falls back to sensible defaults once data loads. */
  readonly selectedIndicatorCode = computed(
    () => this.selectedIndicatorRaw() ?? this.manifest()?.indicators[0]?.code ?? null,
  );
  readonly selectedYear = computed(
    () => this.selectedYearRaw() ?? this.latestYearWithData() ?? this.manifest()?.yearEnd ?? null,
  );

  /**
   * The most recent year the active indicator actually has data for. World Bank
   * series lag a year or two, so the latest column is often empty — defaulting
   * to it would paint an all-grey map.
   */
  private readonly latestYearWithData = computed<number | null>(() => {
    const m = this.manifest();
    const meta = this.activeIndicator();
    const data = meta ? this.indicatorsByCode()[meta.code] : undefined;
    if (!m || !data) return null;
    const len = m.yearEnd - m.yearStart + 1;
    for (let idx = len - 1; idx >= 0; idx--) {
      for (const c of this.countries()) {
        const v = data.countries[c.code]?.[idx];
        if (v !== null && v !== undefined) return m.yearStart + idx;
      }
    }
    return null;
  });

  readonly activeIndicator = computed<IndicatorMeta | null>(() => {
    const code = this.selectedIndicatorCode();
    return this.manifest()?.indicators.find((i) => i.code === code) ?? null;
  });

  private readonly yearIndex = computed(() => {
    const m = this.manifest();
    const y = this.selectedYear();
    return m && y != null ? y - m.yearStart : -1;
  });

  // --- Lookups --------------------------------------------------------------

  private readonly countryByNumericId = computed(() => {
    const map = new Map<string, Country>();
    for (const c of this.countries()) map.set(c.numericId, c);
    return map;
  });
  private readonly countryByCode = computed(() => {
    const map = new Map<string, Country>();
    for (const c of this.countries()) map.set(c.code, c);
    return map;
  });

  // --- Choropleth -----------------------------------------------------------

  /** numericId -> marker color for the active indicator + year. */
  readonly colorByNumericId = computed(() => {
    const result = new Map<string, string>();
    const meta = this.activeIndicator();
    const data = meta ? this.indicatorsByCode()[meta.code] : undefined;
    const idx = this.yearIndex();
    if (!meta || !data || idx < 0) return result;
    for (const c of this.countries()) {
      const value = data.countries[c.code]?.[idx] ?? null;
      const color = colorFor(value, meta.breaks);
      if (color) result.set(c.numericId, color);
    }
    return result;
  });

  /** numericId of the currently selected country, for map highlighting. */
  readonly selectedNumericId = computed(() => {
    const code = this.selectedCountryCode();
    return code ? (this.countryByCode().get(code)?.numericId ?? null) : null;
  });

  readonly legend = computed(() => {
    const meta = this.activeIndicator();
    return meta ? legendRows(meta.min, meta.max, meta.breaks) : [];
  });

  /** Name + value under the cursor, for the hover readout. */
  readonly hoveredInfo = computed(() => {
    const id = this.hoveredNumericId();
    if (!id) return null;
    const country = this.countryByNumericId().get(id);
    const meta = this.activeIndicator();
    const idx = this.yearIndex();
    if (!country || !meta) return { name: this.shapeName(id), value: null, unit: '' };
    const value = this.indicatorsByCode()[meta.code]?.countries[country.code]?.[idx] ?? null;
    return { name: country.name, value, unit: meta.unit };
  });

  // --- Search (debounced RxJS stream) ---------------------------------------

  readonly searchResults = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(150),
      distinctUntilChanged(),
      map((q) => this.filterCountries(q)),
    ),
    { initialValue: [] as Country[] },
  );

  // --- Hero stat card -------------------------------------------------------

  private static readonly INDICATOR_ICONS: Record<string, string> = {
    'EG.ELC.ACCS.ZS': '⚡',
    'EN.GHG.CO2.MT.CE.AR5': '💨',
    'IT.NET.USER.ZS': '🌐',
    'SE.PRM.CMPT.FE.ZS': '📚',
  };

  readonly heroStat = computed<HeroStat | null>(() => {
    const meta = this.activeIndicator();
    const data = meta ? this.indicatorsByCode()[meta.code] : undefined;
    const year = this.selectedYear();
    const m = this.manifest();
    const countries = this.countries();
    if (!meta || !data || year == null || !m || countries.length === 0) return null;

    const idx = year - m.yearStart;
    const prevYear = Math.max(m.yearStart, year - 10);
    const prevIdx = prevYear - m.yearStart;
    const icon = AtlasStore.INDICATOR_ICONS[meta.code] ?? '🌍';
    const isPercent = meta.unit.includes('%');

    const vals: number[] = [];
    const prevVals: number[] = [];
    let maxVal = -Infinity;
    let maxCountryName = '';

    for (const c of countries) {
      const series = data.countries[c.code];
      if (!series) continue;
      const v = series[idx] ?? null;
      const pv = series[prevIdx] ?? null;
      if (v !== null) {
        vals.push(v);
        if (v > maxVal) {
          maxVal = v;
          maxCountryName = c.name;
        }
      }
      if (pv !== null) prevVals.push(pv);
    }

    if (vals.length === 0) return null;

    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const prevAvg = prevVals.length > 0 ? prevVals.reduce((a, b) => a + b, 0) / prevVals.length : null;
    const delta = prevAvg !== null ? avg - prevAvg : null;
    const trend: HeroStat['trend'] =
      delta === null ? null : delta > 0.5 ? 'up' : delta < -0.5 ? 'down' : 'flat';

    let headline: string;
    let percent: number | null;
    let subline: string | null = null;

    if (meta.code === 'EG.ELC.ACCS.ZS') {
      const lacking = vals.filter((v) => v < 50).length;
      headline = `${lacking} countries lack basic electricity access`;
      percent = avg;
      if (delta !== null)
        subline = `Global avg ${avg.toFixed(0)}% — ${delta > 0 ? '+' : ''}${delta.toFixed(1)}pp since ${prevYear}`;
    } else if (meta.code === 'IT.NET.USER.ZS') {
      headline = `${avg.toFixed(1)}% global internet penetration`;
      percent = avg;
      if (delta !== null)
        subline = `${delta > 0 ? '+' : ''}${delta.toFixed(1)}pp over the last 10 years`;
    } else if (meta.code === 'SE.PRM.CMPT.FE.ZS') {
      headline = `${avg.toFixed(1)}% female primary completion rate`;
      percent = Math.min(100, avg);
      if (delta !== null)
        subline = `${delta > 0 ? '+' : ''}${delta.toFixed(1)}pp over the last 10 years`;
    } else if (meta.code === 'EN.GHG.CO2.MT.CE.AR5') {
      headline = `${maxCountryName} leads at ${(maxVal / 1000).toFixed(1)} Gt CO₂`;
      const total = vals.reduce((a, b) => a + b, 0);
      percent = total > 0 ? (maxVal / total) * 100 : null;
      subline = `${(total / 1000).toFixed(1)} Gt total global emissions in ${year}`;
    } else {
      headline = `Global avg: ${avg.toFixed(1)} ${meta.unit}`;
      percent = isPercent ? avg : null;
      if (delta !== null)
        subline = `${delta > 0 ? '+' : ''}${delta.toFixed(1)} since ${prevYear}`;
    }

    return { icon, headline, subline, percent, trend };
  });

  // --- World averages (for comparison line in detail charts) ----------------

  /** World aggregate series for each indicator code. */
  readonly worldAverages = computed<Record<string, (number | null)[]>>(() => {
    const byCode = this.indicatorsByCode();
    const result: Record<string, (number | null)[]> = {};
    for (const [code, data] of Object.entries(byCode)) {
      result[code] = data.aggregates['World'] ?? [];
    }
    return result;
  });

  // --- Selected country profile (all indicators) ----------------------------

  readonly selectedProfile = computed<CountryProfile | null>(() => {
    const code = this.selectedCountryCode();
    if (!code) return null;
    const country = this.countryByCode().get(code);
    const m = this.manifest();
    const byCode = this.indicatorsByCode();
    const idx = this.yearIndex();
    if (!country || !m) return null;

    const stats: CountryIndicatorStat[] = m.indicators.map((meta) => {
      const series = byCode[meta.code]?.countries[code] ?? [];
      const value = idx >= 0 ? (series[idx] ?? null) : null;

      // Global percentile rank at selected year
      let percentile: number | null = null;
      if (value !== null) {
        const allVals = this.countries()
          .map((c) => byCode[meta.code]?.countries[c.code]?.[idx] ?? null)
          .filter((v): v is number => v !== null)
          .sort((a, b) => a - b);
        const below = allVals.filter((v) => v <= value).length;
        percentile = Math.round((below / allVals.length) * 100);
      }

      // 5-year trend direction
      let trend: CountryIndicatorStat['trend'] = null;
      if (idx >= 0) {
        const window = series
          .slice(Math.max(0, idx - 5), idx + 1)
          .filter((v): v is number => v !== null);
        if (window.length >= 2) {
          const delta = (window[window.length - 1] ?? 0) - (window[0] ?? 0);
          const threshold = (meta.max - meta.min) * 0.01;
          trend = delta > threshold ? 'up' : delta < -threshold ? 'down' : 'flat';
        }
      }

      return { meta, series, value, percentile, trend };
    });

    return { country, stats };
  });

  // --- Actions --------------------------------------------------------------

  selectIndicator(code: string): void {
    this.selectedIndicatorRaw.set(code);
  }
  selectYear(year: number): void {
    this.selectedYearRaw.set(year);
  }
  selectCountryByNumericId(numericId: string | null): void {
    if (!numericId) return this.selectedCountryCode.set(null);
    const country = this.countryByNumericId().get(numericId);
    this.selectedCountryCode.set(country?.code ?? null);
  }
  selectCountryByCode(code: string): void {
    this.selectedCountryCode.set(code);
    this.searchQuery.set('');
  }
  /** Returns the ISO alpha-3 code for a numeric map ID, or null if not found. */
  getCountryCode(numericId: string): string | null {
    return this.countryByNumericId().get(numericId)?.code ?? null;
  }
  hover(numericId: string | null): void {
    this.hoveredNumericId.set(numericId);
  }
  setSearch(q: string): void {
    this.searchQuery.set(q);
  }
  closeSheet(): void {
    this.selectedCountryCode.set(null);
  }

  // --- Helpers --------------------------------------------------------------

  private filterCountries(query: string): Country[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.countries()
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 8);
  }

  private shapeName(numericId: string): string {
    return this.shapes().find((s) => s.numericId === numericId)?.name ?? '';
  }
}
