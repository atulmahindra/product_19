
import { Routes } from '@angular/router';

export const BACKEND_LAYOUT: Routes = [
    {
        path: '',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule)
    }
]
