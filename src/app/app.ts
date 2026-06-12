import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AtlasPageComponent } from './features/atlas/atlas-page.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtlasPageComponent],
  template: `<atlas-page />`,
})
export class App {}
