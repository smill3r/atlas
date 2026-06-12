# Atlas — World Development Indicators

A portfolio app that visualises four curated [World Bank](https://data.worldbank.org/) development indicators on an interactive world map. Built with Angular 22 as a pure frontend, static-deploy project.

## What it does

- **Choropleth map** — countries shaded by the active indicator's quantile scale (marker-ink palette)
- **Spinning globe** — orthographic projection with drag-to-rotate and auto-spin; toggle between flat and globe views
- **Country sheet** — click any country to open a side panel with all four indicators, sparklines, bullet-bar percentiles, and 5-year trend arrows
- **Year scrubber** — slide through 1960–2024 and watch the map repaint
- **Hero stat card** — glanceable global summary that updates with the selected indicator and year
- **Search** — debounced autocomplete to jump straight to a country

### Indicators

| Code | Name |
|---|---|
| `EG.ELC.ACCS.ZS` | Access to electricity (% of population) |
| `EN.GHG.CO2.MT.CE.AR5` | Total greenhouse gas emissions (Mt CO₂ equivalent) |
| `IT.NET.USER.ZS` | Individuals using the Internet (% of population) |
| `SE.PRM.CMPT.FE.ZS` | Primary school completion rate, female (%) |

## Design

Analog aesthetic: the app renders as a warm *paper sheet* on a *folder* background — marker-yellow highlights, monospaced type, a paperclip. Responsive: desktop shows the flat map with a sidebar country sheet; mobile collapses the sheet to a bottom drawer and defaults to the globe view.

## Architecture

```
src/
├── styles/
│   ├── _tokens.scss          # Design tokens (colors, spacing, type) → CSS custom properties
│   └── _mixins.scss          # paper-surface, marker-underline, motion-safe
├── styles.scss               # Global reset + keyframes (component styles live with components)
└── app/
    ├── core/
    │   ├── data/
    │   │   ├── models.ts                         # IndicatorMeta, Country, IndicatorData interfaces
    │   │   ├── color-scale.ts                    # Quantile colour mapping + legend row builder
    │   │   ├── indicator-repository.ts           # IndicatorRepository interface + InjectionToken
    │   │   └── static-http-indicator-repository.ts  # HTTP + shareReplay implementation
    │   ├── map/
    │   │   └── map-projection.service.ts         # TopoJSON → GeoJSON → SVG path strings (Natural Earth)
    │   └── state/
    │       └── atlas-store.ts                    # Single reactive store (signals + RxJS bridge)
    ├── features/
    │   ├── atlas/
    │   │   ├── atlas-page/                       # Root page: folder layout, map controls, year scrubber
    │   │   └── hero-stat-card/                   # Glanceable headline card for the active indicator
    │   ├── country-sheet/
    │   │   ├── country-sheet/                    # Slide-in panel with per-indicator stats
    │   │   ├── bullet-bar/                       # Quantile-band SVG bar with country dot
    │   │   └── sparkline/                        # Tiny time-series SVG line with year marker
    │   └── map/
    │       ├── world-map/                        # Natural Earth flat SVG map (pure presentation)
    │       ├── globe-map/                        # Orthographic globe with drag + auto-spin
    │       ├── indicator-switcher/               # Tab strip for choosing the active indicator
    │       ├── map-legend/                       # Colour-swatch legend overlay
    │       └── country-search/                   # Debounced autocomplete search input
    └── shared/
        └── reveal.directive.ts                   # IntersectionObserver scroll-reveal
```

Each component lives in its own folder containing exactly three files: `*.component.ts`, `*.component.html`, and `*.component.scss`.

### Key design decisions

**Zoneless** — `provideZonelessChangeDetection()` + `ChangeDetectionStrategy.OnPush` everywhere. All reactivity flows through Angular signals and the `toSignal` / `toObservable` bridge.

**Single store** — `AtlasStore` (`providedIn: 'root'`) holds all async data and UI state as `computed()` / `signal()` values. Components read signals and call action methods; they own no state of their own.

**D3 for math, Angular for DOM** — D3 is used only for projection math and path generation. Angular's template engine owns every SVG element, so change detection, event handling, and a11y attributes work normally.

**Repository pattern** — `IndicatorRepository` (interface + `InjectionToken`) decouples data fetching from the store. The production implementation (`StaticHttpIndicatorRepository`) serves build-time JSON assets with per-request `shareReplay(1)` caching. A live API implementation can be swapped in with a single `provide` change.

**CSS architecture** — Design tokens are Sass maps compiled to CSS custom properties on `:root`. Every component's styles are co-located in its own `.scss` file using BEM naming. The global `styles.scss` holds only the base reset, `@keyframes`, and the `RevealDirective` styles (which must be global because directives have no stylesheet of their own).

## Getting started

Requires **Node 22**. The repo ships a `.nvmrc`; run `nvm use` before any npm command.

```bash
nvm use              # switches to Node 22
npm install
npm start            # dev server at http://localhost:4200
```

### Commands

| Command | Description |
|---|---|
| `npm start` | Start development server (`ng serve`) |
| `npm run build` | Production build to `dist/atlas/` |
| `npm test` | Unit tests via Vitest (no watch) |
| `npm run build:data` | Regenerate `src/assets/data/*.json` from `datasets/` |

### Data pipeline

Raw World Bank CSV exports live in `datasets/`. The `build:data` script (`tsx scripts/build-data.ts`) processes them into typed JSON assets committed to `src/assets/data/`. The generated JSON is committed so the static deployment needs no build-time network access.

## Tech stack

| | |
|---|---|
| Framework | Angular 22 (standalone components, signals, zoneless) |
| Language | TypeScript (strict + `noUncheckedIndexedAccess`) |
| Styling | SCSS (BEM, CSS custom properties) |
| Map projection | D3-geo (math only; Angular owns the SVG DOM) |
| Geo data | Natural Earth 110m TopoJSON via `world-atlas` |
| Test runner | Vitest via `@angular/build:unit-test` |
| Build | Angular CLI / esbuild |
