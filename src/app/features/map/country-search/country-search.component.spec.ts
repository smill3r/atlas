import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CountrySearchComponent } from './country-search.component';
import { Country } from '../../../core/data/models';

const MOCK_RESULTS: Country[] = [
  { code: 'FRA', numericId: '250', name: 'France', region: 'Europe & Central Asia', incomeGroup: 'High income' },
  { code: 'DEU', numericId: '276', name: 'Germany', region: 'Europe & Central Asia', incomeGroup: 'High income' },
];

@Component({
  template: `
    <atlas-country-search
      [query]="query"
      [results]="results"
      (queryChange)="lastQuery = $event"
      (pick)="lastPick = $event"
    />
  `,
  imports: [CountrySearchComponent],
})
class TestHost {
  query = '';
  results: Country[] = [];
  lastQuery = '';
  lastPick = '';
}

describe('CountrySearchComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
  });

  it('renders an input element', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
  });

  it('shows country names when results are provided', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.results = MOCK_RESULTS;
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('France');
    expect(text).toContain('Germany');
  });

  it('shows nothing extra when results are empty', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.results = [];
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('France');
  });

  it('emits queryChange when input changes', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'fra';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.lastQuery).toBe('fra');
  });
});
