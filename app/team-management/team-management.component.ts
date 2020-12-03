import {Component, OnInit, ChangeDetectorRef, OnDestroy, AfterViewInit, ViewChild} from '@angular/core';
import {DataPanelColumn, PanelButton, CheckboxConfig, DataPanelComponent} from '../shared/data-panel/data-panel.component';
import {DataGridSearchResponse, sortFields, TeamDetail} from './team-management.model';
import {Filter, ElasticFilter, CheckboxFilter, FilterOptions} from 'src/app/shared/filter-panel/filter/filter.model';
import {TeamManagementService} from '../team-management/team-management.service';
import {takeUntil, switchMap, map, mergeMap} from 'rxjs/operators';
import {Subject, Observable, forkJoin} from 'rxjs';
import {MenuItem, ConfirmationService} from 'primeng/api';
import {User, UserService} from 'lib-platform-services';
import {AppService} from '../app.service';
import {RightPanelHelper} from '../shared/data-panel/RightPanelHelper';
import {MessageService} from 'primeng/components/common/messageservice';
import {ActivatedRoute, Router, ActivatedRouteSnapshot, NavigationEnd} from '@angular/router';
import {Store, select} from '@ngrx/store';
import * as fromState from './state';
import {CloseRightPanel} from './state/team-management.actions';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'admin-team-management',
  templateUrl: './team-management.component.html',
  styleUrls: ['./team-management.component.scss']
})
export class TeamManagementComponent implements OnInit, OnDestroy, AfterViewInit {

  columns: DataPanelColumn[] = [
    {field: 'teamName', header: 'Name', sortable: true},
    {field: 'taskCategory', header: 'Task Category'},
    {field: 'teamLeader', header: 'Team Leader'},
    {field: 'createdBy', header: 'Created By'},
    {field: 'updatedBy', header: 'Last Updated By'},
    {field: 'lastUpdateTimestamp', header: 'Last Updated', sortable: true},
    {field: 'numberOfMembers', header: 'Members', sortable: true},
    {field: 'status', header: 'Status'}
  ];
  teamLeaderCodes = [];
  employeeCodes = [];
  filterOptions: Array<FilterOptions> = [];
  pageRowCount: number;
  teamList: DataGridSearchResponse[];
  rightPanelHelper: RightPanelHelper;
  filters: Filter[];
  activeFilters: Filter[];
  destroyed$: any = new Subject<boolean>();
  totalRecords: number;
  onSearch$: Subject<any>;
  tableSize: number = 25;
  buttons: PanelButton[] = [];
  checkboxConfig: CheckboxConfig;
  overflowMenu: MenuItem[] = [];
  selectedTeamManagement: DataGridSearchResponse[] = [];
  mostRecentSearch: any;
  hitCount: number;
  viewMode: string;
  user: User;
  selectedTeam: TeamDetail;
  selectedTeamID: string;
  temp: string;
  sortingState: {
    sortKey: string | null,
    sortOrder: 'asc' | 'desc'
  } = {
    sortKey: 'lastUpdateTimestamp',
    sortOrder: 'desc'
  };
  filterColumnName: string;
  fullScreen: boolean;
  templateName = 'Detail';
  hideLeftPanel = false;
  @ViewChild('dataPanelRefresh') sharedDataPanel: DataPanelComponent;

