import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { User, UserService } from 'lib-platform-services';

import { ErrorReprocessingService } from './error-reprocessing.service';
import { Route } from '@angular/compiler/src/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../app.service';
import { MenuItem } from 'primeng/components/common/menuitem';
import { ConfirmationService } from 'primeng/api';
import * as moment from 'moment-timezone';
import { timer, Subscription } from 'rxjs';
import { DataPanelColumn, CheckboxConfig, PanelButton } from '../shared/data-panel/data-panel.component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { RightPanelHelper } from '../shared/data-panel/RightPanelHelper';

import { Subject } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { MessageService } from 'primeng/components/common/messageservice';

import { Filter, ElasticFilter, FilterOptions, CheckboxFilter, DateFilter } from '../shared/filter-panel/filter/filter.model';



@Component({
  selector: 'admin-error-message-reprocessing',
  templateUrl: './error-message-reprocessing.component.html',
  styleUrls: ['./error-message-reprocessing.component.scss']
})
export class ErrorMessageReprocessingComponent implements OnInit, AfterViewInit {

  @ViewChild('sharedPanel') sharedPanel: any;
  buttons: PanelButton[] = [];
  reprocessForm: FormGroup;
  isSubscribeFlag: boolean = true;
  filters: Filter[];
  activeFilters: Filter[];
  mostRecentSearch: string = '';
  onSearch$: Subject<any>;
  filterOptions: Array<FilterOptions> = [];
  firstRecord: number = 0;
  rightPanelHelper: RightPanelHelper;
  subscription: Subscription;
  isMultipleCheckboxes: boolean = false;
  isReprocessingFlag: boolean = false;
  isDeleteFlag: boolean = false;
  isCancelFlag: boolean = false;
  tableSize: number = 25;
  selectedRow: Array<object>;
  isGridLoading: boolean;
  errMessage: string;
  totalRecords: number;
  checkboxConfig: CheckboxConfig;
  taskIds: number[];
  tableParam: any;
  errorsToProcess: any;
  reprocessParam: any;
  errorProcessingColumns: DataPanelColumn[] = [
    { field: 'exceptionDomain', header: 'Exception Domain', sortable: false },
    { field: 'exceptionSubdomain', header: 'Exception Subdomain', sortable: false },
    { field: 'originQueue', header: 'Origin Queue', sortable: false },
    { field: 'exceptionType', header: 'Exception Type', sortable: false },
    { field: 'dateTime', header: 'Date & Time', sortable: false },
    { field: 'status', header: 'Status', sortable: false }
  ];

  constructor(private readonly errorReprocessing: ErrorReprocessingService,
    private readonly userService: UserService,
    private readonly route: Router,
    private readonly appService: AppService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private confirmationService: ConfirmationService) {
    this.rightPanelHelper = new RightPanelHelper();
    this.setBreadcrumbs();
  }

  ngOnInit() {
    this.errorReprocessing.getStatus().subscribe((data: Array<FilterOptions>) => {
      this.filterOptions = data;
    });
    this.loadUser();
    this.checkboxConfig = {
      checkboxCallback: (values) => {
        this.selectedRow = values;
        if (values.length) {
          this.isMultipleCheckboxes = values.length > 1 ? true : false;
          this.updateButton();
        } else {
          this.updateButton();
        }
      },
      hasAccess: true
    };
    this.onSearch$ = new Subject<any>();
    this.activeFilters = [];
    this.createForm();
  }

  ngAfterViewInit() {
    this.errorReprocessing.getStatus().subscribe((data: Array<FilterOptions>) => {
      this.filterOptions = data;
      this.filters = this.setFilter();
    });
  }

  setBreadcrumbs(): void {
    const breadcrumbs: MenuItem[] = [{ label: 'Error Reprocessing', routerLink: '/messagereprocessing' }];
    this.appService.breadcrumbs = breadcrumbs;
  }
  loadUser() {
    this.userService.load().subscribe(user => {
      const userDetails = new User(user);
      const query = this.errorReprocessing.getQueryForTaskIds(userDetails['userId']);
      this.errorReprocessing.userTasks(query).subscribe(response => {
        this.getTaskIds(response['hits']['hits']);
      });
    });
  }

