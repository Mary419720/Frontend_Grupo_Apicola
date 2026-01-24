import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PublicRoutingModule } from './public-routing.module';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    PublicRoutingModule,
    HomeComponent,
    AboutComponent,
  ]
})
export class PublicModule { }
