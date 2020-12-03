import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Observable } from 'rxjs';
import { ProfilePictureService } from '../../../shared/services/picture.service';
@Component({
  selector: 'admin-profile-banner-overview',
  templateUrl: './driver-profile-banner.component.html',
  styleUrls: ['./driver-profile-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverProfileBannerComponent implements OnInit {
  _userId: string;
  operData: any;
  _personDetails: any;
  status: string;
  _personnelInfo: any;
  @Input() set userId(userId: string) {
    if (userId) {
      this._userId = userId;
      this.getProfilePicture();
    }
  }
  get userId() {
    return this._userId;
  }
  @Input() set operDataInfo(operData: any) {
    if (operData) {
      this.operData = operData;
    }
  }
  get operDataInfo() {
    return this.operData;
  }
  @Input() set personnelInfo(personnelInfo: any) {
    if (personnelInfo) {
      this.status = personnelInfo.status;
      this._personnelInfo = personnelInfo;
    }
  }
  get personnelInfo() {
    return this.status;
  }
  @Input() set personDetails(personDetails: any) {
    if (personDetails) {
      this._personDetails = personDetails['positions'][0];
    }
  }
  get personDetails() {
    return this._personDetails;
  }
  driverProfilePicture$: Observable<any>;
  constructor(private readonly pictureService: ProfilePictureService) {}
  ngOnInit() {
    this.getProfilePicture();
  }
  getProfilePicture() {
    this.driverProfilePicture$ = this.pictureService.getProfilePicture(
      this.userId
    );
  }
}