  getTaskIds(taskDetails) {
    this.taskIds = [];
    if (taskDetails && taskDetails[0]['_source']) {
      taskDetails[0]['_source']['taskAssignments'].forEach(element => {
        this.taskIds.push(element['taskAssignmentID']);
      });
      this.tableParam = this.errorReprocessing.getTableParam(this.taskIds);
      this.getErrorList();
    }
  }

  getErrorList() {
    this.isGridLoading = true;
    this.errorReprocessing.getErrorList(this.tableParam).subscribe(res => {
      this.errorListData(res);
    }, err => {
      this.isGridLoading = false;
    });
  }
  onRowSelect(event: any) {
    this.route.navigate(['/messagereprocessing/details', event.errorProcessId]);
  }

  errorListData(res) {
    if (res.content) {
      res.content.forEach(errorProcess => {
        errorProcess.dateTime = moment(errorProcess.dateTime).tz('America/Chicago').format('MM/DD/YYYY HH:mm z');
      });
    }
    this.errorsToProcess = res.content;
    this.totalRecords = res.totalElements;
    this.isGridLoading = false;
  }
  onPageChange(event: any) {
    this.selectedRow = [];
    this.sharedPanel.resetGrid();
    this.updateButton();
    this.tableParam.pageNumber = event.page;
    this.tableParam.recordCount = event.rows;
    this.getErrorList();
  }

  reprocessClick = () => {
    this.errMessage =
      this.isMultipleCheckboxes ? 'Re-process Multiple Error' : 'Re-process Error';
    this.onClickReprocess();
  }

  onClickReprocess(): void {
    let count = 0;
    this.selectedRow.forEach((data: any) => {
      count = (data.status !== 'New' && data.status !== 'Failed To Reprocess') ? count + 1 : count;
    });
    if (count === 0) {
      this.isReprocessingFlag = true;
    } else {
      this.messageService.add({
        severity: 'info',
        summary: '',
        detail: 'Selected Errors cannot be processed together. Please revisit the selection.'
      });
    }
  }

  deleteClick = () => {
    this.isDeleteFlag = true;
    this.confirmationService.confirm({
      message: 'Do you want to delete the error without processing?',
      accept: () => this.onClickOk(),
      reject: () => { }
    });
  }

  onNo() {
    this.isDeleteFlag = false;
    this.isCancelFlag = false;
    this.isReprocessingFlag = false;
  }

  cancelClick = () => {
    this.isCancelFlag = true;
    this.confirmationService.confirm({
      message: 'Clicking on cancel will not make any updates to the data. All the updates will be lost.',
      accept: () => this.onClickOk(),
      reject: () => { }
    });
  }

  closeIconClicked() {
      this.isDeleteFlag = false;
      this.isCancelFlag = false;
      this.onClickCancel();
  }

  createForm(): void {
    this.reprocessForm = this.fb.group({
      comment: ['', Validators.compose([this.validateEmptyField,
      Validators.maxLength(500), Validators.required])]
    });
  }

  validateEmptyField(c: FormControl) {
    return c.value && !c.value.trim() ? {
      required: {
        valid: false
      }
    } : null;
  }

  onClickCancel(): void {
    this.reprocessForm.reset();
    this.isReprocessingFlag = false;
  }

  onSave(): void {
    if (this.reprocessForm.valid) {
      this.isReprocessingFlag = false;
      this.createParam();
      this.reprocessParam.action = 'REPROCESS';
      this.reprocessParam.isEdited = false;
      this.reprocessParam.errorMessageComment = this.reprocessForm.get('comment').value.trim();
      this.selectedRow.forEach((value: any) => {
        this.reprocessParam.errorProcessIds.push(value.errorProcessId);
      });
      this.errorReprocessCall();
    } else {
      this.reprocessForm.controls['comment'].markAsTouched();
    }
  }


