import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, throwError } from 'rxjs';
import { User } from './app-user/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL= environment.API_URL;
  user = new BehaviorSubject<User | null>(null);
  constructor(private http:HttpClient) { }

   validateTokenSSO(ssoToken: any) {
  console.log('SSO Token:', ssoToken);

  return this.http.post(
    `${this.API_URL}validateSSOtoken`,
    { token: ssoToken },
    { withCredentials: true }
  ).pipe(
    catchError((err: HttpErrorResponse) => {
      console.error('SSO Token validation failed:', err.message);
      // Optionally show a user-friendly message or handle specific errors
      return throwError(() => err);
    })
  );
}

}
