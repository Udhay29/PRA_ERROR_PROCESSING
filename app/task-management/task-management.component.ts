import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import {
  DataPanelColumn,
  PanelButton,
  CheckboxConfig
} from '../shared/data-panel/data-panel.component';
import { RightPanelHelper } from '../shared/data-panel/RightPanelHelper';
import { takeUntil, switchMap, delay, filter } from 'rxjs/operators';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { TaskManagementService } from './task-management.service';
import { TaskDetail, DatagridSearchReponse } from './task-management.model';
import { AppService } from '../app.service';
import { User, UserService } from 'lib-platform-services';
import {
  Filter,
  ElasticFilter,
  CheckboxFilter,
  FilterOptions,
} from 'src/app/shared/filter-panel/filter/filter.model';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { TaskmanagementAddEditTaskComponent } from './task-management-addEdit-task/taskmanagement-addEdit-task.component';
import {
  ActivatedRoute,
  ParamMap,
  Router,
  NavigationEnd
} from '@angular/router';

@Component({
  selector: 'admin-task-management',
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss']
})
export class TaskManagementComponent implements OnInit, OnDestroy {
  @ViewChild('addEditTask')
  addEditTaskComponent: TaskmanagementAddEditTaskComponent;

  destroyed$: any = new Subject<boolean>();
  rightPanelHelper: RightPanelHelper;
  mode: 'addEdit-task' | '';
  taskList: DatagridSearchReponse[];
  taskDetail: TaskDetail;
  key: any;
  rows: any;
  currentOffset: number = 0;
  tableSize: number = 25;
  totalRecords: number;
  hitCount: number;
  mostRecentSearch: any;
  onSearch$: Subject<any>;
  filters: Filter[];
  activeFilters: Filter[];
  columns: DataPanelColumn[] = [
    { field: 'assignmentTitle', header: 'Assignment Title', sortable: true },
    { field: 'taskCategory', header: 'Task Category', sortable: true },
    { field: 'workTypes', header: 'Work Type', isList: true },
    { field: 'workValues', header: 'Work Value', isList: true },
    { field: 'responsibleTeams', header: 'Responsible Team', isList: true },
    { field: 'status', header: 'Status' }
  ];
  buttons: PanelButton[] = [];
  user: User;
  sortingState: {
    sortKey: string | null;
    sortOrder: 'asc' | 'desc';
  } = {
    sortKey: null,
    sortOrder: 'asc'
  };

  checkboxConfig: CheckboxConfig;
  overflowMenu: MenuItem[] = [];
  selectedTaskAssignments: DatagridSearchReponse[] = [];
  selectedTaskId: number;

