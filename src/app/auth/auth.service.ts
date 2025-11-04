import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { User } from './app-user/user.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL= environment.API_URL;
  user = new BehaviorSubject<User | null>(null);
  constructor(private http:HttpClient, private cookieService: CookieService) { }

   getUser(key: string): any {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (err) {
      console.error('Error while getting local storage key ', key, err);
      return '';
    }
  }

  validateTokenSSO(ssoToken: any) {
  console.log('SSO Token:', ssoToken);

  return this.http.post(
    `${this.API_URL}validateSSOtoken`,
    { token: ssoToken },
    { withCredentials: true }
  ).pipe(
    tap((res: any) => {
      console.log('✅ SSO Validation Success:', res);
      this.cookieService.set("session_id", res.session_id)
      
      this.authenticatedUser(
        res.id,
        res.email,
        res.first_name,
        ssoToken,
        res.role,
        res.gender,
        res.roleId,
        res.isDownload
      );
    }),
    catchError((err: HttpErrorResponse) => {
      console.error('❌ SSO Token Validation Failed');

      if (err.error) {
        // API returned a structured error object
        console.error('Error Message:', err.error.message || 'Unknown error');
        console.error('Status Code:', err.error.status_code || err.status);
      } else {
        // Network or unexpected errors
        console.error('Unexpected Error:', err.message);
      }

      // Optionally, show a friendly message or handle redirect
      // this.router.navigate(['/login']);

      return throwError(() => err);
    })
  );
}
singOut(){
    // alert("kjdf")


    const userData = JSON.parse(localStorage.getItem('loggedin user data')|| '{}') ;
    console.log(userData.id)


        // this.cookieService.delete('access_token', '/', '.mlldev.com');
        // console.log(res, "logout done");
       this.user.next(null);
    // this.router.navigate(['']);
    localStorage.removeItem("loggedin user data");
    localStorage.removeItem("SelectedServicesdata");
    localStorage.removeItem("multiuser");
  
    // this.tokenExpirationTimer = null;

  }
autosingIn(){
    const userData = JSON.parse(localStorage.getItem('loggedin user data')|| '{}') ;

    if(!userData){
      return;
    }
    const loggedInUser = new User(userData.id,userData.email, userData.fullName, userData._token, userData.role,userData.gender,userData.roleId,userData.isDownload);

    if(loggedInUser.token){
      this.user.next(loggedInUser);
      // const expirationduration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime()
      // this.autoSingOUt(expirationduration)
    }

  }

  authenticatedUser(id:any,email:string, fullName:string, token:string, role:string,gender:string, roleId:number,isDownload:boolean){

    // const expirationDate = new Date(new Date().getTime() + expiresIn*1000);
    const user  = new User(id,email,fullName,token,role,gender,roleId,isDownload);
    console.log("users data",user)
    this.user.next(user);

    // this.autoSingOUt(expiresIn*1000)
    localStorage.setItem('loggedin user data', JSON.stringify(user) )
  }
  
}
