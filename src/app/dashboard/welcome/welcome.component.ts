import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MyDialogContentComponent } from '../../shared/my-dialog-content/my-dialog-content.component';
import { SharedService } from '../../shared/shared.service';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: false,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  userobject
greeting: string = '';

  constructor(private dialog: MatDialog,private _shared_serviec:SharedService,private _authService: AuthService) {
    this.setGreeting();
  }

  setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Good Morning!';
    } else if (hour < 18) {
      this.greeting = 'Good Afternoon!';
    } else {
      this.greeting = 'Good Evening!';
    }
  }
  ngOnInit(): void {
    this.userobject = this._authService.getUser('loggedin user data');
    console.log("userslocal",this.userobject);
  }
  openDialog(): void {
    this._shared_serviec.open_dialog({title:"Create New Project ",action:'newpoject'})
  }
}
