import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CountryShape, MAP_HEIGHT, MAP_WIDTH } from '../../../core/map/map-projection.service';

/**
 * Pure presentational SVG flat world map (Natural Earth projection).
 * Angular owns every <path>; d3 supplied the projected path strings at startup.
 * Emits numeric ISO ids on interaction — no selection state is held here.
 */
@Component({
  selector: 'atlas-world-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './world-map.component.html',
  styleUrl: './world-map.component.scss',
})
export class WorldMapComponent {
  readonly shapes = input<CountryShape[]>([]);
  readonly colors = input<Map<string, string>>(new Map());
  readonly selectedNumericId = input<string | null>(null);
  readonly hoveredNumericId = input<string | null>(null);

  readonly select = output<string>();
  readonly hover = output<string | null>();

  protected readonly mapWidth = MAP_WIDTH;
  protected readonly mapHeight = MAP_HEIGHT;
}
