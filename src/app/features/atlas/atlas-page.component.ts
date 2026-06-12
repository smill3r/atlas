import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AtlasStore } from '../../core/state/atlas-store';
import { WorldMapComponent } from '../map/world-map.component';
import { IndicatorSwitcherComponent } from '../map/indicator-switcher.component';
import { MapLegendComponent } from '../map/map-legend.component';
import { CountrySearchComponent } from '../map/country-search.component';
import { CountrySheetComponent } from '../country-sheet/country-sheet.component';

/** The single screen: folder + paper sheet holding the interactive map. */
@Component({
  selector: 'atlas-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    WorldMapComponent,
    IndicatorSwitcherComponent,
    MapLegendComponent,
    CountrySearchComponent,
    CountrySheetComponent,
  ],
  template: `
    <div class="folder">
      <div class="paper">
        <span class="paper__clip" aria-hidden="true"></span>

        <header class="paper__head">
          <div class="paper__titleblock">
            <p class="paper__eyebrow">World Development Indicators · World Bank</p>
            <h1 class="paper__title">The State of the World</h1>
            <p class="paper__sub">
              Pick an indicator, scrub the year, click a country to open its sheet.
            </p>
          </div>
          <atlas-country-search
            [query]="store.searchQuery()"
            [results]="store.searchResults()"
            (queryChange)="store.setSearch($event)"
            (pick)="store.selectCountryByCode($event)"
          />
        </header>

        <div class="paper__controls">
          <atlas-indicator-switcher
            [indicators]="store.manifest()?.indicators ?? []"
            [selectedCode]="store.selectedIndicatorCode()"
            (select)="store.selectIndicator($event)"
          />
          @if (store.selectedYear(); as year) {
            <div class="scrubber">
              <label class="scrubber__label" for="year">Year</label>
              <input
                id="year"
                class="scrubber__range"
                type="range"
                [min]="store.manifest()?.yearStart ?? 1960"
                [max]="store.manifest()?.yearEnd ?? 2025"
                [value]="year"
                (input)="store.selectYear($any($event.target).valueAsNumber)"
              />
              <output class="scrubber__value">{{ year }}</output>
            </div>
          }
        </div>

        <div class="stage">
          <atlas-world-map
            [shapes]="store.shapes()"
            [colors]="store.colorByNumericId()"
            [selectedNumericId]="store.selectedNumericId()"
            [hoveredNumericId]="store.hoveredNumericId()"
            (select)="store.selectCountryByNumericId($event)"
            (hover)="store.hover($event)"
          />

          @if (store.activeIndicator(); as meta) {
            <atlas-map-legend [rows]="store.legend()" [unit]="meta.unit" />
          }

          @if (store.hoveredInfo(); as info) {
            <p class="readout" aria-live="polite">
              <strong>{{ info.name }}</strong>
              @if (info.value !== null) {
                — {{ info.value | number: '1.0-1' }} {{ info.unit }}
              } @else {
                — no data
              }
            </p>
          }

          @if (isLoading()) {
            <div class="overlay overlay--loading" role="status">
              <span class="overlay__spinner" aria-hidden="true"></span>
              <p>Drawing the world…</p>
            </div>
          } @else if (store.loadStatus() === 'error') {
            <div class="overlay overlay--error" role="alert">
              <p>Couldn’t load the data.</p>
              <button type="button" class="overlay__retry" (click)="reload()">Retry</button>
            </div>
          }
        </div>

        <atlas-country-sheet
          [profile]="store.selectedProfile()"
          [year]="store.selectedYear()"
          [yearStart]="store.manifest()?.yearStart ?? null"
          (close)="store.closeSheet()"
        />
      </div>
    </div>
  `,
})
export class AtlasPageComponent {
  protected readonly store = inject(AtlasStore);

  protected readonly isLoading = computed(
    () => this.store.loadStatus() === 'loading' || this.store.shapes().length === 0,
  );

  protected reload(): void {
    location.reload();
  }
}
