import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { SparklineComponent } from './sparkline.component';

@Component({
  template: `
    <atlas-sparkline [values]="values" [markerIndex]="markerIndex" [label]="label" />
  `,
  imports: [SparklineComponent],
})
class TestHost {
  values: (number | null)[] = [];
  markerIndex = -1;
  label = 'test';
}

describe('SparklineComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
  });

  it('renders an SVG element', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.values = [1, 2, 3];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('renders no polylines when values are empty', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.values = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('polyline').length).toBe(0);
  });

  it('renders one segment for a contiguous series', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.values = [10, 20, 30];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('polyline').length).toBe(1);
  });

  it('renders two segments when a null splits the series', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.values = [10, null, 30];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('polyline').length).toBe(2);
  });

  it('shows a marker line when markerIndex is valid', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.values = [10, 20, 30];
    fixture.componentInstance.markerIndex = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('line.sparkline__marker')).toBeTruthy();
  });

  it('hides the marker line when markerIndex is -1', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.values = [10, 20, 30];
    fixture.componentInstance.markerIndex = -1;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('line.sparkline__marker')).toBeNull();
  });

  it('sets the aria-label on the SVG', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.values = [1, 2];
    fixture.componentInstance.label = 'electricity trend';
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('aria-label')).toBe('electricity trend');
  });
});
