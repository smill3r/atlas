import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AtlasStore } from './atlas-store';
import { INDICATOR_REPOSITORY } from '../data/indicator-repository';
import { StaticHttpIndicatorRepository } from '../data/static-http-indicator-repository';

const MOCK_MANIFEST = {
  yearStart: 2000,
  yearEnd: 2002,
  indicators: [
    {
      code: 'EG.ELC.ACCS.ZS',
      name: 'Access to electricity',
      unit: '%',
      description: 'desc',
      source: 'WB',
      min: 0,
      max: 100,
      breaks: [20, 40, 60, 80, 90],
    },
  ],
};

const MOCK_COUNTRIES = [
  { code: 'FRA', numericId: '250', name: 'France', region: 'Europe & Central Asia', incomeGroup: 'High income' },
  { code: 'DEU', numericId: '276', name: 'Germany', region: 'Europe & Central Asia', incomeGroup: 'High income' },
];

const MOCK_INDICATOR = {
  code: 'EG.ELC.ACCS.ZS',
  countries: { FRA: [90, 95, 100], DEU: [95, 98, 100] },
  aggregates: { World: [70, 75, 80] },
};

const MOCK_TOPOLOGY = {
  type: 'Topology',
  objects: { countries: { type: 'GeometryCollection', geometries: [] } },
  arcs: [],
  bbox: [-180, -90, 180, 90],
};

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: INDICATOR_REPOSITORY, useClass: StaticHttpIndicatorRepository },
    ],
  });
  return {
    store: TestBed.inject(AtlasStore),
    http: TestBed.inject(HttpTestingController),
  };
}

function flushAll(http: HttpTestingController) {
  http.expectOne((req) => req.url.includes('indicators.json')).flush(MOCK_MANIFEST);
  http.expectOne((req) => req.url.includes('countries.json')).flush(MOCK_COUNTRIES);
  http.expectOne((req) => req.url.includes('indicator-EG.ELC.ACCS.ZS.json')).flush(MOCK_INDICATOR);
  http.expectOne((req) => req.url.includes('countries-110m.json')).flush(MOCK_TOPOLOGY);
  TestBed.flushEffects();
}

describe('AtlasStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('starts in loading state', () => {
    const { store } = setup();
    expect(store.loadStatus()).toBe('loading');
  });

  it('transitions to loaded state after data arrives', () => {
    const { store, http } = setup();
    flushAll(http);
    expect(store.loadStatus()).toBe('loaded');
  });

  it('selectIndicator changes the active indicator code', () => {
    const { store } = setup();
    store.selectIndicator('IT.NET.USER.ZS');
    expect(store.selectedIndicatorCode()).toBe('IT.NET.USER.ZS');
  });

  it('selectYear changes the selected year signal', () => {
    const { store, http } = setup();
    flushAll(http);
    store.selectYear(2001);
    expect(store.selectedYear()).toBe(2001);
  });

  it('selectCountryByCode sets selectedCountryCode and clears search', () => {
    const { store } = setup();
    store.setSearch('fra');
    store.selectCountryByCode('FRA');
    expect(store.selectedCountryCode()).toBe('FRA');
    expect(store.searchQuery()).toBe('');
  });

  it('closeSheet clears selectedCountryCode', () => {
    const { store } = setup();
    store.selectCountryByCode('FRA');
    store.closeSheet();
    expect(store.selectedCountryCode()).toBeNull();
  });

  it('getCountryCode returns null before data loads', () => {
    const { store } = setup();
    expect(store.getCountryCode('250')).toBeNull();
  });

  it('getCountryCode resolves to ISO code after data loads', () => {
    const { store, http } = setup();
    flushAll(http);
    expect(store.getCountryCode('250')).toBe('FRA');
    expect(store.getCountryCode('276')).toBe('DEU');
  });

  it('getCountryCode returns null for unknown numericId', () => {
    const { store, http } = setup();
    flushAll(http);
    expect(store.getCountryCode('999')).toBeNull();
  });

  it('worldAverages exposes the World aggregate series', () => {
    const { store, http } = setup();
    flushAll(http);
    const avgs = store.worldAverages();
    expect(avgs['EG.ELC.ACCS.ZS']).toEqual([70, 75, 80]);
  });

  it('toggleMapMode switches between flat and globe', () => {
    const { store } = setup();
    const initial = store.mapMode();
    store.toggleMapMode();
    expect(store.mapMode()).not.toBe(initial);
    store.toggleMapMode();
    expect(store.mapMode()).toBe(initial);
  });

  it('hover sets and clears hoveredNumericId', () => {
    const { store } = setup();
    store.hover('250');
    expect(store.hoveredNumericId()).toBe('250');
    store.hover(null);
    expect(store.hoveredNumericId()).toBeNull();
  });

  it('setSearch updates the searchQuery signal', () => {
    const { store } = setup();
    store.setSearch('fra');
    expect(store.searchQuery()).toBe('fra');
  });
});
