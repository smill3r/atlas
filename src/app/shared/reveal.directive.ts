import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

/**
 * Adds `.reveal--visible` once the host element enters the viewport.
 * Pair with `.reveal` CSS (opacity 0 → 1, translateY). Observes once then disconnects.
 */
@Directive({
  selector: '[atlasReveal]',
  standalone: true,
  host: { class: 'reveal' },
})
export class RevealDirective implements AfterViewInit {
  private readonly el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          this.el.nativeElement.classList.add('reveal--visible');
          obs.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -4% 0px' },
    );
    obs.observe(this.el.nativeElement);
  }
}
