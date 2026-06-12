import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const W = 240;
const H = 52;
const PAD = 4;

/** Tiny time-series line for one indicator. Nulls break the line into gaps. */
@Component({
  selector: 'atlas-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="sparkline"
      [attr.viewBox]="'0 0 ' + w + ' ' + h"
      preserveAspectRatio="none"
      role="img"
      [attr.aria-label]="label()"
    >
      @for (seg of segments(); track $index) {
        <polyline class="sparkline__line" [attr.points]="seg" />
      }
      @if (markerX() !== null) {
        <line
          class="sparkline__marker"
          [attr.x1]="markerX()"
          [attr.x2]="markerX()"
          y1="0"
          [attr.y2]="h"
        />
      }
    </svg>
  `,
})
export class SparklineComponent {
  readonly values = input<(number | null)[]>([]);
  readonly markerIndex = input<number>(-1);
  readonly label = input<string>('');

  protected readonly w = W;
  protected readonly h = H;

  private readonly bounds = computed(() => {
    const finite = this.values().filter((v): v is number => v !== null);
    return { min: Math.min(...finite), max: Math.max(...finite), n: this.values().length };
  });

  /** Split into polyline segments so nulls create visible gaps. */
  protected readonly segments = computed<string[]>(() => {
    const vals = this.values();
    const { min, max, n } = this.bounds();
    if (n < 2 || !Number.isFinite(min) || !Number.isFinite(max)) return [];
    const span = max - min || 1;
    const segs: string[] = [];
    let current: string[] = [];
    vals.forEach((v, i) => {
      if (v === null) {
        if (current.length) segs.push(current.join(' '));
        current = [];
        return;
      }
      const x = PAD + (i / (n - 1)) * (W - 2 * PAD);
      const y = PAD + (1 - (v - min) / span) * (H - 2 * PAD);
      current.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    });
    if (current.length) segs.push(current.join(' '));
    return segs;
  });

  protected readonly markerX = computed<number | null>(() => {
    const i = this.markerIndex();
    const { n } = this.bounds();
    if (i < 0 || n < 2) return null;
    return PAD + (i / (n - 1)) * (W - 2 * PAD);
  });
}
