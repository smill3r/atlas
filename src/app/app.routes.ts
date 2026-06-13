import { Routes } from '@angular/router';
import { AtlasPageComponent } from './features/atlas/atlas-page/atlas-page.component';

export const routes: Routes = [
  {
    path: '',
    component: AtlasPageComponent,
  },
  {
    path: 'country/:code',
    loadComponent: () =>
      import('./features/country-detail/country-detail-page/country-detail-page.component').then(
        (m) => m.CountryDetailPageComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
