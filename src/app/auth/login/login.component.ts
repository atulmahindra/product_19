import { Component } from '@angular/core';


import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
constructor( private router: Router,private _authService: AuthService,private cookieService: CookieService) {
    

   }
  ngOnInit(): void {
    // Add initialization logic here
  
  }
}
