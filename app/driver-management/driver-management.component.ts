import { Component, OnInit } from '@angular/core';
import { Drivermodel } from './drivermodel';
import { Driver } from './driver-management.model';
import { DriverManagementService } from './driver-management.service';
import { switchMap, filter, throwIfEmpty } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { iif, Subject } from 'rxjs';
import { RightPanelHelper } from '../shared/data-panel/RightPanelHelper';
import { DataPanelColumn } from '../shared/data-panel/data-panel.component';
import { DriverSearchResult } from './DriverSearchResult.interface';
import { TableDriver } from './TableDriver';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ElasticFilter,
  Filter
} from '../shared/filter-panel/filter/filter.model';
import { AppService } from '../app.service';
import { ProfilePictureService } from '../shared/services/picture.service';

@Component({
  selector: 'admin-driver-management',
  templateUrl: './driver-management.component.html',
  styleUrls: ['./driver-management.component.scss']
})
export class DriverManagementComponent implements OnInit {
    breadcrumb: MenuItem[];
  drivermodel: Drivermodel;
  overflowMenu: MenuItem[] = [];
  rightPanelHelper: RightPanelHelper;
  employees: Driver[];
  columns: DataPanelColumn[] = [
    { field: 'fullName', header: 'Name', sortable: true },
    { field: 'status', header: 'Status', sortable: true },
    { field: 'businessUnit', header: 'Business Unit', sortable: true }
  ];
  selectedEmp: any;
  selectedRowEmp: Driver;
  values: TableDriver[] = [];
  totalRecords: number;
  fullscreen: boolean;
  mostRecentSearch = '';
  userPanelIsLoading: boolean;
  onSearch$: Subject<string>;
  selectedEmplId: number;
  activeFilters: any[] = [];
  filters: Filter[];
  filterColumnName: string;
  tableSize = 25;
  firstRecord = 0;
  sortingState: {
    sortKey: string | null,
    sortOrder: 'asc' | 'desc'
  } = {
    sortKey: null,
    sortOrder: 'asc'
  };
    constructor(
    private readonly driverManagementService: DriverManagementService,
    private readonly pictureService: ProfilePictureService,
    private appService: AppService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer
  ) {
    this.rightPanelHelper = new RightPanelHelper();
      this.overflowMenu.push({
          label: 'Export to Excel'
      });
      this.overflowMenu.push({
          label: 'Manage Columns'
      });
  }

