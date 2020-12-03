import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {CertificationsService} from './certifications.service';
import {Certifications} from './certifications-interface';

import {MenuItem} from 'primeng/api';
import {Filter} from '../../../shared/filter-panel/filter/filter.model';
import {Drivermodel} from '../../drivermodel';
import {Observable, Subject} from 'rxjs';
import {RightPanelHelper} from '../../../shared/data-panel/RightPanelHelper';
import {DataPanelColumn} from 'src/app/shared/data-panel/data-panel.component';
import {takeWhile} from 'rxjs/operators';
import {DriverProfileBannerService} from '../driverprofile_banner/driver-profile-banner.service';
import {DateFormatterComponent} from '../date-formatter/dateFormatter.component';

@Component({
  selector: 'admin-certifications',
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CertificationsComponent implements OnInit, OnDestroy {
  @Output() showFilter = new EventEmitter();
  allCertificates: Certifications[];
  certificates: Certifications[];
  canSubscribe = false;
  showFilterFlag = false;
  certificates$: Observable<any>;
  _userId: any;
  tableSize = 25;
  firstRecord = 0;
  mostRecentSearch = '';
  filters: Filter[];
  activeFilters: any[] = [];
  overflowMenu: MenuItem[] = [];
  drivermodel: Drivermodel;
  icon: boolean;
  onSearch$: Subject<string>;
  rightPanelHelper: RightPanelHelper;
  busUnit: string;

  @Input() set userId(value: any) {
    this._userId = value;
    this.getCertifications();
  }
  get userId() {
    return this._userId;
  }
  @Input() set personDetails(personDetails: string) {
    if (personDetails) {
    this.busUnit = personDetails;
    }
  }
  get personDetails() {
    return this.busUnit;
  }
  defaultColumns: DataPanelColumn[] = [
    {
      field: 'CertificateName',
      header: 'Name',
      isVisible: true,
      icon: true
    },
    {
      field: 'ExpiryDate',
      header: 'Expiration',
      isVisible: true,
    }
  ];
  constructor(
      private readonly service: CertificationsService,
      private readonly dateFormatterService: DateFormatterComponent,
      private readonly changeDetector: ChangeDetectorRef
  ) {
    this.rightPanelHelper = new RightPanelHelper();
    this.overflowMenu.push({
      label: 'Export to Excel'
    });
  }

  toggleFormFilter() {
    this.showFilterFlag = !this.showFilterFlag;
    this.showFilter.emit({ comp: 'certifications', flag: this.showFilterFlag });
  }

  ngOnInit() {
    this.canSubscribe = true;
    this.onSearch$ = new Subject<string>();
    this.drivermodel = new Drivermodel();
    this.onSearch$.subscribe(res => {
      if (!this.mostRecentSearch && this.allCertificates) {
        this.certificates = [...this.allCertificates];
        return;
      }
      if (this.allCertificates) {
        this.certificates = [
          ...this.allCertificates.filter(
              f =>
                  f.CertificateName
                      .toLowerCase()
                      .indexOf(this.mostRecentSearch.toLowerCase()) !== -1
          )
        ];
      }
      this.changeDetector.detectChanges();
    });
  }
  trackByFn(index) {
    return index;
  }


  getCertifications() {
    this.certificates$ = this.service.getCertifications(this.userId);
    this.service
        .getCertifications(this.userId)
        .pipe(takeWhile(() => this.canSubscribe))
        .subscribe(certificates => {
          const certificateData = certificates['PersonCertification'][0]['Certifications'];
            if (certificateData &&
              certificateData.length) {
              certificateData.forEach(
                  d => (d.ExpiryDate =
                      d.ExpiryDate ?
                          this.dateFormatterService.formatExpirationDate(d.ExpiryDate, this.busUnit)
                          : null)
              );
            if (certificateData &&
              certificateData.length) {
              certificateData.forEach(
                  i => (i.icon = this.dateFormatterService.loadWarningIcons(i.ExpiryDate))
                );
                this.certificates = [...certificateData];
                this.allCertificates = [...certificateData];
                this.changeDetector.detectChanges();
              }
            }
        });
  }
  onPageChange(event: any): void {
    this.tableSize = event.rows;
    this.firstRecord = event.first;
    this.onSearch$.next(this.mostRecentSearch);
  }
  onSearch(event: string) {
    this.firstRecord = 0;
    this.mostRecentSearch = event;
    this.onSearch$.next(event);
  }

  ngOnDestroy() {
    this.canSubscribe = false;
  }
}
