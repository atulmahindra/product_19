import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';




@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements  OnInit {
constructor(private router: Router,private _authService: AuthService,private cookieService: CookieService) {
    
  }
  ngOnInit(): void {
    // Add initialization logic here
      const token = '4ea11b6a-d564-4a6e-9284-61b3ba2c4352';
    this.cookieService.set('access_token', token, 7); // Expires in 7 days
    console.log('Cookie set:', this.cookieService.get('access_token'));
     if(this.cookieService.check('access_token')){
      this._authService.validateTokenSSO(this.cookieService.get('access_token')).subscribe((res)=>{
        console.log("loginAPI",res);
       
        if (res) {
          this.router.navigate(['/backend']);
        }
      });
     }else{
      // alert("false")
      window.location.href =  environment.ssoLogin;
     }
  }
}
