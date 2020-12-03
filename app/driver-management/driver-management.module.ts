import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule, TabViewModule } from 'primeng/primeng';
import { DriverManagementRoutingModule } from './driver-management-routing.module';
import { DriverManagementComponent } from './driver-management.component';
import { DriverOverviewService } from './driver-profile/driver-overview/driver-overview.service';
import { DriverProfileModule } from './driver-profile/driver-profile.module';
import { ManageColumnsModule } from '../shared/manage-columns/manage-columns.module';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { RouteReuseStrategy } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { SharedModule } from '../shared/shared.module';
import { DriverManagementService } from './driver-management.service';
import { AvatarModule } from 'ngx-avatar';

@NgModule({
  imports: [
    CommonModule,
    DriverManagementRoutingModule,
    SharedModule,
    AccordionModule,
    TabViewModule,
    PanelModule,
    TableModule,
    OverlayPanelModule,
    DriverProfileModule,
    ManageColumnsModule,
    AutoCompleteModule,
    ButtonModule,
    CalendarModule,
    ProgressSpinnerModule,
    DialogModule,
    DropdownModule,
    MessageModule,
    AvatarModule,
  ],
  declarations: [ DriverManagementComponent ],
  providers: [
    DriverOverviewService,
    DriverManagementService,
  ]
})
export class DriverManagementModule {
  data: any;

  constructor() {}
}
