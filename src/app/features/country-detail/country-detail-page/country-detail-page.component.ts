import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AtlasStore } from '../../../core/state/atlas-store';
import { IndicatorMeta } from '../../../core/data/models';
import { LineChartComponent } from '../line-chart/line-chart.component';
import { BulletBarComponent } from '../../country-sheet/bullet-bar/bullet-bar.component';

const ICONS: Record<string, string> = {
  'EG.ELC.ACCS.ZS': '⚡',
  'EN.GHG.CO2.MT.CE.AR5': '💨',
  'IT.NET.USER.ZS': '🌐',
  'SE.PRM.CMPT.FE.ZS': '📚',
};

/** Chart stroke color per indicator, chosen for contrast on the cream paper. */
const COLORS: Record<string, string> = {
  'EG.ELC.ACCS.ZS': '#B05E00',
  'EN.GHG.CO2.MT.CE.AR5': '#C71F66',
  'IT.NET.USER.ZS': '#1F6F6B',
  'SE.PRM.CMPT.FE.ZS': '#7B3F8C',
};

/**
 * Full-page detail view for a single country showing time-series line charts
 * for all four indicators plus the world average comparison.
 */
@Component({
  selector: 'atlas-country-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, LineChartComponent, BulletBarComponent],
  templateUrl: './country-detail-page.component.html',
  styleUrl: './country-detail-page.component.scss',
})
export class CountryDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(AtlasStore);

  protected readonly yearStart = computed(() => this.store.manifest()?.yearStart ?? 1960);
  protected readonly yearEnd = computed(() => this.store.manifest()?.yearEnd ?? 2024);

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.store.selectCountryByCode(code);
    } else {
      void this.router.navigate(['/']);
    }
  }

  protected icon(code: string): string {
    return ICONS[code] ?? '📊';
  }

  protected chartColor(code: string): string {
    return COLORS[code] ?? '#2b2622';
  }

  protected chartYMin(meta: IndicatorMeta): number {
    return meta.unit.includes('%') ? 0 : meta.min;
  }

  protected chartYMax(meta: IndicatorMeta): number {
    return meta.unit.includes('%') ? 100 : Math.max(meta.max, 1);
  }

  protected chartLabel(countryName: string, metaName: string): string {
    return `${countryName}: ${metaName} over time vs world average`;
  }
}
