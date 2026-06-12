import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CountryProfile } from '../../core/state/atlas-store';
import { SparklineComponent } from './sparkline.component';

/** The "technical sheet" panel for one country: the four indicators at a glance. */
@Component({
  selector: 'atlas-country-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, SparklineComponent],
  template: `
    @let p = profile();
    @if (p) {
      <aside class="sheet" role="region" [attr.aria-label]="p.country.name + ' indicators'">
        <header class="sheet__header">
          <div>
            <p class="sheet__eyebrow">Technical sheet · {{ year() }}</p>
            <h2 class="sheet__title">{{ p.country.name }}</h2>
            <p class="sheet__meta">{{ p.country.region }} · {{ p.country.incomeGroup }}</p>
          </div>
          <button type="button" class="sheet__close" aria-label="Close" (click)="close.emit()">
            ×
          </button>
        </header>

        <ul class="sheet__stats">
          @for (stat of p.stats; track stat.meta.code) {
            <li class="stat">
              <p class="stat__name">{{ stat.meta.name }}</p>
              <p class="stat__value">
                @if (stat.value !== null) {
                  <span class="stat__number">{{ stat.value | number: '1.0-1' }}</span>
                  <span class="stat__unit">{{ stat.meta.unit }}</span>
                } @else {
                  <span class="stat__nodata">no data for {{ year() }}</span>
                }
              </p>
              <atlas-sparkline
                [values]="stat.series"
                [markerIndex]="markerIndex()"
                [label]="stat.meta.name + ' over time'"
              />
            </li>
          }
        </ul>
      </aside>
    }
  `,
})
export class CountrySheetComponent {
  readonly profile = input<CountryProfile | null>(null);
  readonly year = input<number | null>(null);
  readonly yearStart = input<number | null>(null);
  readonly close = output<void>();

  protected readonly markerIndex = computed(() => {
    const y = this.year();
    const start = this.yearStart();
    return y != null && start != null ? y - start : -1;
  });
}
