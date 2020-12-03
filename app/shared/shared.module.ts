import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataPanelComponent, DataPanelRightComponent } from './data-panel/data-panel.component';
import { FilterPanelComponent } from './filter-panel/filter-panel.component';

import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { FilterComponent } from './filter-panel/filter/filter.component';
import { ButtonModule } from 'primeng/button';
import { TypeaheadComponent } from './typeahead/typeahead.component';
import { CriteriaErrorMessagePipe } from './pipes/criteriaErrorMessage.pipe';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {ManageColumnsModule} from './manage-columns/manage-columns.module';
import {DropdownModule, InputSwitchModule, OverlayPanelModule} from 'primeng/primeng';
import {CardModule} from 'primeng/card';
import {ContextMenuModule} from 'primeng/contextmenu';
import {DriverSeatPipe} from './pipes/driver-profile-pipes/driver-seat-pipe/driverSeat.pipe';
import {DriverTypePipe} from './pipes/driver-profile-pipes/driver-type-pipe/driverType.pipe';
import {WorkTypePipe} from './pipes/driver-profile-pipes/work-type-pipe/workType.pipe';
import {StatusPipe} from './pipes/driver-profile-pipes/status-pipe/status.pipe';
import {LicenseTypePipe} from './pipes/driver-profile-pipes/license-type-pipe/licenseType.pipe';
import {PhoneNumberPipe} from './pipes/phoneNumber.pipe';
import {CalendarModule} from 'primeng/calendar';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';

@NgModule({
  declarations: [
    DataPanelComponent,
    DataPanelRightComponent,
    FilterPanelComponent,
    PhoneNumberPipe,
    DriverSeatPipe,
    DriverTypePipe,
    WorkTypePipe,
    StatusPipe,
    LicenseTypePipe,
    FilterComponent,
    TypeaheadComponent,
    CriteriaErrorMessagePipe,
  ],
  imports: [
      AccordionModule,
      AutoCompleteModule,
      CheckboxModule,
      CommonModule,
      InputTextModule,
      MenuModule,
      PaginatorModule,
      PanelModule,
      TableModule,
      ButtonModule,
      CardModule,
      InputSwitchModule,
      OverlayPanelModule,
      ManageColumnsModule,
      DropdownModule,
      FormsModule,
      ReactiveFormsModule,
      ContextMenuModule,
      CalendarModule,
      MessagesModule,
      MessageModule
  ],
  exports: [
      AutoCompleteModule,
      DataPanelRightComponent,
      PhoneNumberPipe,
      DriverSeatPipe,
      DriverTypePipe,
      WorkTypePipe,
      StatusPipe,
      LicenseTypePipe,
      TypeaheadComponent,
      CardModule,
      InputSwitchModule,
      OverlayPanelModule,
      ContextMenuModule,
      ManageColumnsModule,
      DropdownModule,
      FormsModule,
      ReactiveFormsModule,
      DataPanelComponent,
      CriteriaErrorMessagePipe,
  ]
})
export class SharedModule { }
