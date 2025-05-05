import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Import provideHttpClient and withInterceptors

import { routes } from './app.routes';
import { authInterceptor } from './auth/auth-interceptor.interceptor'; // Import the functional interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])) // Provide HttpClient with the functional interceptor
  ]
};

