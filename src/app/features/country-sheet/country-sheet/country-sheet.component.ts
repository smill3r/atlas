import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CountryProfile } from '../../../core/state/atlas-store';
import { SparklineComponent } from '../sparkline/sparkline.component';
import { BulletBarComponent } from '../bullet-bar/bullet-bar.component';

/**
 * Slide-in panel showing all four indicators for the selected country.
 * Renders as an absolute card on desktop and slides up as a bottom sheet on mobile.
 */
@Component({
  selector: 'atlas-country-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, SparklineComponent, BulletBarComponent],
  templateUrl: './country-sheet.component.html',
  styleUrl: './country-sheet.component.scss',
})
export class CountrySheetComponent {
  readonly profile = input<CountryProfile | null>(null);
  readonly year = input<number | null>(null);
  readonly yearStart = input<number | null>(null);
  readonly close = output<void>();

  /**
   * Converts the selected year into a zero-based index into the time-series
   * arrays, so child components can highlight the correct data point.
   */
  protected readonly markerIndex = computed(() => {
    const selectedYear = this.year();
    const seriesStartYear = this.yearStart();
    return selectedYear != null && seriesStartYear != null ? selectedYear - seriesStartYear : -1;
  });
}
