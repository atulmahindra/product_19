
import { Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth.guard';
import { WelcomeComponent } from '../dashboard/welcome/welcome.component';

export const BACKEND_LAYOUT: Routes = [
  {
    path: '',
    canLoad: [AuthGuard],
    loadChildren: () =>
      import('../dashboard/dashboard.module').then(m => m.DashboardModule)
  }
];