  ngOnInit() {
    this.setBreadcrumbs();
    this.filterColumnName = 'fullName';
    this.drivermodel = new Drivermodel();
    this.updateSortingState(this.filterColumnName);
    this.getDriverData();
  }
  getDriverData() {
    const filters: any = {
      name: 'isDriver',
      field: 'personDTO.isDriver',
      type: 'ELASTIC',
      model: ['Y'],
      selectedSearches: ['Y']
    };
    const BUfilter: any = {
      name: 'isDriver',
      field: 'positions.businessUnit',
      type: 'ELASTIC',
      model: ['JBT', 'JBI', 'DCS'],
      selectedSearches: ['JBT', 'JBI', 'DCS']
    };
    this.activeFilters.push(filters);
    this.activeFilters.push(BUfilter);

    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) =>
          iif(
            () => params.has('id'),
            this.driverManagementService.getEmployee(Number(params.get('id'))),
            this.driverManagementService.searchForUsers(
              this.mostRecentSearch,
              this.firstRecord,
              this.tableSize,
              this.activeFilters
            )
          )
        )
      )
      .subscribe((result: Driver | DriverSearchResult) => {
        this.loadResult(result);
      });
  }

  loadResult(result: Driver | DriverSearchResult) {
    this.fullscreen = false;
    this.searchForUsersSubscribe(result as DriverSearchResult);
    this.buildSearchSubject();
    this.filters = this.buildFilters();
   }

  isEmployee(res: Driver | DriverSearchResult): res is Driver {
    return (res as Driver).isEmployee === true;
  }

  setBreadcrumbs(id?: number): void {
    const breadcrumbs: MenuItem[] = [
      { label: 'Driver Management', routerLink: '/driver-management' }
    ];
    if (id) {
      breadcrumbs.push({
        label: this.selectedEmp.fullName,
        routerLink: '/driver-management/' + id
      });
    }
    this.appService.breadcrumbs = breadcrumbs;
  }

  mapEmployeesForTable(drivers: Driver[]): TableDriver[] {
    return drivers.map((emp: Driver) => {
      return {
        id: emp.emplid,
        userName: emp.userName,
        managerid: emp.manager.emplid,
        fullName: `${emp.fullName} (${emp.userName})`,
        title: emp.title,
        businessUnit: emp.businessUnit,
        status: emp.status === 'A' ? 'Active' : 'Leave'
      };
    });
  }

  searchForUsersSubscribe(results: any) {
    this.employees = results.employees;
    this.totalRecords = results.hitCount;
    this.values = this.mapEmployeesForTable(results.employees);
  }

  onRowSelect(tableEmp: any) {
    if (
        !(this.selectedEmp != null && tableEmp.id === this.selectedEmp.emplid)
    ) {
      this.userPanelIsLoading = true;
      this.selectedRowEmp = tableEmp;
      this.loadEmployee(tableEmp.id);
      this.goToFullscreen(tableEmp.userName);
    }
  }
  updateSortingState(column: any) {
    if (column === this.sortingState.sortKey && this.sortingState.sortOrder === 'asc') {
      this.sortingState.sortOrder = 'desc';
    } else {
      this.sortingState = {
        sortKey: column,
        sortOrder: 'asc'
      };
    }
  }
    private resetDataValues() {
        this.values = null;
    }

  loadEmployee(id: number) {
    this.driverManagementService
      .getEmployee(id)
      .pipe(
        filter(emp => !!emp.emplid),
        throwIfEmpty()
      )
      .subscribe(
        emp => {
          this.loadEmployeeData(emp);
        }
      );
  }

  loadEmployeeData(emp: any) {
    this.selectedEmplId = emp.emplid;
    this.selectedEmp = emp;
    this.userPanelIsLoading = false;
  }

  onPageChange(event: any): void {
    this.tableSize = event.rows;
    this.firstRecord = event.first;
    this.onSearch$.next(this.mostRecentSearch);
  }
  onColumnSelect(event: any) {
    this.resetDataValues();
    this.updateSortingState(event.columnName);
    this.driverManagementService.searchForUsers(
        this.mostRecentSearch,
        0,
        event.rowsPerPage,
        this.activeFilters, this.sortingState)
        .subscribe((response: any) => {
        this.loadResult(response);
        });
  }

  goToFullscreen(selectedEmp: string): void {
    this.router.navigate(['./user/' + selectedEmp], {
      relativeTo: this.route
    });
  }

  buildSearchSubject() {
      this.onSearch$ = new Subject<any>();
      this.onSearch$
          .pipe(
              switchMap(query =>
                  this.driverManagementService.searchForUsers(
                      query,
                      this.firstRecord,
                      this.tableSize,
                      this.activeFilters,
                      this.sortingState
                  )
              )
          )
          .subscribe(emps =>
              this.searchForUsersSubscribe(emps));
  }


  onSearch(event: string) {
    this.firstRecord = 0;
    this.mostRecentSearch = event;
    this.onSearch$.next(event);
  }

  buildFilters(): Filter[] {
    return [
      this.buildPreferredNameFilter(),
      this.buildPreferredLANameFilter(),
      this.buildPreferredAlphaFilter(),
      this.buildPreferredBUFilter(),
      this.buildPreferredStatusFilter()
    ];
  }

  buildPreferredNameFilter(): ElasticFilter {
    return new ElasticFilter(
        'First Name', 'firstName',
        event => this.driverManagementService.searchForColumn(event.query, 'firstName')
    );
  }
  buildPreferredLANameFilter(): ElasticFilter {
    return new ElasticFilter('Last Name', 'lastName', event =>
      this.driverManagementService.searchForLColumn(event.query, 'lastName')
    );
  }
  buildPreferredAlphaFilter(): ElasticFilter {
    return new ElasticFilter('Alpha Code', 'userID', event =>
      this.driverManagementService.searchForAlphaColumn(event.query, 'userID')
    );
  }

  buildPreferredBUFilter(): ElasticFilter {
    return new ElasticFilter('Business Unit', 'positions.businessUnit', event =>
      this.driverManagementService.searchForBUColumn(
        event.query,
        'positions.businessUnit'
      )
    );
  }

  buildPreferredStatusFilter(): ElasticFilter {
    return new ElasticFilter('Status', 'personDTO.status', event =>
      this.driverManagementService.searchForStatusColumn(
        event.query,
        'personDTO.status'
      )
    );
  }

  onFilter(filters: Filter[]) {
    this.firstRecord = 0;
    this.activeFilters = filters as ElasticFilter[];
    this.onSearch$.next(this.mostRecentSearch);
  }
}
