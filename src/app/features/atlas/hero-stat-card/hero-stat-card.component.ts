import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HeroStat } from '../../../core/state/atlas-store';

/**
 * Glanceable stat card rendered above the map. Displays a headline figure,
 * optional sub-line, and a thin progress bar for percentage-based indicators.
 * Accepts a `data-trend` attribute that drives color theming via CSS.
 */
@Component({
  selector: 'atlas-hero-stat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hero-stat-card.component.html',
  styleUrl: './hero-stat-card.component.scss',
})
export class HeroStatCardComponent {
  readonly stat = input<HeroStat | null>(null);

  /**
   * Clamps a percentage value to [0, 100] for safe use as a CSS width.
   * @param value Raw percentage, potentially outside the valid range.
   * @returns A value guaranteed to be between 0 and 100 inclusive.
   */
  protected clamp(value: number): number {
    return Math.min(100, Math.max(0, value));
  }
}
