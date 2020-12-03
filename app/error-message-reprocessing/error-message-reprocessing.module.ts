import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import {InputTextareaModule} from 'primeng/inputtextarea';

import { MessageModule } from 'primeng/message';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

import { ErrorMessageReprocessingRoutingModule } from './error-message-reprocessing-routing.module';
import { ErrorMessageReprocessingComponent } from './error-message-reprocessing.component';
import { ErrorMessageReprocessingDetailsComponent
 } from './error-message-reprocessing-details/error-message-reprocessing-details.component';
import { ErrorMessageReprocessingPayloadComponent
 } from './error-message-reprocessing-payload/error-message-reprocessing-payload.component';
import { reducer } from './state/error-reprocessing.reducer';
import { StoreModule } from '@ngrx/store';

@NgModule({
  declarations: [ErrorMessageReprocessingComponent, ErrorMessageReprocessingDetailsComponent,
     ErrorMessageReprocessingPayloadComponent],
  imports: [
    CommonModule,
    ErrorMessageReprocessingRoutingModule,
    DialogModule,
    ConfirmDialogModule,
    OverlayPanelModule,
    PanelModule,
    BreadcrumbModule,
    ButtonModule,
    FormsModule,
    InputTextareaModule,
    MessageModule,
    ErrorMessageReprocessingRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    StoreModule.forFeature('errorManagementState', reducer),
  ]
})
export class ErrorMessageReprocessingModule { }
