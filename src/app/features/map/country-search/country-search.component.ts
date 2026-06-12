import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Country } from '../../../core/data/models';

/**
 * Autocomplete search input for finding a country by name.
 * Emits a query string on each keystroke and a country code when the user
 * selects a result. Holds no internal state — fully controlled by the parent.
 */
@Component({
  selector: 'atlas-country-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './country-search.component.html',
  styleUrl: './country-search.component.scss',
})
export class CountrySearchComponent {
  readonly query = input<string>('');
  readonly results = input<Country[]>([]);
  readonly queryChange = output<string>();
  readonly pick = output<string>();
}
