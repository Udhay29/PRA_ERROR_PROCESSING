import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';

import { ErrorMessageReprocessingModule } from './error-message-reprocessing.module';
import { UserService, LocalStorageService } from 'lib-platform-services';
import { MessageService } from 'primeng/components/common/messageservice';
import { RouterTestingModule } from '@angular/router/testing';

import { ErrorReprocessingService } from './error-reprocessing.service';
import { ConfirmationService } from 'primeng/api';

import { ErrorMessageReprocessingComponent } from './error-message-reprocessing.component';
import { of } from 'rxjs';
import { DataPanelComponent } from '../shared/data-panel/data-panel.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

describe('ErrorMessageReprocessingComponent', () => {
  let component: ErrorMessageReprocessingComponent;
  let fixture: ComponentFixture<ErrorMessageReprocessingComponent>;
  let sharedComponent: DataPanelComponent;
  let sharedFixture: ComponentFixture<DataPanelComponent>;
  const fb = new FormBuilder();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        BrowserAnimationsModule,
        ErrorMessageReprocessingModule,
        HttpClientTestingModule,
        RouterTestingModule],
      declarations: [],
      providers: [UserService, ErrorReprocessingService, LocalStorageService, MessageService, ConfirmationService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
      fixture = TestBed.createComponent(ErrorMessageReprocessingComponent);
      component = fixture.componentInstance;
      sharedFixture = TestBed.createComponent(DataPanelComponent);
      sharedComponent = sharedFixture.componentInstance;
      fixture.detectChanges();
      component.sharedPanel = sharedComponent;
      component.sharedPanel.values = [
        {
          'exceptionDomain': 'OPEX',
          'exceptionSubdomain': 'RescDetail',
          'originQueue': 'activeMQConsumer:queue:SUB.OPERATIONSEXECUTION.AOBRPT.SAFETY.T.AOBR.DUTY.STATUS.EVENT',
          'exceptionType': 'java.lang.IllegalArgumentException',
          'dateTime': '2019-11-04T00:30:52.382',
          'occurrance': null,
          'status': 'New',
          'errorMessage': null,
          'headerDetails': null,
          'jsonPayload': null,
          'errorMessageComment': null,
        'errorId': null,
          'errorProcessId': 3358731
        }
      ];
      component.tableParam = {
        taskAssignmentIds: [1],
        status: ['New'],
        domain: [],
        subDomain: [],
        originQueue: [],
        exceptionType: [],
        headerDetails: '',
        pageNumber: 0,
        recordCount: 25,
        sortBy: '',
        sortDirection: '',
        startDate: null,
        endDate: null
      };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should onNo', () => {
    component.onNo();
    expect(component.isDeleteFlag).toEqual(false);
  });

  it('should closeIconClicked', () => {
    component.closeIconClicked();
    expect(component.isCancelFlag).toEqual(false);
  });

  it('should createForm', () => {
    component.createForm();
  });

  it('should onClickCancel', () => {
    component.onClickCancel();
    expect(component.isReprocessingFlag).toEqual(false);
  });

  it('should cal ngafterviewinit', () => {
    const response = {
      '_embedded' : {
        'errorStatuses' : [ {
          'errorStatusCode' : 'Cancelled',
          'errorStatusDescription' : 'Cancelled',
          'lastUpdateTimestampString' : '2018-06-12T05:27:22.8798626',
          '_links' : {
            'self' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/Cancelled'
            },
            'errorStatus' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/Cancelled'
            },
            'errorDetails' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/Cancelled/errorDetails'
            }
          }
        }, {
          'errorStatusCode' : 'FailTReprc',
          'errorStatusDescription' : 'Failed To Reprocess',
          'lastUpdateTimestampString' : '2018-06-12T05:27:22.928407',
          '_links' : {
            'self' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/FailTReprc'
            },
            'errorStatus' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/FailTReprc'
            },
            'errorDetails' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/FailTReprc/errorDetails'
            }
          }
        }, {
          'errorStatusCode' : 'New',
          'errorStatusDescription' : 'New',
          'lastUpdateTimestampString' : '2018-06-12T05:27:22.8954829',
          '_links' : {
            'self' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/New'
            },
            'errorStatus' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/New'
            },
            'errorDetails' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/New/errorDetails'
            }
          }
        }, {
          'errorStatusCode' : 'RepwEdit',
          'errorStatusDescription' : 'Reprocessed With Edit',
          'lastUpdateTimestampString' : '2018-06-12T05:27:22.9111525',
          '_links' : {
            'self' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/RepwEdit'
            },
            'errorStatus' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/RepwEdit'
            },
            'errorDetails' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/RepwEdit/errorDetails'
            }
          }
        }, {
          'errorStatusCode' : 'RepwoEdit',
          'errorStatusDescription' : 'Reprocessed Without Edit',
          'lastUpdateTimestampString' : '2018-06-12T05:27:22.9111525',
          '_links' : {
            'self' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/RepwoEdit'
            },
            'errorStatus' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/RepwoEdit'
            },
            'errorDetails' : {
              'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/RepwoEdit/errorDetails'
            }
          }
        } ]
      },
      '_links' : {
        'self' : {
          'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus{?page,size,sort}',
          'templated' : true
        },
        'profile' : {
          'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/profile/errorstatus'
        },
        'search' : {
          'href' : 'https://platformadminservices-tst.jbhunt.com/messagereprocessingservices/errorstatus/search'
        }
      },
      'page' : {
        'size' : 20,
        'totalElements' : 5,
        'totalPages' : 1,
        'number' : 0
      }
    };
    spyOn(ErrorReprocessingService.prototype, 'getStatus').and.returnValue(of(response));
    component.ngAfterViewInit();
  });

  it('should cal setBreadcrumb', () => {
    component.setBreadcrumbs();
  });

  it('should cal loadUser', () => {
    const response1 = {
      'userName': null,
      'userId': 'rcon448',
      'firstName': 'Garish',
      'lastName': 'Samuel',
      'displayName': 'Garish Samuel',
      'runtimeEnvironment': null,
      'profilePicture': null,
      'auditUserInfo': null,
      'urlAccessList': [
        {
          'uri': '/errorreprocessing/process',
          'accessLevel': 5
        },
        {
          'uri': '/adminservices/subscriptions/usersubscriptions/inactivate/.*',
          'accessLevel': 4
        }
      ],
      'dataList': {}
    };

    const response2 = {
      'took': 20,
      'timed_out': false,
      '_shards': {
        'total': 3,
        'successful': 3,
        'skipped': 0,
        'failed': 0
      },
      'hits': {
        'total': 1,
        'max_score': 8.594451,
        'hits': [
          {
            '_index': 'infrastructure-employeeprofile-1-2019.03.29',
            '_type': '_doc',
            '_id': '302306',
            '_score': 8.594451,
            '_source': {
              'firstName': 'Garish',
              'lastName': 'Samuel',
              'emplid': '302306',
              'userID': 'RCON448',
              'isActive': true,
              'positions': [
                {
                  'businessUnit': 'ADM'
                }
              ],
              'personDTO': {
                'emplId': '302306',
                'userId': 'RCON448',
                'firstName': 'Garish',
                'middleName': '',
                'lastName': 'Samuel',
                'prefName': 'Garish',
                'personType': 'CWR',
                'personSubType': '',
                'isDriver': 'N',
                'status': 'A',
                'positionNbr': '00164970',
                'positionDescr': 'E\u0026T Contract Worker',
                'managerEmplId': '105435',
                'managerName': 'ROBERT POPE',
                'departmentCode': '',
                'costCenterID': '101613',
                'businessUnit': 'ADM',
                'jobCode': '001349',
                'jobTitle': 'E\u0026T Contract Worker',
                'jobGroup': 'Engineering and Technology - IT',
                'locationCode': 'LOWAR01',
                'locationDesc': 'Lowell, AR - JB Hunt Corporate',
                'phone': '',
                'extenstion': '',
                'email': ''
              },
              'teams': [
                {
                  'teamID': 247,
                  'teamName': 'Error Reprocessing Team',
                  'effectiveTimestamp': '2019-10-09T02:23:59.481',
                  'expirationTimestamp': '2099-12-31T23:59:00'
                }
              ],
              'taskAssignments': [
                {
                  'taskAssignmentID': 433,
                  'taskAssignmentName': 'Platform Application Support',
                  'taskGroupID': 175,
                  'taskGroupName': 'Application Support',
                  'roleTypeCode': [
                    'AppSupport'
                  ],
                  'taskAssignmentResponsibilityGroupDTOs': []
                },
                {
                  'taskAssignmentID': 443,
                  'taskAssignmentName': 'A\u0026L Application Support',
                  'taskGroupID': 175,
                  'taskGroupName': 'Application Support',
                  'roleTypeCode': [
                    'AppSupport'
                  ],
                  'taskAssignmentResponsibilityGroupDTOs': []
                },
                {
                  'taskAssignmentID': 445,
                  'taskAssignmentName': 'OM Application Support',
                  'taskGroupID': 175,
                  'taskGroupName': 'Application Support',
                  'roleTypeCode': [
                    'AppSupport'
                  ],
                  'taskAssignmentResponsibilityGroupDTOs': []
                }
              ],
              'backupTaskAssignments': [],
              'roles': [
                {
                  'roleTypeCode': 'AppSupport',
                  'roleTypeName': 'Application Support'
                }
              ]
            }
          }
        ]
      }
    };

    const response3 = {
      'content': [
        {
          'exceptionDomain': 'OPEX',
          'exceptionSubdomain': 'RescDetail',
          'originQueue': 'activeMQConsumer:queue:SUB.OPERATIONSEXECUTION.AOBRPT.SAFETY.T.AOBR.DUTY.STATUS.EVENT',
          'exceptionType': 'java.lang.IllegalArgumentException',
          'dateTime': '2019-11-04T00:30:52.382',
          'occurrance': null,
          'status': 'New',
          'errorMessage': null,
          'headerDetails': null,
          'jsonPayload': null,
          'errorMessageComment': null,
         'errorId': null,
          'errorProcessId': 3358731
        },
        {
          'exceptionDomain': 'OPEX',
          'exceptionSubdomain': 'RescDetail',
          'originQueue': 'activeMQConsumer:queue:SUB.OPERATIONSEXECUTION.AOBRPT.SAFETY.T.AOBR.DUTY.STATUS.EVENT',
          'exceptionType': 'java.lang.IllegalArgumentException',
          'dateTime': '2019-11-04T00:30:51.632',
          'occurrance': null,
          'status': 'New',
          'errorMessage': null,
          'headerDetails': null,
          'jsonPayload': null,
          'errorMessageComment': null,
          'errorId': null,
          'errorProcessId': 3358730
        },
       ],
      'last': false,
      'totalPages': 130835,
      'totalElements': 3270869,
      'size': 25,
      'number': 0,
      'sort': [
        {
          'direction': 'DESC',
          'property': 'errorProcess.lastUpdateTimestamp',
          'ignoreCase': false,
          'nullHandling': 'NATIVE',
          'descending': true,
          'ascending': false
        }
      ],
      'numberOfElements': 25,
      'first': true
    };
    spyOn(UserService.prototype, 'load').and.returnValue(of(response1));
    spyOn(ErrorReprocessingService.prototype, 'userTasks').and.returnValue(of(response2));
    spyOn(ErrorReprocessingService.prototype, 'getErrorList').and.returnValue(of(response3));
    component.loadUser();
    expect(component.isGridLoading).toEqual(false);
  });

  it('should call onRowSelect', () => {
    const event: any = {
      errorProcessId: 1
    };
    component.onRowSelect(event);
  });

  it('should call errorListData', () => {
    const data = {
      content: [{
        dateTime: new Date()
      }],
      totalElements: 1
    };
    component.errorListData(data);
    expect(component.isGridLoading).toEqual(false);
  });

  it('should call reprocessClick', () => {
    component.selectedRow = [{
      status: 'New'
    }];
    component.reprocessClick();
    component.isMultipleCheckboxes = true;
    expect(component.isMultipleCheckboxes).toEqual(true);
  });

  it('should call onClickReprocess for if', () => {
    component.selectedRow = [{
      status: 'New'
    }];
    component.onClickReprocess();
    expect(component.isReprocessingFlag).toEqual(true);
  });

  it('should call onClickReprocess for else', () => {
    component.selectedRow = [{
      status: 'abc'
    }];
    component.onClickReprocess();
    expect(component.isReprocessingFlag).toEqual(false);
  });

  it('should call deleteClick', () => {
    component.deleteClick();
    expect(component.isDeleteFlag).toEqual(true);
  });

  it('should call onNo', () => {
    component.onNo();
    expect(component.isDeleteFlag).toEqual(false);
  });

  it('should call cancelClick', () => {
    component.cancelClick();
    expect(component.isCancelFlag).toEqual(true);
  });

  it('should call closeIconClicked', () => {
    component.closeIconClicked();
    expect(component.isDeleteFlag).toEqual(false);
  });

  it('should call onClickCancel', () => {
    component.onClickCancel();
    expect(component.isReprocessingFlag).toEqual(false);
  });

  it('should call createParam', () => {
    const param = {
      action: '',
      actionPlace: component.isMultipleCheckboxes ? 'GRID' : '',
      errorMessageComment: '',
      jsonPayload: {},
      isEdited: '',
      errorProcessIds: []
    };
    component.createParam();
    expect(component.reprocessParam).toEqual(param);
  });

  it('should call gettaskid on else', () => {
    component.getTaskIds('');
  });

  it('should call errorlistdata else', () => {
    component.errorListData('');
    expect(component.isGridLoading).toEqual(false);
  });

  it('should change accordingly when appropriate page is selected', () => {
    const event = {page: 25, rows: 5};
    component.onPageChange(event);
    expect(component.tableParam.pageNumber).toEqual(25);
  });

  it('should call updateButton if condition', () => {
    component.selectedRow = [{
      checked: true,
      dateTime: '11/07/2019 12:47 CST',
      errorId: null,
      errorMessage: null,
      errorMessageComment: null,
      errorProcessId: 3472154,
      exceptionDomain: 'OrderMgmt',
      exceptionSubdomain: 'EventRoute',
      exceptionType: 'com.jbhunt.ordermanagement',
      headerDetails: null,
      jsonPayload: null,
      occurrance: null,
      originQueue: 'SUB.ORDERMANAGEMENT',
      status: 'New'
    }];
    const res = [{
      label: 'Cancel',
      style: 'ui-button-secondary',
      click: component.cancelClick
    }, {
      label: 'Delete',
      style: 'ui-button-secondary',
      click: component.deleteClick
    }, {
      label: 'Reprocess',
      style: 'ui-button-primary',
      click: component.reprocessClick
    }];
    component.updateButton();
    expect(component.buttons).toEqual(res);
  });

  it('should call updateButton else condition', () => {
    component.selectedRow = [];
    component.updateButton();
    expect(component.buttons).toEqual([]);
  });

  it('should call onClickOk if condition', () => {
    component.isCancelFlag = true;
    component.onClickOk();
    expect(component.isCancelFlag).toEqual(false);
  });

  it('should call onClickOk else condition', () => {
    component.isCancelFlag = false;
    component.selectedRow = [{
      checked: true,
      dateTime: '11/07/2019 12:47 CST',
      errorId: null,
      errorMessage: null,
      errorMessageComment: null,
      errorProcessId: 3472154,
      exceptionDomain: 'OrderMgmt',
      exceptionSubdomain: 'EventRoute',
      exceptionType: 'com.jbhunt.ordermanagement',
      headerDetails: null,
      jsonPayload: null,
      occurrance: null,
      originQueue: 'SUB.ORDERMANAGEMENT',
      status: 'New'
    }];
    spyOn(ErrorReprocessingService.prototype, 'errorReprocess').and.returnValue(of(['Cancelled']));
    component.onClickOk();
    expect(component.isDeleteFlag).toEqual(false);
  });

  it('should call errorReprocessCall else condition', () => {
    spyOn(ErrorReprocessingService.prototype, 'errorReprocess').and.returnValue(of(null));
    component.errorReprocessCall();
    expect(component.buttons).toEqual([]);
  });

  it('should call onSave if condition', () => {
    component.selectedRow = [{
      checked: true,
      dateTime: '11/07/2019 12:47 CST',
      errorId: null,
      errorMessage: null,
      errorMessageComment: null,
      errorProcessId: 3472154,
      exceptionDomain: 'OrderMgmt',
      exceptionSubdomain: 'EventRoute',
      exceptionType: 'com.jbhunt.ordermanagement',
      headerDetails: null,
      jsonPayload: null,
      occurrance: null,
      originQueue: 'SUB.ORDERMANAGEMENT',
      status: 'New'
    }];
    component.reprocessForm = fb.group({
      comment: ['Sample', Validators.required]
    });
    spyOn(ErrorReprocessingService.prototype, 'errorReprocess').and.returnValue(of(['Reprocess']));
    component.onSave();
    expect(component.isReprocessingFlag).toEqual(false);
  });
  it('should call onSave else condition', () => {
    component.reprocessForm = fb.group({
      comment: ['', Validators.required]
    });
    component.onSave();
    expect(component.isReprocessingFlag).toEqual(false);
  });

  it('should call onFilter', () => {
    const filters: any = [
      {
        name: 'status',
        field: 'errorStatusCode',
        type: 'CHECKBOX',
        model: ['NEW'],
        isActive: function() {
          return true;
        },
        reset: function() {}
      }
    ];
    const data = {
      content: [{
        dateTime: new Date()
      }],
      totalElements: 1
    };
    spyOn(ErrorReprocessingService.prototype, 'searchForUsers').and.returnValue(of(data));
    component.onFilter(filters);
    expect(component.firstRecord).toEqual(0);
  });

});
