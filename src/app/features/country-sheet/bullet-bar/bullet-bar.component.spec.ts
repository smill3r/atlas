import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { BulletBarComponent } from './bullet-bar.component';

@Component({
  template: `
    <atlas-bullet-bar
      [value]="value"
      [min]="min"
      [max]="max"
      [breaks]="breaks"
      [label]="label"
    />
  `,
  imports: [BulletBarComponent],
})
class TestHost {
  value: number | null = null;
  min = 0;
  max = 100;
  breaks: number[] = [25, 50, 75];
  label = 'test bar';
}

describe('BulletBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
  });

  it('renders an SVG element', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.value = 50;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });

  it('renders one rect per break segment plus an outline rect', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.value = 50;
    fixture.componentInstance.breaks = [25, 50, 75];
    fixture.detectChanges();
    // 3 breaks → 4 band segments + 1 border rect = 5 rects
    expect(fixture.nativeElement.querySelectorAll('rect').length).toBe(5);
  });

  it('renders no dot when value is null', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.value = null;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('circle')).toBeNull();
  });

  it('renders a dot when value is set', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.value = 75;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('circle')).toBeTruthy();
  });

  it('places the dot at a positive x for value within range', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.value = 100;
    fixture.componentInstance.min = 0;
    fixture.componentInstance.max = 100;
    fixture.detectChanges();
    const dot = fixture.nativeElement.querySelector('circle') as SVGCircleElement;
    expect(Number(dot.getAttribute('cx'))).toBeGreaterThan(0);
  });

  it('handles duplicate break values without error', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.breaks = [100, 100, 100];
    fixture.componentInstance.value = 50;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
  });
});
