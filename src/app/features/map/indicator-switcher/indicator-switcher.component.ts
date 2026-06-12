import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IndicatorMeta } from '../../../core/data/models';

/** Emoji icon keyed by World Bank indicator code. */
const INDICATOR_ICONS: Record<string, string> = {
  'EG.ELC.ACCS.ZS': '⚡',
  'EN.GHG.CO2.MT.CE.AR5': '💨',
  'IT.NET.USER.ZS': '🌐',
  'SE.PRM.CMPT.FE.ZS': '📚',
};

/**
 * Tab-strip that lets the user switch between the four World Bank indicators.
 * Emits the selected indicator code on click; holds no selection state itself.
 */
@Component({
  selector: 'atlas-indicator-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './indicator-switcher.component.html',
  styleUrl: './indicator-switcher.component.scss',
})
export class IndicatorSwitcherComponent {
  readonly indicators = input<IndicatorMeta[]>([]);
  readonly selectedCode = input<string | null>(null);
  readonly select = output<string>();

  /**
   * Strips trailing parenthetical qualifiers from an indicator name for a
   * compact label — e.g. "Access to electricity (% of population)" → "Access to electricity".
   * @param indicator The full indicator metadata object.
   * @returns A shortened display name.
   */
  protected shortName(indicator: IndicatorMeta): string {
    return indicator.name.replace(/\s*\(.*?\)\s*$/, '');
  }

  /**
   * Returns an emoji icon for the given indicator code, falling back to a
   * generic chart emoji for unknown codes.
   * @param code World Bank indicator code.
   * @returns Emoji string.
   */
  protected icon(code: string): string {
    return INDICATOR_ICONS[code] ?? '📊';
  }
}
