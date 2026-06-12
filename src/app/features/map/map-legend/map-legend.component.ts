import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LegendRow } from '../../../core/data/color-scale';

/**
 * Color-swatch legend overlaid on the map stage. Each row pairs a color sample
 * with the numeric range it represents in the choropleth scale.
 */
@Component({
  selector: 'atlas-map-legend',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  templateUrl: './map-legend.component.html',
  styleUrl: './map-legend.component.scss',
})
export class MapLegendComponent {
  readonly rows = input<LegendRow[]>([]);
  readonly unit = input<string>('');
}
