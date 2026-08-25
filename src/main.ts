import { bootstrapApplication } from '@angular/platform-browser';
import { removeLegacyLocalStorage } from './app/adapters/persistence/local-storage';
import { applicationConfig } from './app/composition/application-config';
import { RootComponent } from './app/ui/root/root.component';

removeLegacyLocalStorage(localStorage);
bootstrapApplication(RootComponent, applicationConfig).catch((error: unknown) => console.error(error));
