import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule,} from 'lucide-angular';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  exports: [
    LucideAngularModule
  ]
})
export class SharedModule { }
