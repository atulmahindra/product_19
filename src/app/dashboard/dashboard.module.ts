import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { WelcomeComponent } from './welcome/welcome.component';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OldProjectsComponent } from './old-projects/old-projects.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    DashboardComponent,
    WelcomeComponent,
    OldProjectsComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    FormsModule,
    RouterModule,
    FlexLayoutModule,
    DragDropModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
