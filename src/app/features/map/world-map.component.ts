import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CountryShape, MAP_HEIGHT, MAP_WIDTH } from '../../core/map/map-projection.service';

/**
 * Pure presentational SVG world map. Angular owns every <path>; d3 only
 * supplied the projected path strings. Emits numeric ISO ids on interaction.
 */
@Component({
  selector: 'atlas-world-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="world-map"
      [attr.viewBox]="'0 0 ' + width + ' ' + height"
      role="group"
      aria-label="World map. Use Tab to move between countries and Enter to select one."
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="marker-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" />
        </filter>
      </defs>
      <g class="world-map__countries" filter="url(#marker-rough)">
        @for (shape of shapes(); track shape.numericId) {
          <path
            class="world-map__country"
            [class.world-map__country--has-data]="colors().has(shape.numericId)"
            [class.world-map__country--selected]="shape.numericId === selectedNumericId()"
            [class.world-map__country--hovered]="shape.numericId === hoveredNumericId()"
            [attr.d]="shape.d"
            [style.fill]="colors().get(shape.numericId) || null"
            [attr.tabindex]="0"
            role="button"
            [attr.aria-label]="shape.name"
            [attr.aria-pressed]="shape.numericId === selectedNumericId()"
            (click)="select.emit(shape.numericId)"
            (keydown.enter)="select.emit(shape.numericId)"
            (keydown.space)="$event.preventDefault(); select.emit(shape.numericId)"
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
export class WorldMapComponent {
  readonly shapes = input<CountryShape[]>([]);
  readonly colors = input<Map<string, string>>(new Map());
  readonly selectedNumericId = input<string | null>(null);
  readonly hoveredNumericId = input<string | null>(null);

  readonly select = output<string>();
  readonly hover = output<string | null>();

  protected readonly width = MAP_WIDTH;
  protected readonly height = MAP_HEIGHT;
}
