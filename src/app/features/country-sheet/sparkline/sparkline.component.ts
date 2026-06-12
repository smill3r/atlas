import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const VIEWBOX_WIDTH = 240;
const VIEWBOX_HEIGHT = 52;
const PADDING = 4;

/**
 * Tiny time-series sparkline for one indicator. Null values break the line
 * into discrete segments so data gaps are clearly visible rather than bridged.
 */
@Component({
  selector: 'atlas-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sparkline.component.html',
  styleUrl: './sparkline.component.scss',
})
export class SparklineComponent {
  readonly values = input<(number | null)[]>([]);
  readonly markerIndex = input<number>(-1);
  readonly label = input<string>('');

  protected readonly viewboxWidth = VIEWBOX_WIDTH;
  protected readonly viewboxHeight = VIEWBOX_HEIGHT;

  private readonly seriesBounds = computed(() => {
    const finiteSamples = this.values().filter((v): v is number => v !== null);
    return {
      min: Math.min(...finiteSamples),
      max: Math.max(...finiteSamples),
      sampleCount: this.values().length,
    };
  });

  /**
   * Splits the value series into polyline point strings, one string per
   * contiguous non-null run. Null entries terminate the current segment,
   * producing a visible gap in the rendered line.
   */
  protected readonly segments = computed<string[]>(() => {
    const values = this.values();
    const { min, max, sampleCount } = this.seriesBounds();

    if (sampleCount < 2 || !Number.isFinite(min) || !Number.isFinite(max)) return [];

    const valueSpan = max - min || 1;
    const segments: string[] = [];
    let currentSegment: string[] = [];

    values.forEach((v, i) => {
      if (v === null) {
        if (currentSegment.length) segments.push(currentSegment.join(' '));
        currentSegment = [];
        return;
      }
      const x = PADDING + (i / (sampleCount - 1)) * (VIEWBOX_WIDTH - 2 * PADDING);
      const y = PADDING + (1 - (v - min) / valueSpan) * (VIEWBOX_HEIGHT - 2 * PADDING);
      currentSegment.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    });

    if (currentSegment.length) segments.push(currentSegment.join(' '));
    return segments;
  });

  /**
   * Converts the marker index to an x-coordinate for the year indicator line.
   * Returns null when the index is invalid (marker is hidden).
   */
  protected readonly markerX = computed<number | null>(() => {
    const index = this.markerIndex();
    const { sampleCount } = this.seriesBounds();
    if (index < 0 || sampleCount < 2) return null;
    return PADDING + (index / (sampleCount - 1)) * (VIEWBOX_WIDTH - 2 * PADDING);
  });
}
