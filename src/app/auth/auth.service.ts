import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { User } from './app-user/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL= environment.API_URL;
  user = new BehaviorSubject<User | null>(null);
  constructor(private http:HttpClient) { }

   validateTokenSSO(ssoToken:any) {
    console.log(ssoToken);
    return this.http.post(`${this.API_URL}validateSSOtoken`, { token: ssoToken }, {withCredentials: true})
     
  }
}
