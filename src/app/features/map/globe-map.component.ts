import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { geoCentroid, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo';
import { CountryFeature } from '../../core/map/map-projection.service';

const SIZE = 480;
const RADIUS = SIZE / 2 - 6;
const SPIN_SPEED = 0.16; // degrees per frame for the idle auto-rotation
const DRAG_SENSITIVITY = 0.35; // degrees per pixel

/**
 * Spinning orthographic globe. Angular owns every <path>; d3 supplies the
 * projection math and re-projects on each rotation. Drag to spin, click to
 * select; the back hemisphere is clipped automatically at the horizon.
 */
@Component({
  selector: 'atlas-globe-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="globe"
      [attr.viewBox]="'0 0 ' + size + ' ' + size"
      role="group"
      aria-label="Spinning globe. Drag to rotate; use the search box to find a country."
      (pointerdown)="onDown($event)"
      (pointermove)="onMove($event)"
      (pointerup)="onUp()"
      (pointerleave)="onUp()"
    >
      <circle class="globe__ocean" [attr.cx]="size / 2" [attr.cy]="size / 2" [attr.r]="radius" />
      <path class="globe__graticule" [attr.d]="graticuleD()" />
      <g class="globe__countries">
        @for (shape of globeShapes(); track shape.numericId) {
          <path
            class="globe__country"
            [class.globe__country--has-data]="colors().has(shape.numericId)"
            [class.globe__country--selected]="shape.numericId === selectedNumericId()"
            [class.globe__country--hovered]="shape.numericId === hoveredNumericId()"
            [attr.d]="shape.d"
            [style.fill]="colors().get(shape.numericId) || null"
            tabindex="0"
            role="button"
            [attr.aria-label]="shape.name"
            (click)="onCountryClick(shape.numericId)"
            (keydown.enter)="select.emit(shape.numericId)"
            (mouseenter)="hover.emit(shape.numericId)"
            (mouseleave)="hover.emit(null)"
            (focus)="hover.emit(shape.numericId)"
            (blur)="hover.emit(null)"
          />
        }
      </g>
    </svg>
  `,
})
export class GlobeMapComponent {
  readonly features = input<CountryFeature[]>([]);
  readonly colors = input<Map<string, string>>(new Map());
  readonly selectedNumericId = input<string | null>(null);
  readonly hoveredNumericId = input<string | null>(null);

  readonly select = output<string>();
  readonly hover = output<string | null>();

  protected readonly size = SIZE;
  protected readonly radius = RADIUS;

  private readonly rotation = signal<[number, number]>([-10, -18]);
  private readonly autoSpin = signal(true);
  private readonly reducedMotion =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Pointer-drag bookkeeping (plain fields; not reactive state).
  private dragging = false;
  private dragged = false;
  private lastX = 0;
  private lastY = 0;
  private raf = 0;

  private readonly projection = computed(() =>
    geoOrthographic()
      .translate([SIZE / 2, SIZE / 2])
      .scale(RADIUS)
      .clipAngle(90)
      .rotate(this.rotation()),
  );

  protected readonly globeShapes = computed(() => {
    const path = geoPath(this.projection());
    return this.features()
      .map((f) => ({ numericId: f.numericId, name: f.name, d: path(f.feature) ?? '' }))
      .filter((s) => s.d); // null d == back-facing, drop it
  });

  protected readonly graticuleD = computed(
    () => geoPath(this.projection())(geoGraticule10()) ?? '',
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => cancelAnimationFrame(this.raf));

    if (!this.reducedMotion) {
      afterNextRender(() => this.startSpin());
    }

    // Bring a newly-selected country (e.g. picked from search) into view.
    effect(() => {
      const id = this.selectedNumericId();
      if (!id) return;
      const target = this.features().find((f) => f.numericId === id);
      if (!target) return;
      this.autoSpin.set(false);
      const [lon, lat] = geoCentroid(target.feature);
      this.rotateTo([-lon, -lat]);
    });
  }

  private startSpin(): void {
    const step = () => {
      if (!this.autoSpin()) return;
      this.rotation.update(([l, p]) => [(l + SPIN_SPEED) % 360, p]);
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  /** Eased rotation to a target orientation (instant under reduced motion). */
  private rotateTo(target: [number, number]): void {
    cancelAnimationFrame(this.raf);
    if (this.reducedMotion) {
      this.rotation.set(target);
      return;
    }
    const [fromL, fromP] = this.rotation();
    const dL = (((target[0] - fromL + 540) % 360) - 180); // shortest way round
    const dP = target[1] - fromP;
    const start = performance.now();
    const dur = 600;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; // easeInOutQuad
      this.rotation.set([fromL + dL * e, fromP + dP * e]);
      if (k < 1) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  protected onDown(event: PointerEvent): void {
    this.autoSpin.set(false);
    cancelAnimationFrame(this.raf);
    this.dragging = true;
    this.dragged = false;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    (event.currentTarget as Element).setPointerCapture(event.pointerId);
  }

  protected onMove(event: PointerEvent): void {
    if (!this.dragging) return;
    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    // Generous threshold so a finger tap (which jitters a few px) still counts
    // as a click rather than a drag.
    if (Math.abs(dx) + Math.abs(dy) > 6) this.dragged = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.rotation.update(([l, p]) => [
      l + dx * DRAG_SENSITIVITY,
      Math.max(-90, Math.min(90, p - dy * DRAG_SENSITIVITY)),
    ]);
  }

  protected onUp(): void {
    this.dragging = false;
  }

  protected onCountryClick(numericId: string): void {
    if (!this.dragged) this.select.emit(numericId);
  }
}