  constructor(
    private taskManagementService: TaskManagementService,
    private cd: ChangeDetectorRef,
    private appService: AppService,
    private userService: UserService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.rightPanelHelper = new RightPanelHelper();
    this.userService.load().subscribe(user => {
      this.user = new User(user);
      if (this.user.hasUpdateLevelAccess('/taskmanagement')) {
        this.checkboxConfig = {
          checkboxCallback: values => {
            this.selectedTaskAssignments = values;
          },
          hasAccess: true
        };
        this.buttons.push({
          label: 'Add New Task',
          style: 'ui-button-primary',
          click: this.addNewTask
        });
        this.overflowMenu.push({
          label: 'Remove Task Assignment',
          command: this.inactivateSelectedTaskAssignments
        });
      }
    });
    this.overflowMenu.push({
      label: 'Export to Excel'
    });
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => of(+params.get('id'))),
        filter((id: number) => !!id),
        switchMap((id: number) => {
          this.rightPanelHelper.setOpen();
          return this.taskManagementService.getTaskDetails(+id);
        })
      )
      .subscribe((result: TaskDetail | any) => {
        this.selectedTaskId = result.id;
      });
    this.filters = this.buildFilters();
    this.activeFilters = [
      this.filters.find(filterObj => filterObj.name === 'Status')
    ];
    this.taskManagementService
      .searchForTasks('', 0, 25, this.activeFilters)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((response: any) => {
        this.taskList = response.tasks;
        this.totalRecords = response.hitCount;
        this.buildSearchSubject();
        this.setBreadcrumbs();
      });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/taskmanagement') {
        this.selectedTaskId = null;
        this.mode = '';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onRowSelect(event) {
    this.rightPanelHelper.setOpen();
    if (this.mode === 'addEdit-task') {
      this.addEditTaskComponent.confirmActionIfTouched(() => {
        this.mode = '';
        this.selectedTaskId = event.taskAssignmentID;
        this.router.navigate(['taskmanagement/', event.taskAssignmentID]);
      });
    } else {
      this.selectedTaskId = event.taskAssignmentID;
      this.router.navigate(['taskmanagement/', event.taskAssignmentID]);
    }
  }

  onColumnSelect(event: any) {
    this.resetDataGrid();
    this.updateSortingState(event.columnName);
    this.taskManagementService
      .searchForTasks(
        this.mostRecentSearch,
        0,
        event.rowsPerPage,
        this.activeFilters,
        this.sortingState
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe((response: any) => {
        this.taskList = response.tasks;
        this.totalRecords = response.hitCount;
      });
  }

  taskUpdated() {
    this.taskManagementService
      .getTaskDetails(this.taskDetail.id)
      .subscribe(task => (this.taskDetail = task));
  }

  setBreadcrumbs(): void {
    const breadcrumbs: MenuItem[] = [
      { label: 'Task Management', routerLink: '/taskmanagement' }
    ];
    this.appService.breadcrumbs = breadcrumbs;
  }

  onPageChange(event: any): void {
    this.tableSize = event.rows;
    this.currentOffset = event.first;
    this.taskManagementService
      .searchForTasks(
        this.mostRecentSearch,
        event.first,
        event.rows,
        this.activeFilters,
        this.sortingState
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe((response: any) => {
        this.taskList = response.tasks;
        this.totalRecords = response.hitCount;
      });
  }

  onFilter(filters: Filter[]) {
    this.activeFilters = filters as ElasticFilter[];
    this.onSearch$.next(this.mostRecentSearch);
  }

  onSearch(event: any) {
    this.mostRecentSearch = event;
    this.onSearch$.next(event);
  }

  buildSearchSubject() {
    this.onSearch$ = new Subject<any>();
    this.onSearch$
      .pipe(
        switchMap(query =>
          this.taskManagementService.searchForTasks(
            query,
            0,
            this.tableSize,
            this.activeFilters,
            this.sortingState
          )
        )
      )
      .subscribe((response: any) => {
        this.taskList = response.tasks;
        this.totalRecords = response.hitCount;
        this.cd.markForCheck();
      });
  }

  buildFilters(): Filter[] {
    return [
      this.buildAssignmentTitleFilter(),
      this.buildTaskCategoryFilter(),
      this.buildWorkTypeFilter(),
      this.buildWorkValueFilter(),
      this.buildResponsibleTeamFilter(),
      this.buildRoleFilter(),
      this.buildAssignToFilter(),
      this.buildStatusFilter()
    ];
  }

  buildRoleFilter(): ElasticFilter {
    return new ElasticFilter(
      'Role', 'teamMemberTaskAssignmentRoleAssociationDTOs.roleTypeName',
      (event) => this.taskManagementService.searchForRoles(event.query)
    );
  }

  buildAssignmentTitleFilter(): ElasticFilter {
    return new ElasticFilter('Assignment Title', 'taskAssignmentName', event =>
      this.taskManagementService.searchForAssignmentTitle(event.query)
    );
  }

  buildTaskCategoryFilter(): ElasticFilter {
    return new ElasticFilter('Task Category', 'taskGroupName', event =>
      this.taskManagementService.searchForTaskCategory(event.query)
    );
  }

  buildWorkTypeFilter(): ElasticFilter {
    return new ElasticFilter(
      'Work Type',
      'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskResponsibilityTypeDescription',
      event => this.taskManagementService.searchforWorkType(event.query)
    );
  }

  buildWorkValueFilter(): ElasticFilter {
    return new ElasticFilter(
      'Work Value',
      'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskAssignmentResponsibilityDetailValueDesc',
      event => this.taskManagementService.searchforWorkValue(event.query)
    );
  }

  buildResponsibleTeamFilter(): ElasticFilter {
    return new ElasticFilter(
      'Responsible Team',
      'teamMemberTaskAssignmentRoleAssociationDTOs.teamName',
      event => this.taskManagementService.searchforResponsibleTeam(event.query)
    );
  }

  buildAssignToFilter(): ElasticFilter {
    return this.taskManagementService.assignToFilter;
  }

  buildStatusFilter(): CheckboxFilter {
    const filterOptions: Array<FilterOptions> = [
      { label: 'Active', value: 'active', indexOf: 0 },
      { label: 'Inactive', value: 'inactive', indexOf: 1 }
    ];
    return new CheckboxFilter(
      'Status',
      'expirationTimestamp',
      'Active',
      null,
      filterOptions,
      ['active']
    );
  }

  close(event): void {
    this.mode = '';
    this.rightPanelHelper.setClosed();
    if (event) {
      this.selectedTaskId = 0;
      this.resetDataGrid();
      this.wait()
        .pipe(
          switchMap(_ =>
            this.taskManagementService.searchForTasks(
              this.mostRecentSearch,
              this.currentOffset,
              this.tableSize,
              this.activeFilters,
              this.sortingState
            )
          )
        )
        .subscribe((response: any) => {
          this.taskList = response.tasks;
          this.totalRecords = response.hitCount;
        });
    }
  }

  wait(): Observable<any> {
    return of({}).pipe(delay(500));
  }

  addNewTask = () => {
    this.mode = 'addEdit-task';
    this.selectedTaskId = null;
    this.rightPanelHelper.setOpen();
  }

  private resetDataGrid() {
    this.taskList = null;
  }

  private updateSortingState(column: any) {
    if (
      column === this.sortingState.sortKey &&
      this.sortingState.sortOrder === 'asc'
    ) {
      this.sortingState.sortOrder = 'desc';
    } else {
      this.sortingState = {
        sortKey: column,
        sortOrder: 'asc'
      };
    }
  }

  private inactivateSelectedTaskAssignments = () => {
    if (this.selectedTaskAssignments.length <= 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Nothing Selected',
        detail: 'You must select at least one task assignment for removal'
      });
      return;
    }

    const moreThanOne: boolean = this.selectedTaskAssignments.length > 1;

    const removeAssignments = () => {
      let joined$: Observable<any>;
      for (const taskAssignment of this.selectedTaskAssignments) {
        if (joined$) {
          joined$ = forkJoin(
            joined$,
            this.taskManagementService.inactivateTask(
              taskAssignment.taskAssignmentID
            )
          );
        } else {
          joined$ = this.taskManagementService.inactivateTask(
            taskAssignment.taskAssignmentID
          );
        }
      }
      joined$.subscribe(
        res => {
          this.messageService.add({
            severity: 'success',
            summary: (moreThanOne ? 'Task' : 'Tasks') + ' Removed',
            detail:
              'The selected ' +
              (moreThanOne ? 'task' : 'tasks') +
              ' has been inactivated.'
          });
          this.selectedTaskAssignments = [];
          this.onSearch$.next(this.mostRecentSearch);
        },
        (err: Error) =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message
          })
      );
    };

    this.confirmationService.confirm({
      message:
        'This will remove ' +
        this.selectedTaskAssignments.length +
        ' ' +
        (moreThanOne ? 'task' : 'tasks') +
        ' task assignments. Are you sure?',
      accept: () => removeAssignments(),
      reject: () => {}
    });
  }
}

