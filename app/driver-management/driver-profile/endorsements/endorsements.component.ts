import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  OperData,
  Qualifiers
} from '../driver-overview/driver-overview-interface';
import { MenuItem } from 'primeng/api';
import { Drivermodel } from '../../drivermodel';
import { RightPanelHelper } from '../../../shared/data-panel/RightPanelHelper';
import { Filter } from '../../../shared/filter-panel/filter/filter.model';
import { Subject } from 'rxjs';
import { DataPanelColumn } from 'src/app/shared/data-panel/data-panel.component';
import { DriverProfileBannerService } from '../driverprofile_banner/driver-profile-banner.service';
import { DateFormatterComponent } from '../date-formatter/dateFormatter.component';

@Component({
  selector: 'admin-endorsements',
  templateUrl: './endorsements.component.html',
  styleUrls: ['./endorsements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EndorsementsComponent implements OnInit {
  @Output() showFilter = new EventEmitter();
  allEndorsement: Qualifiers[];
  endorsement: Qualifiers[];
  canSubscribe = false;
  showFilterFlag = false;

  _userId: string;
  tableSize = 25;
  firstRecord = 0;
  mostRecentSearch = '';
  filters: Filter[];
  activeFilters: any[] = [];
  overflowMenu: MenuItem[] = [];
  drivermodel: Drivermodel;
  onSearch$: Subject<string>;
  rightPanelHelper: RightPanelHelper;
  icon: string;
  operData: OperData;
  _busUnit: string | null;
  @Input() set userId(value: string) {
    if (value) {
      this._userId = value;
    }
  }
  get userId() {
    return this._userId;
  }
  @Input() set operDataInfo(operData: OperData) {
    if (operData) {
      this.operData = operData;
      this.getOperDataCodes();
    }
  }
  get operDataInfo() {
    return this.operData;
  }
  @Input() set personDetails(busUnit: string) {
    if (busUnit) {
      this._busUnit = busUnit['positions'][0].busUnit;
    }
  }
  get personDetails() {
    return this._busUnit;
  }
  defaultColumns: DataPanelColumn[] = [
    {
      field: 'qualifierType',
      header: 'Name',
      isVisible: true,
      icon: true
    },
    {
      field: 'expirationDate',
      header: 'Expiration',
      isVisible: true
    }
  ];
  constructor(
    private readonly bannerService: DriverProfileBannerService,
    private readonly dateFormatterService: DateFormatterComponent,
    private readonly changeDetector: ChangeDetectorRef
  ) {
    this.overflowMenu.push({
      label: 'Export to Excel'
    });
    this.rightPanelHelper = new RightPanelHelper();
  }

  ngOnInit() {
    this.canSubscribe = true;
    this.onSearch$ = new Subject<string>();
    this.bannerService.getDriverPersonalData(this.userId);
    this.drivermodel = new Drivermodel();

    this.onSearch$.subscribe(res => {
      if (!this.mostRecentSearch && this.allEndorsement) {
        this.endorsement = [...this.allEndorsement];
        return;
      }
      if (this.allEndorsement) {
        this.endorsement = [
          ...this.allEndorsement.filter(
            f =>
              f.qualifierType
                .toLowerCase()
                .indexOf(this.mostRecentSearch.toLowerCase()) !== -1
          )
        ];
      }
      this.changeDetector.detectChanges();
    });
  }
  getOperDataCodes() {
    const endorsementsData = this.operData.operData.driverLicense.qualifiers;
    if (
      this.operData.operData &&
      this.operData.operData.driverLicense &&
      this.operData.operData.driverLicense.qualifiers &&
      this.operData.operData.driverLicense.qualifiers.length > 0
    ) {
      endorsementsData.forEach(
        d =>
          (d.expirationDate = d.expirationDate
            ? this.dateFormatterService.formatExpirationDate(
                d.expirationDate,
                this._busUnit
              )
            : null)
      );
      if (endorsementsData && endorsementsData.length) {
        endorsementsData.forEach(
          i =>
            (i.icon = this.dateFormatterService.loadWarningIcons(
              i.expirationDate
            ))
        );
        this.endorsement = [...endorsementsData];
        this.allEndorsement = [...endorsementsData];
        this.changeDetector.detectChanges();
      }
    }
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
}
