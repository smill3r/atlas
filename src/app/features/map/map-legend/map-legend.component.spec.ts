import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { MapLegendComponent } from './map-legend.component';
import { LegendRow } from '../../../core/data/color-scale';

const MOCK_ROWS: LegendRow[] = [
  { color: '#FFE45E', from: 0, to: 25 },
  { color: '#FFC23C', from: 25, to: 50 },
  { color: '#C71F66', from: 50, to: null },
];

@Component({
  template: `<atlas-map-legend [rows]="rows" [unit]="unit" />`,
  imports: [MapLegendComponent],
})
class TestHost {
  rows: LegendRow[] = MOCK_ROWS;
  unit = '% of population';
}

describe('MapLegendComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
  });

  it('renders the unit text', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('% of population');
  });

  it('shows numeric range values', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    // From first row: 0 and 25
    expect(text).toContain('25');
  });

  it('renders without error when rows array is empty', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.rows = [];
    fixture.detectChanges();
    expect(fixture.nativeElement).toBeTruthy();
  });

  it('renders rows with the correct color swatches', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    // Color swatches are typically inline-styled elements
    const coloredEls = el.querySelectorAll('[style*="background"]');
    expect(coloredEls.length).toBeGreaterThan(0);
  });
});