  constructor(private teamManagementService: TeamManagementService,
              private cd: ChangeDetectorRef,
              private userService: UserService,
              private messageService: MessageService,
              private confirmationService: ConfirmationService,
              private appService: AppService,
              private route: ActivatedRoute,
              private router: Router,
              private store: Store<any>) {
    this.rightPanelHelper = new RightPanelHelper();
    this.userService.load().subscribe(user => {
      this.user = new User(user);
      if (this.user.hasUpdateLevelAccess('/teammanagement')) {
        this.checkboxConfig = {
          checkboxCallback: (values) => {
            this.selectedTeamManagement = values;
          },
          hasAccess: true
        };
        this.buttons.push({
          label: 'Add Team',
          style: 'ui-button-primary',
          click: this.addNewTeam
        });
        this.overflowMenu.push({
          label: 'Inactivate Selected Team',
          command: this.inactivateSelectedTeams
        });
      }
    });
    this.overflowMenu.push({
      label: 'Export to Excel'
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.url === '/team-management') {
        this.store.dispatch(new CloseRightPanel());
      }
    });
    this.store.pipe(select(fromState.getPanelOpen)).subscribe((panelOpen) => {
      if (panelOpen) {
        this.rightPanelHelper.setOpen();
      } else {
        this.rightPanelHelper.setClosed();
      }
    });
  }

  ngOnInit() {
    this.hideLeftPanel = false;
    this.fullScreen = false;
    this.filters = this.buildFilters();
    this.activeFilters = [this.filters.find(filter => filter.name === 'Status')];
    this.teamManagementService.searchForTeams('', 1, this.tableSize, this.sortingState,
      this.activeFilters, this.teamLeaderCodes, this.employeeCodes)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (response: any) => {
          this.teamList = response.teams;
          this.totalRecords = response.teams[0].records;
          this.buildSearchSubject();
          this.setBreadcrumbs();
        });

    /* Grid Table reset  */
    this.teamManagementService.onTableReset$.subscribe((data) => {
      if (data) {
        this.pageRowCount = this.sharedDataPanel.table.rows;
        this.teamManagementService.searchForTeams(
          this.mostRecentSearch,
          this.teamManagementService.selectedPage,
          this.sharedDataPanel.table.rows,
          this.sortingState,
          this.activeFilters,
          this.teamLeaderCodes,
          this.employeeCodes)
          .pipe(takeUntil(this.destroyed$))
          .subscribe((response: any) => {
            this.teamList = response.teams;
            this.totalRecords = response.hitCount;
          });
      }
    });
  }

  validateFullScreen(event) {
    this.templateName = 'Profile';
  }

  ngAfterViewInit(): void {
    this.teamManagementService.getTaskCategoriesForFilter().subscribe((taskCategory) => {
      this.filterOptions = taskCategory;
      this.filters = this.buildFilters();
      this.activeFilters = [this.filters.find(filter => filter.name === 'Status')];
    });
  }

  onActivate(event) {
    if (event.fullscreen) {
      event.fullScreen.subscribe((data) => {
        this.hideLeftPanel = true;
      });
    }
  }

  onPageChange(event: any): void {
    this.pageRowCount = event.rows;
    this.teamManagementService.searchForTeams(
      this.mostRecentSearch,
      event.page,
      event.rows,
      this.sortingState,
      this.activeFilters,
      this.teamLeaderCodes,
      this.employeeCodes)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((response: any) => {
        this.teamList = response.teams;
        this.totalRecords = response.hitCount;
      });
  }

  onColumnSelect(event: any) {
    this.filterColumnName = event.columnName;
    this.resetDataGrid();
    this.updateSortingState(event.columnName);
    this.teamManagementService.searchForTeams(
      this.mostRecentSearch, 1,
      event.rowsPerPage,
      this.sortingState,
      this.activeFilters,
      this.teamLeaderCodes,
      this.employeeCodes)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((response: any) => {
        this.teamList = response.teams;
        this.totalRecords = response.hitCount;
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  setBreadcrumbs(): void {
    this.appService.breadcrumbs = [{label: 'Team Management', routerLink: '/team-management'}];
  }

  private resetDataGrid() {
    this.teamList = null;
  }

  private updateSortingState(column: any) {
    if (column === this.sortingState.sortKey && this.sortingState.sortOrder === 'asc') {
      this.sortingState.sortOrder = 'desc';
    } else {
      this.sortingState = {
        sortKey: column,
        sortOrder: 'asc'
      };
    }
  }

  onSearch(event: string) {
    this.mostRecentSearch = event;
    this.onSearch$.next(event);
  }

  buildSearchSubject() {
    let filterObject = [];
    this.onSearch$ = new Subject<any>();
    this.onSearch$.pipe(
      // tslint:disable-next-line:max-line-length
      switchMap(query => this.teamManagementService.searchForTeams(this.mostRecentSearch, 0, this.pageRowCount,
        this.sortingState, this.activeFilters, this.teamLeaderCodes, this.employeeCodes)))
      .subscribe((response: any) => {
        filterObject = response.teams;
        this.teamList = filterObject;
        this.totalRecords = response.hitCount;
        this.cd.markForCheck();
      });
  }

  onFilter(filters: Filter[]) {
    this.activeFilters = (filters as ElasticFilter[]);
    this.onSearch$.next(this.mostRecentSearch);
  }

  buildFilters(): Filter[] {
    return [
      this.buildTaskCategoryFilter(),
      this.buildEmployeeNameFilter(),
      this.buildTeamLeaderFilter(),
      this.buildStatusFilter()
    ];
  }


  buildTaskCategoryFilter(): CheckboxFilter {
    const staticFilterOptions: Array<FilterOptions> = [
      {label: ' ', value: ' ', indexOf: 0}
    ];
    this.filterOptions = this.filterOptions.length > 0 ? this.filterOptions : staticFilterOptions;
    return new CheckboxFilter(
      'Task Category', 'taskGroupName', null, null,
      this.filterOptions, []
    );
  }

  buildEmployeeNameFilter(): ElasticFilter {
    let descEmployeeName: any[];
    this.employeeCodes = [];
    return new ElasticFilter(
      'Employee Name', 'personDTO.prefName',
      (event) => {
        return this.teamManagementService.searchForEmployeeAndTeamLeader(event.query).pipe(
          map((res: any) => {
            descEmployeeName = [];
            this.employeeCodes = [];
            for (const empName of res) {
              descEmployeeName.push(empName.substring(0, empName.lastIndexOf(' ')));
              this.employeeCodes.push(empName);
            }
            return descEmployeeName;
          })
        );
      }
    );
  }

  buildTeamLeaderFilter(): ElasticFilter {
    let descTeamLeaderName: any[];
    this.teamLeaderCodes = [];
    return new ElasticFilter(
      'Team Leader', 'personDTO.prefName',
      (event) => {
        return this.teamManagementService.searchForEmployeeAndTeamLeader(event.query).pipe(
          map((res: any) => {
            descTeamLeaderName = [];
            this.teamLeaderCodes = [];
            for (const teamLeaderName of res) {
              descTeamLeaderName.push(teamLeaderName.substring(0, teamLeaderName.lastIndexOf(' ')));
              this.teamLeaderCodes.push(teamLeaderName);
            }
            return descTeamLeaderName;
          })
        );
      }
    );
  }

  // Making this static breaks a test
  buildStatusFilter(): CheckboxFilter {
    const filterOptions: Array<FilterOptions> = [
      {label: 'Active', value: 'activeTeamsOnly', indexOf: 0},
      {label: 'Inactive', value: 'inActiveTeamsOnly', indexOf: 1}
    ];
    return new CheckboxFilter(
      'Status', 'expirationTimeStamp', 'Active', null,
      filterOptions, ['activeTeamsOnly']
    );
  }

  onRowSelect(event) {
    this.selectedTeamID = event.teamID;
    this.router.navigate([this.selectedTeamID], {relativeTo: this.route});
  }

  addNewTeam = () => {
    this.router.navigate(['add/'], {relativeTo: this.route});
  }

  private inactivateSelectedTeams = () => {
    if (this.selectedTeamManagement.length <= 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Nothing Selected',
        detail: 'You must select at least one Team for removal'
      });
      return;
    }

    const moreThanOne: boolean = this.selectedTeamManagement.length > 1;

    const removeAssignments = () => {
      const joined$: Array<Observable<any>> = [];
      for (const teams of this.selectedTeamManagement) {
        joined$.push(
          this.teamManagementService.inactivateTeam(teams.teamID)
        );
      }
      joined$.map((obs) => {
        obs.subscribe(res => {
          this.sharedDataPanel.table.reset();
          this.sharedDataPanel.table.first = 0;
          this.sharedDataPanel.firstRow = 0;
          this.messageService.add({
            severity: 'success',
            summary: (moreThanOne ? 'Teams' : 'Team') + ' Inactivated',
            detail: res.body[0].teamName + (moreThanOne ? ' teams have' : ' team has') + ' has been inactivated.'
          });
          this.selectedTeamManagement = [];
          this.onSearch$.next(this.mostRecentSearch);
        }, (err: HttpErrorResponse) => {

          return this.messageService.add({
            severity: 'error',
            summary: 'Failed to Inactivate',
            detail: this.getErrorMessage(err)
          });
        });
      });

      this.sharedDataPanel.table.reset();
      this.sharedDataPanel.table.first = 0;
      this.sharedDataPanel.firstRow = 0;
      this.selectedTeamManagement = [];
      this.onSearch$.next(this.mostRecentSearch);
    };

    this.confirmationService.confirm({
      message: 'This will Inactivate ' + this.selectedTeamManagement.length + ' ' +
        (moreThanOne ? 'teams' : 'team') + '. Are you sure?',
      accept: () => removeAssignments(),
      reject: () => {
      }
    });
  }

  getErrorMessage(err: HttpErrorResponse): string {
    let detailErrorString = err.statusText;
    if (err.error && err.error.errors) {
      const detailErrorName = [];
      err.error.errors.forEach(e => {
        detailErrorName.push(e.errorMessage);
      });
      if (
        detailErrorString === err.statusText &&
        detailErrorName.length !== 0
      ) {
        detailErrorString = detailErrorName.join(', ');
      }
      return detailErrorString;
    }
    return 'Failed to inactivate team';
  }
}


