import { Component } from '@angular/core';
import { SharedService } from '../../shared/shared.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-old-projects',
  standalone: false,
  templateUrl: './old-projects.component.html',
  styleUrl: './old-projects.component.scss'
})
export class OldProjectsComponent {
userobject
old_project
  constructor(private _shared_service: SharedService,private _authService:AuthService) {

  }
ngOnInit(): void {
this.userobject = this._authService.getUser('loggedin user data');
this._shared_service.getMenus(this.userobject?.email ?? "", this.userobject.id).subscribe((res)=>{
console.log("sdfa",res)
this.old_project = res
})
}

}
