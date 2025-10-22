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
      // this._authService.show();
  
      return this._authService.user.pipe(
        take(1),
        exhaustMap((user: any) => {
          let modifiedReq = req;
  
          if (user && user.token) {
            modifiedReq = req.clone({
              withCredentials: true,
              setHeaders: { Authorization: `Bearer ${user.token}`,"Content-Type": "application/json","Accept": "application/json" }
            });
          }
  
          return next.handle(modifiedReq).pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.status === 401) {
                localStorage.clear();
                window.location.reload();
              }
              return throwError(error);
            }),
            finalize(() => {
              // this._authService.hide();
            })
          );
        })
      );
    }
  }
