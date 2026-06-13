import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AtlasStore } from '../../../core/state/atlas-store';
import { WorldMapComponent } from '../../map/world-map/world-map.component';
import { GlobeMapComponent } from '../../map/globe-map/globe-map.component';
import { IndicatorSwitcherComponent } from '../../map/indicator-switcher/indicator-switcher.component';
import { MapLegendComponent } from '../../map/map-legend/map-legend.component';
import { CountrySearchComponent } from '../../map/country-search/country-search.component';
import { HeroStatCardComponent } from '../hero-stat-card/hero-stat-card.component';
import { RevealDirective } from '../../../shared/reveal.directive';

/** The main screen: folder + paper sheet holding the interactive map. */
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
    HeroStatCardComponent,
    RevealDirective,
  ],
  templateUrl: './atlas-page.component.html',
  styleUrl: './atlas-page.component.scss',
})
export class AtlasPageComponent {
  protected readonly store = inject(AtlasStore);
  private readonly router = inject(Router);

  protected readonly isLoading = computed(
    () => this.store.loadStatus() === 'loading' || this.store.shapes().length === 0,
  );

  /** Navigate to the detail page for the country identified by its TopoJSON numeric ID. */
  protected selectCountry(numericId: string | null): void {
    if (!numericId) return;
    const code = this.store.getCountryCode(numericId);
    if (code) void this.router.navigate(['/country', code]);
  }

  /** Navigate to the detail page directly from a search result. */
  protected selectCountryByCode(code: string): void {
    void this.router.navigate(['/country', code]);
  }

  protected reload(): void {
    location.reload();
  }

  protected shortSource(source: string): string {
    return source.split(/,|;|\buri:/i)[0]?.trim() ?? source;
  }
}
