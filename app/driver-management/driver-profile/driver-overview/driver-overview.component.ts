import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { Observable } from 'rxjs';
import {Contact, HireData, People, OperData, State} from './driver-overview-interface';
import { DriverOverviewService } from './driver-overview.service';
import { ProfilePictureService } from '../../../shared/services/picture.service';
import { DateFormatterComponent } from '../date-formatter/dateFormatter.component';
@Component({
  selector: 'admin-driver-overview',
  templateUrl: './driver-overview.component.html',
  styleUrls: ['./driver-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverOverviewComponent implements OnInit {
  _userId: string;
  managerUserId: string;
  daysUntilExpired: string;
  icon: any;
  operData: any;
  _states: State[];
  stateName: any;
  fleetManager: any;

  @Input() set userId(value: string) {
    this._userId = value;
    this.getCellPhoneNumber();
    this.getDateOfBirth();
    this.getHireDate();
  }
  get userId() {
    return this._userId;
  }
  @Input() set operDataInfo(operData: any) {
    if (operData) {
      this.operData = operData.operData;
    }
  }
  get operDataInfo() {
    return this.operData;
  }
  @Input() set personnelInfo(fleetManager: any) {
    if (fleetManager) {
      this.fleetManager = fleetManager;
      this.getFleetManagerPic();
    }
  }
  get personnelInfo() {
    return this.fleetManager;
  }
  @Input() set states(states: State[]) {
    this._states = states;
    this.getStateName();
  }
  get states() {
    return this._states;
  }
  person$: Observable<Contact>;
  hireInfo$: Observable<HireData>;
  dateOfBirth$: Observable<People>;
  managerPic: any;

  constructor(
    private readonly service: DriverOverviewService,
    private readonly pictureService: ProfilePictureService,
    private readonly dateFormatterService: DateFormatterComponent,
    private readonly changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getStateName();
    this.changeDetector.detectChanges();
  }

  getCellPhoneNumber() {
    this.person$ = this.service.getCellNumber(this.userId);
  }
  getHireDate() {
    this.hireInfo$ = this.service.getHireDate(this.userId);
  }
  getDaysUntilExpiration(expirationDate: any) {
    if (!expirationDate) {
      return null;
    }
    this.daysUntilExpired = this.dateFormatterService.formatExpirationDate(
      expirationDate,
      ''
    );
    return this.daysUntilExpired;
  }
  loadIcons(expirationDate: any) {
    if (!expirationDate) {
      return null;
    }
    this.icon = this.dateFormatterService.loadWarningIcons(expirationDate);
    return this.icon;
  }
  getDateOfBirth() {
    this.dateOfBirth$ = this.service.getDateOfBirth(this.userId);
  }
  getFleetManagerPic() {
    this.managerUserId = this.fleetManager.employee.userId;
    this.managerPic = this.pictureService.getProfilePicture(this.managerUserId);
  }
  getStateName() {
    if (this.states) {
      this.stateName = this._states.filter(res =>
          res.stateCode === this.operData.driverLicense.licenseState);
      this.stateName = this.stateName[0].stateName;
    }
  }

  trackByFn(index: number) {
    return index;
  }

  checkSubContactType(value, type) {
    return value === type;
  }
}
