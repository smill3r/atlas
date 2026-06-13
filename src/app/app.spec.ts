import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { INDICATOR_REPOSITORY } from './core/data/indicator-repository';
import { StaticHttpIndicatorRepository } from './core/data/static-http-indicator-repository';
import { routes } from './app.routes';

// JSDOM does not implement IntersectionObserver; stub it so RevealDirective
// can construct without throwing in the test environment.
class IntersectionObserverStub {
  observe(): void {}
  disconnect(): void {}
}

describe('App', () => {
  beforeEach(async () => {
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: IntersectionObserverStub,
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(routes),
        { provide: INDICATOR_REPOSITORY, useClass: StaticHttpIndicatorRepository },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});
