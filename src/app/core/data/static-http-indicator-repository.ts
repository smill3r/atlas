import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { IndicatorRepository } from './indicator-repository';
import { Country, IndicatorData, IndicatorManifest } from './models';

/** Serves the build-time JSON assets, with per-request caching. */
@Injectable()
export class StaticHttpIndicatorRepository implements IndicatorRepository {
  private readonly http = inject(HttpClient);
  private readonly base = 'assets/data';

  private manifest$?: Observable<IndicatorManifest>;
  private countries$?: Observable<Country[]>;
  private readonly indicators = new Map<string, Observable<IndicatorData>>();

  getManifest(): Observable<IndicatorManifest> {
    return (this.manifest$ ??= this.http
      .get<IndicatorManifest>(`${this.base}/indicators.json`)
      .pipe(shareReplay(1)));
  }

  getCountries(): Observable<Country[]> {
    return (this.countries$ ??= this.http
      .get<Country[]>(`${this.base}/countries.json`)
      .pipe(shareReplay(1)));
  }

  getIndicator(code: string): Observable<IndicatorData> {
    let cached = this.indicators.get(code);
    if (!cached) {
      cached = this.http
        .get<IndicatorData>(`${this.base}/indicator-${code}.json`)
        .pipe(shareReplay(1));
      this.indicators.set(code, cached);
    }
    return cached;
  }
}
