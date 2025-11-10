import { Component } from '@angular/core';
import { SharedModule } from "../../shared/shared.module";
import { SharedRoutingModule } from "../../shared/shared-routing.module";

@Component({
  selector: 'app-backend-layout',
  imports: [SharedModule, SharedRoutingModule],
  templateUrl: './backend-layout.component.html',
  styleUrl: './backend-layout.component.scss'
})
export class BackendLayoutComponent {

}
