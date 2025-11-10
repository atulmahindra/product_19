import { Component } from '@angular/core';
import { SharedModule } from "../../shared/shared.module";
import { DashboardRoutingModule } from "../../dashboard/dashboard-routing.module";

@Component({
  selector: 'app-default-layout',
  imports: [SharedModule, DashboardRoutingModule],
  templateUrl: './default-layout.component.html',
  styleUrl: './default-layout.component.scss'
})
export class DefaultLayoutComponent {

}
