import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { Provider } from '@angular/core';

export const httpInterceptorProviders: Provider[] = [
  { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
];
