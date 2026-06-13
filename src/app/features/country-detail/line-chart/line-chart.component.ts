import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const VW = 600;
const VH = 180;
const ML = 44; // left margin for y-axis labels
const MR = 8;
const MT = 8;
const MB = 28; // bottom margin for x-axis labels

/**
 * Full-width time-series line chart comparing a country's series against the
 * world average. Null entries break the line into visible segments.
 */
@Component({
  selector: 'atlas-line-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent {
  readonly countrySeries = input<(number | null)[]>([]);
  readonly globalSeries = input<(number | null)[]>([]);
  readonly yearStart = input<number>(1960);
  readonly yearEnd = input<number>(2024);
  readonly selectedYear = input<number | null>(null);
  readonly yMin = input<number>(0);
  readonly yMax = input<number>(100);
  readonly color = input<string>('#2b2622');
  readonly label = input<string>('');
  readonly unit = input<string>('');

  protected readonly vw = VW;
  protected readonly vh = VH;
  protected readonly innerTop = MT;
  protected readonly innerBottom = VH - MB;
  protected readonly innerLeft = ML;
  protected readonly innerRight = VW - MR;

  private px(yearIdx: number, total: number): number {
    return ML + (yearIdx / Math.max(1, total - 1)) * (VW - ML - MR);
  }

  private py(value: number, yMin: number, yMax: number): number {
    const span = yMax - yMin || 1;
    return MT + (1 - (value - yMin) / span) * (VH - MT - MB);
  }

  private linePath(values: (number | null)[], yMin: number, yMax: number): string {
    let d = '';
    let penDown = false;
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (v === null || v === undefined) {
        penDown = false;
        continue;
      }
      const x = this.px(i, values.length).toFixed(1);
      const y = this.py(v, yMin, yMax).toFixed(1);
      d += penDown ? ` L ${x} ${y}` : `M ${x} ${y}`;
      penDown = true;
    }
    return d;
  }

  protected readonly countryPath = computed(() =>
    this.linePath(this.countrySeries(), this.yMin(), this.yMax()),
  );

  protected readonly globalPath = computed(() =>
    this.linePath(this.globalSeries(), this.yMin(), this.yMax()),
  );

  protected readonly xTicks = computed(() => {
    const start = this.yearStart();
    const end = this.yearEnd();
    const total = end - start + 1;
    const ticks: { x: number; label: string }[] = [];
    const firstDecade = Math.ceil(start / 10) * 10;
    for (let yr = firstDecade; yr <= end; yr += 10) {
      ticks.push({ x: this.px(yr - start, total), label: String(yr) });
    }
    return ticks;
  });

  protected readonly yTicks = computed(() => {
    const min = this.yMin();
    const max = this.yMax();
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => {
      const v = min + (i / count) * (max - min);
      const label = Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0);
      return { y: this.py(v, min, max), label };
    });
  });

  protected readonly markerX = computed<number | null>(() => {
    const yr = this.selectedYear();
    const start = this.yearStart();
    const end = this.yearEnd();
    if (yr === null || yr < start || yr > end) return null;
    const total = end - start + 1;
    return this.px(yr - start, total);
  });

  protected readonly markerDot = computed<{ x: number; y: number } | null>(() => {
    const mx = this.markerX();
    const yr = this.selectedYear();
    if (mx === null || yr === null) return null;
    const v = this.countrySeries()[yr - this.yearStart()] ?? null;
    if (v === null) return null;
    return { x: mx, y: this.py(v, this.yMin(), this.yMax()) };
  });
}
