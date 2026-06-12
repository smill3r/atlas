import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IndicatorMeta } from '../../core/data/models';

@Component({
  selector: 'atlas-indicator-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="switcher">
      <legend class="switcher__legend">Indicator</legend>
      <div class="switcher__options">
        @for (indicator of indicators(); track indicator.code) {
          <button
            type="button"
            class="switcher__option"
            [class.switcher__option--active]="indicator.code === selectedCode()"
            [attr.aria-pressed]="indicator.code === selectedCode()"
            (click)="select.emit(indicator.code)"
          >
            {{ shortName(indicator) }}
          </button>
        }
      </div>
    </fieldset>
  `,
})
export class IndicatorSwitcherComponent {
  readonly indicators = input<IndicatorMeta[]>([]);
  readonly selectedCode = input<string | null>(null);
  readonly select = output<string>();

  protected shortName(indicator: IndicatorMeta): string {
    // Trim the parenthetical unit for a tidy chip label.
    return indicator.name.replace(/\s*\(.*?\)\s*$/, '');
  }
}
