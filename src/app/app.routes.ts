
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BackendLayoutComponent } from './layouts/backend-layout/backend-layout.component';
import { BACKEND_LAYOUT } from './routes/backend-layout-routes';
import { DefaultLayoutComponent } from './layouts/default-layout/default-layout.component';
import { DEFAULT_ROUTES } from './routes/default-layout-routes';

export const routes: Routes = [
  { path: '', component: DefaultLayoutComponent, children: DEFAULT_ROUTES },
  { path: 'backend', component: BackendLayoutComponent, children: BACKEND_LAYOUT },
  { path: '**', redirectTo: '404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
