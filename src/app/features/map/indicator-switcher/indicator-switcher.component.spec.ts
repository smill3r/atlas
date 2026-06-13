import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { IndicatorSwitcherComponent } from './indicator-switcher.component';
import { IndicatorMeta } from '../../../core/data/models';

const MOCK_INDICATORS: IndicatorMeta[] = [
  {
    code: 'EG.ELC.ACCS.ZS',
    name: 'Access to electricity (% of population)',
    unit: '% of population',
    description: 'desc',
    source: 'World Bank',
    min: 0,
    max: 100,
    breaks: [20, 40, 60, 80, 90],
  },
  {
    code: 'IT.NET.USER.ZS',
    name: 'Individuals using the Internet (% of population)',
    unit: '% of population',
    description: 'desc',
    source: 'World Bank',
    min: 0,
    max: 100,
    breaks: [5, 20, 40, 65, 80],
  },
];

@Component({
  template: `
    <atlas-indicator-switcher
      [indicators]="indicators"
      [selectedCode]="selectedCode"
      (select)="onSelect($event)"
    />
  `,
  imports: [IndicatorSwitcherComponent],
})
class TestHost {
  indicators = MOCK_INDICATORS;
  selectedCode: string | null = null;
  selected: string | null = null;
  onSelect(code: string): void {
    this.selected = code;
  }
}

describe('IndicatorSwitcherComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
  });

  it('renders one button per indicator', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('marks the selected button with aria-pressed=true', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.selectedCode = 'EG.ELC.ACCS.ZS';
    fixture.detectChanges();
    const activeBtn = fixture.nativeElement.querySelector('[aria-pressed="true"]');
    expect(activeBtn).toBeTruthy();
  });

  it('emits the code when a button is clicked', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    (buttons[1] as HTMLButtonElement).click();
    expect(fixture.componentInstance.selected).toBe('IT.NET.USER.ZS');
  });

  it('strips parenthetical qualifiers from names', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Access to electricity');
    expect(text).not.toContain('(% of population)');
  });

  it('shows an icon for each indicator button', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('⚡');
  });
});
