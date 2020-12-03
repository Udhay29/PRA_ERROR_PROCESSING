import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { SharedModule } from '../shared/shared.module';
import { NotificationsService } from './notifications.service';
import { HttpClientModule } from '@angular/common/http';
import { NotificationsComponent } from './notifications.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { NotificationAddEditComponent } from './notification-add-edit/notification-add-edit.component';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { StoreModule } from '@ngrx/store';
import { notificationReducer } from './state/notification.reducer';
import { EffectsModule } from '@ngrx/effects';
import { NotificationEffects } from './state/notification.effects';
import { CanDeactivateGuard } from './can-deactivate.guard';

@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationAddEditComponent,
    NotificationDetailComponent
  ],
  imports: [
    AutoCompleteModule,
    AccordionModule,
    ButtonModule,
    CalendarModule,
    CheckboxModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    HttpClientModule,
    MessageModule,
    NotificationsRoutingModule,
    OverlayPanelModule,
    PanelModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    SharedModule,
    TableModule,
    InputTextModule,
    ProgressSpinnerModule,
    StoreModule.forFeature('notificationState', notificationReducer),
    EffectsModule.forFeature([NotificationEffects])
  ],
  providers: [
    NotificationsService,
    CanDeactivateGuard
  ]
})
export class NotificationsModule {}
