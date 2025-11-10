// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { httpInterceptorProviders } from './http-interceptors';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // 👇 Important: include provideHttpClient with DI interceptors
    provideHttpClient(withInterceptorsFromDi()),
    ...httpInterceptorProviders
  ]
};
