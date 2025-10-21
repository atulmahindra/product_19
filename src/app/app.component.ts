import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [MatSlideToggleModule,RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'SD';
  constructor(public _authService: AuthService) {
    // this.detectRefresh();
   }
   ngOnInit(): void {
    this._authService.autosingIn()
   }
}
