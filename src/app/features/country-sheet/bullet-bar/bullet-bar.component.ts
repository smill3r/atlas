import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MARKER_PALETTE, uniqueBreaks } from '../../../core/data/color-scale';

const VIEWBOX_WIDTH = 200;
const VIEWBOX_HEIGHT = 14;
const DOT_RADIUS = 5;

/**
 * Horizontal bullet bar: quantile-band backgrounds with a dot at the country value.
 * Bands are derived from the indicator's quantile break points; the dot's x-position
 * is linearly interpolated between min and max.
 */
@Component({
  selector: 'atlas-bullet-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bullet-bar.component.html',
  styleUrl: './bullet-bar.component.scss',
})
export class BulletBarComponent {
  readonly value = input<number | null>(null);
  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly breaks = input<number[]>([]);
  readonly label = input<string>('');

  protected readonly viewboxWidth = VIEWBOX_WIDTH;
  protected readonly viewboxHeight = VIEWBOX_HEIGHT;
  protected readonly dotRadius = DOT_RADIUS;

  /**
   * Computes the colored band rectangles from the indicator's quantile breaks.
   * Deduplicates break points first to avoid zero-width bands at ceiling values.
   */
  protected readonly bands = computed(() => {
    const min = this.min();
    const max = this.max();
    const thresholds = uniqueBreaks(this.breaks());
    if (max === min || thresholds.length === 0) return [];

    const edges = [min, ...thresholds, max];
    const span = max - min;

    return edges.slice(0, -1).map((from, i) => {
      const to = edges[i + 1] ?? max;
      const x = ((from - min) / span) * VIEWBOX_WIDTH;
      const w = Math.max(0, ((to - from) / span) * VIEWBOX_WIDTH);
      return {
        x,
        w,
        color: MARKER_PALETTE[Math.min(i, MARKER_PALETTE.length - 1)] ?? '#ccc',
      };
    });
  });

  /**
   * Maps the current value to an x-coordinate within the viewbox, or null when
   * there is no data (dot is hidden).
   */
  protected readonly dotX = computed<number | null>(() => {
    const v = this.value();
    const min = this.min();
    const max = this.max();
    if (v === null || max === min) return null;
    return ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * VIEWBOX_WIDTH;
  });
}
