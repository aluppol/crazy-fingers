import { Routes } from '@angular/router';
import { RoutePath } from './enums';
import { LibraryPageComponent } from './library/library-page.component';
import { TypingPageComponent } from './typing/typing-page.component';

export const routes: Routes = [
  { path: RoutePath.Library, component: LibraryPageComponent },
  { path: RoutePath.Book, component: TypingPageComponent },
  { path: RoutePath.Unknown, redirectTo: RoutePath.Library },
];
