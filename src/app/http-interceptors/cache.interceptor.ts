import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {

  // Store the response object
  cacheMap = new Map<string, HttpResponse<any>>();

  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // Check if the request is cacheable
    if (!this.isRequestCachable(request)) {
      return next.handle(request);
    } else {
      // Request is cacheable
      const cacheKey = this.createCacheKey(request);
      // If the request is cached
      if (this.cacheMap.has(cacheKey)) {
        return of(this.cacheMap.get(cacheKey) as HttpResponse<any>);
      } else {
        return next.handle(request).pipe(
          tap(event => {
            if (event instanceof HttpResponse) {
              // Set the map
              this.cacheMap.set(cacheKey, event);
            }
          })
        );
      }
    }
  }

  isRequestCachable(req: HttpRequest<any>): boolean {
    // Define all the cache partial URLs
    const urls = [
        'api/auth/validateEmail',
        'api/auth/login',
        'api/user/verifyEmailOTP',
        'api/auth/saveUser',
        'api/user/getCustomersByLoggedInUser',
        'api/user/getAllUsers',
        'api/user/approveUserWithMultipleCustomers/',
        'api/auth/getAllCustomers',
        'api/user/update/',
        'api/user/rejectUser/',
        'api/user/approveUserWithMultipleCustomers/',
        'api/reports/getSlaReports',
        'api/reports/getSLASReport',
        'api/reports/getSlaNames',
        'api/reports/getReports',
        'api/reports/getWarehouseReports',
        'api/reports/getCarbonEmissionReports',
        'api/user/getAccessibleNavigationMenu',
        'api/veda',
        'api/roles/getRoles',
        'api/categories/getAll',
        'api/customers/getAll',
    ];

    if (req.method === 'GET' || req.method === 'POST') {
      // Check the request URL
      for (let i = 0; i < urls.length; i++) {
        if (req.url.toLowerCase().includes(urls[i].toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  }

  createCacheKey(req: HttpRequest<any>): string {
    // For POST requests, use the URL and the payload as the cache key
    if (req.method === 'POST') {
      return `${req.url.toLowerCase()}_${JSON.stringify(req.body)}`;
    }
    // For GET requests, use the URL as the cache key
    return req.url.toLowerCase();
  }
}
