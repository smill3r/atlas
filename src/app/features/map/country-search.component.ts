import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Country } from '../../core/data/models';

@Component({
  selector: 'atlas-country-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search">
      <label class="search__label" for="country-search">Find a country</label>
      <input
        id="country-search"
        class="search__input"
        type="text"
        autocomplete="off"
        placeholder="Type a country name…"
        [value]="query()"
        (input)="queryChange.emit($any($event.target).value)"
        role="combobox"
        aria-expanded="true"
        aria-controls="search-results"
      />
      @if (results().length) {
        <ul id="search-results" class="search__results" role="listbox">
          @for (country of results(); track country.code) {
            <li class="search__result" role="option" [attr.aria-selected]="false">
              <button type="button" class="search__pick" (click)="pick.emit(country.code)">
                {{ country.name }}
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class CountrySearchComponent {
  readonly query = input<string>('');
  readonly results = input<Country[]>([]);
  readonly queryChange = output<string>();
  readonly pick = output<string>();
}
