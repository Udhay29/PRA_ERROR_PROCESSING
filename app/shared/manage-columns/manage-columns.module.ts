import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManageColumnsComponent } from './manage-columns.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { OrderListModule } from 'primeng/orderlist';
import { DropdownModule, InputTextModule } from 'primeng/primeng';
import { SharedModule } from 'primeng/shared';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    OrderListModule
  ],
  declarations: [ManageColumnsComponent],
  exports: [
    ManageColumnsComponent,
    DialogModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    OrderListModule
  ]
})
export class ManageColumnsModule {}
