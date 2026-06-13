import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CountrySheetComponent } from './country-sheet.component';
import { CountryProfile } from '../../../core/state/atlas-store';

const MOCK_PROFILE: CountryProfile = {
  country: {
    code: 'FRA',
    numericId: '250',
    name: 'France',
    region: 'Europe & Central Asia',
    incomeGroup: 'High income',
  },
  stats: [
    {
      meta: {
        code: 'EG.ELC.ACCS.ZS',
        name: 'Access to electricity',
        unit: '%',
        description: 'Desc',
        source: 'World Bank',
        min: 0,
        max: 100,
        breaks: [20, 40, 60, 80, 90],
      },
      series: [50, 60, 70, 80, 90, 100],
      value: 100,
      percentile: 95,
      trend: 'up',
    },
  ],
};

@Component({
  template: `
    <atlas-country-sheet
      [profile]="profile"
      [year]="year"
      [yearStart]="yearStart"
      (close)="closed = true"
    />
  `,
  imports: [CountrySheetComponent],
})
class TestHost {
  profile: CountryProfile | null = null;
  year: number | null = 2020;
  yearStart: number | null = 1960;
  closed = false;
}

describe('CountrySheetComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
  });

  it('renders nothing when profile is null', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sheet')).toBeNull();
  });

  it('renders the country name when a profile is provided', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.profile = MOCK_PROFILE;
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('France');
  });

  it('renders the region and income group', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.profile = MOCK_PROFILE;
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Europe & Central Asia');
    expect(text).toContain('High income');
  });

  it('shows the selected year in the eyebrow', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.profile = MOCK_PROFILE;
    fixture.componentInstance.year = 2022;
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('2022');
  });

  it('emits close when the close button is clicked', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.profile = MOCK_PROFILE;
    fixture.detectChanges();
    const closeBtn = fixture.nativeElement.querySelector('.sheet__close') as HTMLButtonElement;
    closeBtn.click();
    expect(fixture.componentInstance.closed).toBe(true);
  });

  it('renders the indicator name for each stat', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.profile = MOCK_PROFILE;
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Access to electricity');
  });

  it('shows the percentile rank when available', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.profile = MOCK_PROFILE;
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('95');
  });

  it('shows "no data" when stat value is null', () => {
    const profileWithNull: CountryProfile = {
      ...MOCK_PROFILE,
      stats: [
        {
          ...MOCK_PROFILE.stats[0]!,
          value: null,
          percentile: null,
          trend: null,
        },
      ],
    };
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.profile = profileWithNull;
    fixture.componentInstance.year = 2022;
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('no data');
  });
});
