import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AtlasStore } from '../../../core/state/atlas-store';
import { WorldMapComponent } from '../../map/world-map/world-map.component';
import { GlobeMapComponent } from '../../map/globe-map/globe-map.component';
import { IndicatorSwitcherComponent } from '../../map/indicator-switcher/indicator-switcher.component';
import { MapLegendComponent } from '../../map/map-legend/map-legend.component';
import { CountrySearchComponent } from '../../map/country-search/country-search.component';
import { CountrySheetComponent } from '../../country-sheet/country-sheet/country-sheet.component';
import { HeroStatCardComponent } from '../hero-stat-card/hero-stat-card.component';
import { RevealDirective } from '../../../shared/reveal.directive';

/** The single screen: folder + paper sheet holding the interactive map. */
@Component({
  selector: 'atlas-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    WorldMapComponent,
    GlobeMapComponent,
    IndicatorSwitcherComponent,
    MapLegendComponent,
    CountrySearchComponent,
    CountrySheetComponent,
    HeroStatCardComponent,
    RevealDirective,
  ],
  templateUrl: './atlas-page.component.html',
  styleUrl: './atlas-page.component.scss',
})
export class AtlasPageComponent {
  protected readonly store = inject(AtlasStore);

  protected readonly isLoading = computed(
    () => this.store.loadStatus() === 'loading' || this.store.shapes().length === 0,
  );

  protected reload(): void {
    location.reload();
  }

  /**
   * Truncates a source string to the first meaningful segment, stripping
   * everything after a comma, semicolon, or "uri:" token.
   * @param source Full source attribution string from indicator metadata.
   * @returns Shortened, human-readable source label.
   */
  protected shortSource(source: string): string {
    return source.split(/,|;|\buri:/i)[0]?.trim() ?? source;
  }
}