  errorReprocessCall(): void {
    this.errorReprocessing.errorReprocess(this.reprocessParam).pipe(takeWhile(() =>
      this.isSubscribeFlag)).subscribe((data: any) => {
        if (data) {
          this.selectedRow = [];
          this.messageService.add({
            severity: 'info',
            summary: '',
            detail: 'Error submitted to queue for reprocessing.'
          });
        }
        this.sharedPanel.resetGrid();
        this.getErrorList();
        this.updateButton();
      });
  }

  onClickOk(): void {
    if (this.isCancelFlag) {
      this.isCancelFlag = false;
      this.selectedRow = [];
      this.sharedPanel.resetGrid();
      this.updateButton();
    } else {
      this.isDeleteFlag = false;
      this.createParam();
      this.reprocessParam.action = 'CANCELLED';
      this.reprocessParam.isEdited = false;
      this.reprocessParam.errorMessageComment = '';
      this.getErrorIds();
      this.errorReprocessing.errorReprocess(this.reprocessParam).pipe(takeWhile(() =>
        this.isSubscribeFlag)).subscribe((data) => {
        });
      this.selectedRow = [];
      this.sharedPanel.resetGrid();
      this.getErrorList();
      this.updateButton();
    }
  }

  getErrorIds(): void {
    this.selectedRow.forEach((value: any) => {
      this.reprocessParam.errorProcessIds.push(value.errorProcessId);
    });
  }

  createParam(): void {
    this.reprocessParam = {
      action: '',
      actionPlace: this.isMultipleCheckboxes ? 'GRID' : '',
      errorMessageComment: '',
      jsonPayload: {},
      isEdited: '',
      errorProcessIds: []
    };
  }

  updateButton() {
    if (this.selectedRow && this.selectedRow.length) {
      this.buttons = [{
        label: 'Cancel',
        style: 'ui-button-secondary',
        click: this.cancelClick
      }, {
        label: 'Delete',
        style: 'ui-button-secondary',
        click: this.deleteClick
      }, {
        label: 'Reprocess',
        style: 'ui-button-primary',
        click: this.reprocessClick
      }];
    } else {
      this.buttons = [];
    }
  }

  setFilter() {
    return [
      this.domainFilter(),
      this.subDomainFilter(),
      this.statusFilter(),
      this.buildDateFilter()
    ];
  }

  domainFilter(): ElasticFilter {
    return new ElasticFilter('Exception Domain', '_embedded.applicationDomains',
    (event) => this.errorReprocessing.getDomainValues(event, this.tableParam.subDomain));
  }

  subDomainFilter(): ElasticFilter {
    return new ElasticFilter('Exception Subdomain', '_embedded.applicationDomains',
    (event) => this.errorReprocessing.getSubDomainValues(event, this.tableParam.domain));
  }
  statusFilter(): CheckboxFilter {
    const staticFilterOptions: Array<FilterOptions> = [
      { label: ' ', value: ' ', indexOf: 0 }
    ];
    this.filterOptions = this.filterOptions.length > 0 ? this.filterOptions : staticFilterOptions;
    return new CheckboxFilter(
      'Status', 'errorStatusCode', null, null,
      this.filterOptions, ['New']
    );
  }
  buildDateFilter(): DateFilter {
    return new DateFilter(
      'Date', 'Date'
    );
  }
  onFilter( filters: Filter[]) {
    if (filters.length) {
      this.getFilterValues(filters);
  } else {
    this.filters[2].model = ['New'];
    this.getFilterValues(filters);
  }
}
getFilterValues(filters: Filter[]) {
  this.firstRecord = 0;
  this.activeFilters = (filters as ElasticFilter[]);
  if (this.subscription && !this.subscription.closed) {
    this.subscription.unsubscribe();
  }
    this.isGridLoading = true;
  this.subscription = this.errorReprocessing.searchForUsers(
    this.taskIds,
    this.activeFilters,
    this.tableParam).subscribe(data => {
  this.errorListData(data);
 });
}

}