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
import { CountryFeature } from '../../../core/map/map-projection.service';

const VIEWBOX_SIZE = 480;
const GLOBE_RADIUS = VIEWBOX_SIZE / 2 - 6;
const AUTO_SPIN_DEGREES_PER_FRAME = 0.16;
const DRAG_DEGREES_PER_PIXEL = 0.35;

/**
 * Spinning orthographic globe. Angular owns every <path>; d3 supplies the
 * projection math and re-projects on each rotation tick. Drag to spin; click to
 * select. The back hemisphere is clipped automatically at the horizon.
 */
@Component({
  selector: 'atlas-globe-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './globe-map.component.html',
  styleUrl: './globe-map.component.scss',
})
export class GlobeMapComponent {
  readonly features = input<CountryFeature[]>([]);
  readonly colors = input<Map<string, string>>(new Map());
  readonly selectedNumericId = input<string | null>(null);
  readonly hoveredNumericId = input<string | null>(null);

  readonly select = output<string>();
  readonly hover = output<string | null>();

  protected readonly viewboxSize = VIEWBOX_SIZE;
  protected readonly globeRadius = GLOBE_RADIUS;

  private readonly rotation = signal<[number, number]>([-10, -18]);
  private readonly isAutoSpinning = signal(true);

  // Checked once at construction; does not need to be reactive.
  private readonly prefersReducedMotion =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Pointer-drag bookkeeping (plain fields; not reactive state).
  private isDragging = false;
  private hasDragged = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private animationFrameId = 0;

  private readonly projection = computed(() =>
    geoOrthographic()
      .translate([VIEWBOX_SIZE / 2, VIEWBOX_SIZE / 2])
      .scale(GLOBE_RADIUS)
      .clipAngle(90)
      .rotate(this.rotation()),
  );

  /** Re-projected country paths for the current rotation. Null paths (back hemisphere) are dropped. */
  protected readonly globeShapes = computed(() => {
    const path = geoPath(this.projection());
    return this.features()
      .map((f) => ({ numericId: f.numericId, name: f.name, d: path(f.feature) ?? '' }))
      .filter((s) => s.d);
  });

  protected readonly graticulePathData = computed(
    () => geoPath(this.projection())(geoGraticule10()) ?? '',
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => cancelAnimationFrame(this.animationFrameId));

    if (!this.prefersReducedMotion) {
      afterNextRender(() => this.startAutoSpin());

      // Pause auto-spin while the tab is hidden to save battery.
      const onVisibilityChange = (): void => {
        if (document.hidden) {
          this.isAutoSpinning.set(false);
          cancelAnimationFrame(this.animationFrameId);
        } else if (!this.isDragging) {
          this.isAutoSpinning.set(true);
          this.startAutoSpin();
        }
      };
      document.addEventListener('visibilitychange', onVisibilityChange);
      destroyRef.onDestroy(() =>
        document.removeEventListener('visibilitychange', onVisibilityChange),
      );
    }

    // Bring a newly-selected country (e.g. picked from search) into view.
    effect(() => {
      const id = this.selectedNumericId();
      if (!id) return;
      const target = this.features().find((f) => f.numericId === id);
      if (!target) return;
      this.isAutoSpinning.set(false);
      const [lon, lat] = geoCentroid(target.feature);
      this.animateTo([-lon, -lat]);
    });
  }

  private startAutoSpin(): void {
    const tick = (): void => {
      if (!this.isAutoSpinning()) return;
      this.rotation.update(([lon, lat]) => [
        (lon + AUTO_SPIN_DEGREES_PER_FRAME) % 360,
        lat,
      ]);
      this.animationFrameId = requestAnimationFrame(tick);
    };
    this.animationFrameId = requestAnimationFrame(tick);
  }

  /**
   * Eased rotation to a target [longitude, latitude] orientation.
   * Instant under reduced-motion preference; easeInOutQuad otherwise.
   * @param target Destination [longitude, latitude] rotation tuple.
   */
  private animateTo(target: [number, number]): void {
    cancelAnimationFrame(this.animationFrameId);

    if (this.prefersReducedMotion) {
      this.rotation.set(target);
      return;
    }

    const [fromLon, fromLat] = this.rotation();
    // Take the shortest arc around the globe.
    const deltaLon = (((target[0] - fromLon + 540) % 360) - 180);
    const deltaLat = target[1] - fromLat;
    const startTime = performance.now();
    const duration = 600;

    const step = (now: number): void => {
      const progress = Math.min(1, (now - startTime) / duration);
      // easeInOutQuad
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
      this.rotation.set([fromLon + deltaLon * eased, fromLat + deltaLat * eased]);
      if (progress < 1) this.animationFrameId = requestAnimationFrame(step);
    };

    this.animationFrameId = requestAnimationFrame(step);
  }

  protected onPointerDown(event: PointerEvent): void {
    this.isAutoSpinning.set(false);
    cancelAnimationFrame(this.animationFrameId);
    this.isDragging = true;
    this.hasDragged = false;
    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isDragging) return;

    const dx = event.clientX - this.lastPointerX;
    const dy = event.clientY - this.lastPointerY;

    // Generous threshold so a finger tap (which jitters a few px) still counts
    // as a click rather than a drag.
    if (Math.abs(dx) + Math.abs(dy) > 6) this.hasDragged = true;

    this.lastPointerX = event.clientX;
    this.lastPointerY = event.clientY;

    this.rotation.update(([lon, lat]) => [
      lon + dx * DRAG_DEGREES_PER_PIXEL,
      Math.max(-90, Math.min(90, lat - dy * DRAG_DEGREES_PER_PIXEL)),
    ]);
  }

  protected onPointerUp(): void {
    this.isDragging = false;
  }

  protected onCountryClick(numericId: string): void {
    if (!this.hasDragged) this.select.emit(numericId);
  }
}
