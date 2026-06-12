import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Country, IndicatorData, IndicatorManifest } from './models';

/**
 * The app depends only on this interface, never on how data is fetched.
 * Today it is backed by static JSON assets; a live World Bank API
 * implementation could be swapped in by changing one provider.
 */
export interface IndicatorRepository {
  getManifest(): Observable<IndicatorManifest>;
  getCountries(): Observable<Country[]>;
  getIndicator(code: string): Observable<IndicatorData>;
}

export const INDICATOR_REPOSITORY = new InjectionToken<IndicatorRepository>(
  'INDICATOR_REPOSITORY',
);
