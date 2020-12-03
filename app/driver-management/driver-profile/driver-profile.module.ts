import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AccordionModule,
  TabViewModule,
  OverlayPanelModule,
  ScrollPanelModule
} from 'primeng/primeng';

import { DriverProfileRoutingModule } from './driver-profile-routing.module';
import { DriverProfileComponent } from './driver-profile.component';
import { SharedModule } from '../../shared/shared.module';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { DriverOverviewComponent } from './driver-overview/driver-overview.component';
import { DriverOverviewService } from './driver-overview/driver-overview.service';
import { DriverProfileBannerComponent } from './driverprofile_banner/driver-profile-banner.component';
import { DriverProfileBannerService } from './driverprofile_banner/driver-profile-banner.service';
import { CertificationsComponent } from './certifications/certifications.component';
import { CertificationsService } from './certifications/certifications.service';
import { EndorsementsComponent } from './endorsements/endorsements.component';
import { AvatarModule } from 'ngx-avatar';
import { DriverProfileService } from './driver-profile.service';
import { DateFormatterComponent } from './date-formatter/dateFormatter.component';

@NgModule({
  imports: [
    CommonModule,
    DriverProfileRoutingModule,
    SharedModule,
    AccordionModule,
    TabViewModule,
    PanelModule,
    TableModule,
    MenuModule,
    OverlayPanelModule,
    ScrollPanelModule,
    AvatarModule,
    SharedModule
  ],
  declarations: [
    DriverProfileComponent,
    DriverOverviewComponent,
    DriverProfileBannerComponent,
    CertificationsComponent,
    EndorsementsComponent,
    DateFormatterComponent
  ],
  exports: [
    DriverProfileComponent,
    DriverOverviewComponent,
    DriverProfileBannerComponent,
    CertificationsComponent,
    EndorsementsComponent,
    DateFormatterComponent
  ],
  providers: [
    DriverOverviewService,
    DriverProfileBannerService,
    CertificationsService,
    DriverProfileService
  ],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class DriverProfileModule {
  data: any;

  constructor() {}
}
