import { Routes } from '@angular/router';
import { EntriesPageComponent } from './components/entries-page/entries-page.component';

export const routes: Routes = [
  { path: '', component: EntriesPageComponent },
  { path: '**', redirectTo: '' }
];
