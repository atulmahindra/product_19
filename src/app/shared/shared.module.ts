import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { BackendHeaderComponent } from './backend-header/backend-header.component';
import { BackendFooterComponent } from './backend-footer/backend-footer.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { SidebarComponent } from './../sidebar-component/sidebar-component.component';
import { SharedService } from './shared.service';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import {MatCardModule} from '@angular/material/card';
import {MatSidenavModule} from '@angular/material/sidenav';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';




@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    BackendHeaderComponent,
    BackendFooterComponent,
    SideNavComponent,
    SidebarComponent
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    BackendHeaderComponent,
    FlexLayoutModule,
    BackendFooterComponent,
    MatCardModule,
    MatFormFieldModule,
    SideNavComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatFormFieldModule,
    FlexLayoutModule,
    MatInputModule,
    MatIconModule,
    MatExpansionModule,
    SharedRoutingModule
  ],
  providers: [SharedService,
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline'}}
  ]
})
export class SharedModule { }