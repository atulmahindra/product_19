
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { AuthGuard } from '../auth/auth.guard';
import { OldProjectsComponent } from './old-projects/old-projects.component';


const routes: Routes = [
  { path: '', component: WelcomeComponent, canActivate: [AuthGuard] },
  {
    path: 'Dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'OldProject',
    component: OldProjectsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'Dashboard/:id',      // 👈 dynamic route parameter
    component: DashboardComponent,
    canActivate: [AuthGuard]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
