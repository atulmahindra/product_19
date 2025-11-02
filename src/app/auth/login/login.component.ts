import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { SharedService } from '../../shared/shared.service';




@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements  OnInit {

  errormsg: any;
constructor(private router: Router,private _authService: AuthService,private cookieService: CookieService,private _shared_serviec: SharedService) {
    
  }
  
  ngOnInit(): void {
    this.errormsg = this._shared_serviec.errorMsgs;
    // Add initialization logic here
      //   const token = 'a03f94d6-3a37-48b5-8be3-77d2f90e9e98';
      // this.cookieService.set('access_token', token, 7); // Expires in 7 days
    console.log('Cookie set:', this.cookieService.get('access_token'));
     if(this.cookieService.check('access_token')){
      this._authService.validateTokenSSO(this.cookieService.get('access_token')).subscribe((res)=>{
        console.log("loginAPI",res);
       
        if (res) {
          this.router.navigate(['/backend']);
          
        }
      }),((error:any)=>{
        console.log("Error during SSO validation:", error);
        // Optionally handle the error, e.g., show a message to the user
      });
     }else{
      // alert("false")
      window.location.href =  environment.ssoLogin;
     }
  }
}
