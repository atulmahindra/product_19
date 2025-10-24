import { Component } from '@angular/core';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-backend-header',
  standalone: false,
  templateUrl: './backend-header.component.html',
  styleUrl: './backend-header.component.scss'
})
export class BackendHeaderComponent {
  userobject
constructor(private _shared_serviec:SharedService) {}

  ngOnInit(): void {
this.userobject = this._shared_serviec.getUser('loggedin user data');
    console.log("userslocal",this.userobject);
  }
}
