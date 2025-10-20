import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(
    private router: Router,
    private _authService: AuthService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    alert('Redirecting to SSO Login Page');

    // Add initialization logic here
    localStorage.removeItem('SelectedServicesdata');
    localStorage.removeItem('fromDate');
    localStorage.removeItem('toDate');
    localStorage.removeItem('veedaLogs');

    console.log('Cookie set:', this.cookieService.get('access_token'));
    if (this.cookieService.check('access_token')) {
      this._authService.validateTokenSSO(this.cookieService.get('access_token')).subscribe((res) => {
        console.log('loginAPI', res);
        if (res) {
          this.router.navigate(['/backend']);
        }
      });
    } else {
      window.location.href = environment.ssoLogin;
    }
  }
}
