
import { Routes } from '@angular/router';

export const BACKEND_LAYOUT: Routes = [
    {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule)
    }
]
