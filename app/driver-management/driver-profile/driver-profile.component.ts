import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppService } from '../../app.service';
import { DriverProfileService } from './driver-profile.service';
import {State} from './driver-overview/driver-overview-interface';

@Component({
  selector: 'admin-driver-profile',
  templateUrl: './driver-profile.component.html',
  styleUrls: ['./driver-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverProfileComponent implements OnInit {
  breadcrumb: MenuItem[];
  certificationsFilter = false;
  endorsementsFilter = false;
  public userId: any;
  public operDataInfo: any;
  public personDetails: any;
  public personnelInfo: any;
  public states: State[];
  selectedIndex: any;
  preferencesDomainData: any;
  restrictionDomainData: any;
  weightUnits: any;

  constructor(
    private readonly route: ActivatedRoute,
    private appService: AppService,
    private readonly driverProfileService: DriverProfileService,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.breadcrumb = [
      { label: 'Driver Management', routerLink: ['/driver-management'] },
      { label: 'Driver Profile' }
    ];
    this.userId = this.route.snapshot.paramMap.get('userId');
    this.driverProfileService.getOperDataCodes(this.userId).subscribe(res => {
      this.operDataInfo = res;
    });
    this.driverProfileService
      .getDriverPersonalData(this.userId)
      .subscribe(res => {
        this.personDetails = res;
      });
    this.driverProfileService
      .getFleetManagerName(this.userId)
      .subscribe(res => {
        this.personnelInfo = res;
        this.changeDetector.detectChanges();
      });
    this.driverProfileService.getStateName()
        .subscribe(res => {
          this.states = res;
        });
    this.setBreadcrumbs();
  }

  setBreadcrumbs(id?: number): void {
    const breadcrumbs: MenuItem[] = this.breadcrumb;
    this.appService.breadcrumbs = breadcrumbs;
  }
  onTabChange(event) {
    if (event) {
      this.selectedIndex = event.index;
    }
    this.certificationsFilter = false;
    this.endorsementsFilter = false;
  }

  onShowFilter(event) {
    if (event.comp === 'certifications') {
      this.certificationsFilter = event.flag;
    } else if (event.comp === 'endorsements') {
      this.endorsementsFilter = event.flag;
    }
  }
}
