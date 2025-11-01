import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../auth/auth.service"; 
import { catchError, exhaustMap, finalize, take } from "rxjs/operators";
import { Observable, throwError } from "rxjs";
import { Router } from "@angular/router";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private _authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this._authService.user.pipe(
      take(1),
      exhaustMap((user: any) => {
        let modifiedReq = req;

        // ✅ Skip setting "Content-Type" for multipart requests
        const isMultipart = req.url.includes('v1/analysis/validateDataFile') || req.body instanceof FormData;

        if (user && user.token) {
          const headers: any = {
            Authorization: `Bearer ${user.token}`,
            Accept: "application/json"
          };

          // ✅ Only set JSON content type for non-multipart requests
          if (!isMultipart) {
            headers["Content-Type"] = "application/json";
          }

          modifiedReq = req.clone({
            withCredentials: true,
            setHeaders: headers
          });
        }

        return next.handle(modifiedReq).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              localStorage.clear();
              window.location.reload();
            }
            return throwError(() => error);
          }),
          finalize(() => {
            // this._authService.hide();
          })
        );
      })
    );
  }
}
