import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-backend-header',
  standalone: false,
  templateUrl: './backend-header.component.html',
  styleUrl: './backend-header.component.scss'
})
export class BackendHeaderComponent {
userobject
  constructor(private _authService: AuthService){

  }
  ngOnInit(): void {
    this.userobject = this._authService.getUser('loggedin user data');
    console.log("userslocal",this.userobject);
  }
}
