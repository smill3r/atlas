import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { LineChartComponent } from './line-chart.component';

@Component({
  template: `
    <atlas-line-chart
      [countrySeries]="countrySeries"
      [globalSeries]="globalSeries"
      [yearStart]="yearStart"
      [yearEnd]="yearEnd"
      [selectedYear]="selectedYear"
      [yMin]="yMin"
      [yMax]="yMax"
      [color]="color"
      [label]="label"
    />
  `,
  imports: [LineChartComponent],
})
class TestHost {
  countrySeries: (number | null)[] = [];
  globalSeries: (number | null)[] = [];
  yearStart = 1960;
  yearEnd = 2024;
  selectedYear: number | null = null;
  yMin = 0;
  yMax = 100;
  color = '#2b2622';
  label = 'test chart';
}

describe('LineChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
  });

  it('renders an SVG element', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.countrySeries = [10, 20, 30];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('renders the country path when series has data', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.countrySeries = [10, 20, 30];
    fixture.detectChanges();
    const path = fixture.nativeElement.querySelector('.lc__country');
    expect(path).toBeTruthy();
    expect(path.getAttribute('d')).toContain('M');
  });

  it('renders no country path for empty series', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.countrySeries = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lc__country')).toBeNull();
  });

  it('renders the world average path when global series has data', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.countrySeries = [10, 20];
    fixture.componentInstance.globalSeries = [15, 25];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lc__global')).toBeTruthy();
  });

  it('renders a marker line for the selected year within range', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.countrySeries = Array(65).fill(50);
    fixture.componentInstance.yearStart = 1960;
    fixture.componentInstance.yearEnd = 2024;
    fixture.componentInstance.selectedYear = 2000;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lc__marker')).toBeTruthy();
  });

  it('renders no marker when selectedYear is null', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.countrySeries = [10, 20];
    fixture.componentInstance.selectedYear = null;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lc__marker')).toBeNull();
  });

  it('renders a dot at the selected year when country has a value', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.countrySeries = Array(65).fill(75);
    fixture.componentInstance.yearStart = 1960;
    fixture.componentInstance.yearEnd = 2024;
    fixture.componentInstance.selectedYear = 2000;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lc__dot')).toBeTruthy();
  });

  it('renders x-axis decade labels', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.countrySeries = Array(65).fill(50);
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelectorAll('.lc__label--x');
    expect(labels.length).toBeGreaterThan(0);
    const text = Array.from(labels)
      .map((l) => (l as HTMLElement).textContent)
      .join('');
    expect(text).toContain('1960');
  });

  it('renders y-axis labels', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.countrySeries = [10, 20, 30];
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelectorAll('.lc__label--y');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('renders two path segments when series has a null gap', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.countrySeries = [10, null, 30];
    fixture.detectChanges();
    const path = fixture.nativeElement.querySelector('.lc__country');
    const d = path?.getAttribute('d') ?? '';
    expect((d.match(/M/g) ?? []).length).toBe(2);
  });

  it('sets the aria-label via the figure element', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.countrySeries = [10];
    fixture.componentInstance.label = 'France electricity over time';
    fixture.detectChanges();
    const fig = fixture.nativeElement.querySelector('figure');
    expect(fig?.getAttribute('aria-label')).toBe('France electricity over time');
  });

  it('formats large y-axis values with k suffix', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.countrySeries = [1000, 5000, 10000];
    fixture.componentInstance.yMin = 0;
    fixture.componentInstance.yMax = 10000;
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelectorAll('.lc__label--y');
    const text = Array.from(labels)
      .map((l) => (l as HTMLElement).textContent)
      .join('');
    expect(text).toContain('k');
  });
});
