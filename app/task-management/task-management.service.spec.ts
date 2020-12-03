import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Employee } from '../employees/employees.model';
import {
  EmployeeSearchResult,
  EmployeesService
} from '../employees/employees.service';
import {
  CheckboxFilter,
  ElasticFilter,
  Filter,
  FilterOptions
} from '../shared/filter-panel/filter/filter.model';
import { HTTPMethod } from './task-management-addEdit-task/work-assignment-types';
import { DatagridSearchReponse, TaskDetail } from './task-management.model';
import { TaskManagementService } from './task-management.service';

function getMockTaskSource() {
  return {
    taskAssignmentID: 619,
    orderOwnershipID: null,
    taskAssignmentName: 'DCS Load Planner Wal Mart',
    createUserID: 'JCON903',
    lastUpdateUserID: 'JCON903',
    taskGroupID: 72,
    taskGroupName: 'DCS Account Management',
    teamMemberTaskAssignmentRoleAssociationDTOs: [
      {
        teamMemberTaskAssignmentRoleAssociationID: 1961,
        alternateRoleIndicator: 'N',
        taskAssignmentID: 619,
        teamID: 333,
        teamName: 'DCS Load Planners',
        teamMemberTeamAssignmentID: 3659,
        teamMemberID: '312735',
        teamMemberName: 'Amber Moore, Business Analyst III',
        taskGroupRoleTypeAssociationID: 177,
        roleTypeCode: 'LoadPlng',
        roleTypeName: 'Load Planner',
        teamTeamMemberId: 'Team-333-3659',
        effectiveTimestamp: '2018-09-06T13:47:34.926',
        expirationTimestamp: '2099-12-31T23:59:59'
      }
    ],
    taskAssignmentResponsibilityGroupDTOs: [
      {
        taskAssignmentResponsibilityGroupID: 1004,
        effectiveTimestamp: '2018-09-06T13:47:34.926',
        expirationTimestamp: '2099-12-31T23:59:59',
        taskAssignmentResponsibilityDetailDTOs: []
      },
      {
        taskAssignmentResponsibilityGroupID: 1005,
        effectiveTimestamp: '2018-09-06T13:48:44.727',
        expirationTimestamp: '2099-12-31T23:59:59',
        taskAssignmentResponsibilityDetailDTOs: [
          {
            taskAssignmentResponsibilityDetailID: 1560,
            taskAssignmentResponsibilityDetailValue: 'DCS',
            taskAssignmentResponsibilityDetailValueDesc: 'DCS',
            taskGroupTaskResponsibilityTypeAssociationID: 319,
            taskResponsibilityTypeCode: 'BusUnit',
            taskResponsibilityTypeDescription: 'Business Unit',
            effectiveTimestamp: '2018-09-06T13:47:34.926',
            expirationTimestamp: '2099-12-31T23:59:59'
          },
          {
            taskAssignmentResponsibilityDetailID: 1561,
            taskAssignmentResponsibilityDetailValue: '8743',
            taskAssignmentResponsibilityDetailValueDesc:
              'WAL-Mart Associates, INC (WABEMA), 702 Sw 8Th St, Bentonville, AR, USA, 727166209',
            taskGroupTaskResponsibilityTypeAssociationID: 325,
            taskResponsibilityTypeCode: 'CorprtAcct',
            taskResponsibilityTypeDescription: 'Corporate Account',
            effectiveTimestamp: '2018-09-06T13:48:44.727',
            expirationTimestamp: '2099-12-31T23:59:59'
          },
          {
            taskAssignmentResponsibilityDetailID: 1562,
            taskAssignmentResponsibilityDetailValue: '8747',
            taskAssignmentResponsibilityDetailValueDesc:
              'WAL-Mart Stores, INC-LTL (WASPBQ), 2155 Usa Pkwy, Sparks, NV, USA, 894345603',
            taskGroupTaskResponsibilityTypeAssociationID: 325,
            taskResponsibilityTypeCode: 'CorprtAcct',
            taskResponsibilityTypeDescription: 'Corporate Account',
            effectiveTimestamp: '2018-09-06T13:48:44.727',
            expirationTimestamp: '2099-12-31T23:59:59'
          }
        ]
      }
    ],
    taskGroupDTO: {
      taskGroupID: 72,
      taskGroupName: 'DCS Account Management',
      effectiveTimestamp: '2018-04-06T02:18:11.415',
      expirationTimestamp: '2099-12-31T23:59:59',
      taskGroupRoleTypeAssociationDTOs: [
        {
          taskGroupRoleTypeAssociationID: 631,
          roleType: {
            createTimestamp: '2018-05-04T14:14:16.9219158',
            createProgramName: 'SSIS',
            lastUpdateTimestamp: '2018-05-04T14:14:16.9219158',
            lastUpdateProgramName: 'SSIS',
            createUserId: 'PIDNEXT',
            lastUpdateUserId: 'PIDNEXT',
            roleTypeCode: 'AppSupport',
            roleTypeName: 'Application Support',
            effectiveTimestamp: '2018-01-01T00:00:00',
            expirationTimestamp: '2199-12-31T23:59:59',
            lastUpdateTimestampString: '2018-05-04T14:14:16.9219158'
          },
          effectiveTimestamp: '2019-04-25T13:55:54.01',
          expirationTimestamp: '2099-12-31T23:59:59',
          backupTaskAssignmentDTOList: null
        }
      ],
      taskGroupTaskResponsibilityTypeAssociationDTOs: [
        {
          taskGroupTaskResponsibilityTypeAssociationID: 318,
          taskResponsibilityType: {
            createTimestamp: '2017-08-17T12:25:22.551077',
            createProgramName: 'SSIS',
            lastUpdateTimestamp: '2017-08-17T12:25:22.551077',
            lastUpdateProgramName: 'SSIS',
            createUserId: 'PIDNEXT',
            lastUpdateUserId: 'PIDNEXT',
            taskResponsibilityTypeCode: 'BillParty',
            taskResponsibilityTypeDescription: 'Billing Party',
            effectiveTimestamp: '2017-01-01T00:00:00',
            expirationTimestamp: '2199-12-31T23:59:59',
            lastUpdateTimestampString: '2017-08-17T12:25:22.551077'
          },
          effectiveTimestamp: '2018-04-06T02:18:11.415',
          expirationTimestamp: '2099-12-31T23:59:59'
        }
      ],
      taskGroupValidationDTO: null,
      roleTypeName: null,
      taskResponsibilityTypeDescription: null,
      eventType: null
    },
    effectiveTimestamp: '2018-09-06T13:47:34.926',
    expirationTimestamp: '2099-12-31T23:59:59',
    createTimestamp: '2018-09-06T13:47:34.939',
    lastUpdateTimestamp: '2018-09-06T13:48:44.77',
    roleTypes: null,
    employeeProfileDTOs: null,
    eventType: null,
    teamMemberIDs: ['312735'],
    taskAssignmentValidationDTO: null,
    oldOrderOwner: null,
    newOrderOwner: null,
    responsibilities: null,
    responsibilitiesDetails: null,
    teamNames: null,
    taskGroupNameAndtaskAssignmentID: null
  };
}

function getMockElasticResult() {
  return {
    took: 5,
    timed_out: false,
    _shards: {
      total: 3,
      successful: 3,
      skipped: 0,
      failed: 0
    },
    hits: {
      total: 1,
      max_score: 1,
      hits: [
        {
          _index: 'infrastructure-taskassignment-1-2019.05.02',
          _type: '_doc',
          _id: '42',
          _score: 1,
          _source: {
            taskGroupName: 'JBT Load Planning',
            teamMemberTaskAssignmentRoleAssociationDTOs: [
              {
                teamName: 'JBT Northeast Load Planning'
              },
              {
                teamName: 'JBT Northeast Load Planning'
              }
            ],
            expirationTimestamp: '2099-12-31T23:59:59',
            taskAssignmentID: 42,
            taskAssignmentResponsibilityGroupDTOs: [
              {
                taskAssignmentResponsibilityDetailDTOs: [
                  {
                    taskResponsibilityTypeDescription: 'Origin Capacity Area',
                    taskAssignmentResponsibilityDetailValueDesc:
                      'Kentucky, Louisville Usa (Lk)'
                  },
                  {
                    taskResponsibilityTypeDescription: 'Origin Capacity Area',
                    taskAssignmentResponsibilityDetailValueDesc:
                      'Ohio, Cincinnati Usa (Ci)'
                  },
                  {
                    taskResponsibilityTypeDescription: 'Origin Capacity Area',
                    taskAssignmentResponsibilityDetailValueDesc:
                      'Kentucky [East], Usa (Ky)'
                  },
                  {
                    taskResponsibilityTypeDescription: 'Origin Capacity Area',
                    taskAssignmentResponsibilityDetailValueDesc:
                      'Pennsylvania, Pittsburg (Pi)'
                  },
                  {
                    taskResponsibilityTypeDescription: 'Origin Capacity Area',
                    taskAssignmentResponsibilityDetailValueDesc:
                      'Ohio, Cleveland Usa (Cl)'
                  },
                  {
                    taskResponsibilityTypeDescription: 'Origin Capacity Area',
                    taskAssignmentResponsibilityDetailValueDesc:
                      'West Virginia, Usa (Wv)'
                  },
                  {
                    taskResponsibilityTypeDescription: 'Origin Capacity Area',
                    taskAssignmentResponsibilityDetailValueDesc:
                      'Ohio [Southeast], Usa (Oh)'
                  },
                  {
                    taskResponsibilityTypeDescription: 'Business Unit',
                    taskAssignmentResponsibilityDetailValueDesc: 'JBT'
                  }
                ]
              }
            ],
            taskAssignmentName: 'JBT NE Load Planning task 1'
          }
        }
      ]
    }
  };
}

describe('TaskManagementService', () => {
  let service: TaskManagementService;
  let testBackend: HttpTestingController;
  let employeesService: EmployeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskManagementService, EmployeesService]
    });
    service = TestBed.get(TaskManagementService);
    testBackend = TestBed.get(HttpTestingController);
    employeesService = TestBed.get(EmployeesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save an updated task assignment', () => {
    const mockTaskDetail = new TaskDetail();
    mockTaskDetail.taskCategory = {
      taskCategoryName: 'test',
      taskCategoryId: 1
    };
    service.saveTaskAssignment(mockTaskDetail, true).subscribe(result => {
      expect(result).toEqual('test');
    });
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.updateTask
    );
    req.flush('test');
  });

  it('should save a new task assignment', () => {
    const mockTaskDetail = new TaskDetail();
    mockTaskDetail.taskCategory = {
      taskCategoryName: 'test',
      taskCategoryId: 1
    };
    service.saveTaskAssignment(mockTaskDetail, false).subscribe(result => {
      expect(result).toEqual('test');
    });
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.createTaskAssignment
    );
    req.flush('test');
  });

  it('should get task details', () => {
    const expectedResult: TaskDetail = new TaskDetail(getMockTaskSource());
    service
      .getTaskDetails(1)
      .subscribe(result => expect(result).toEqual(expectedResult));
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.getTaskDetails + 1
    );
    expect(req.request.method).toBe('GET');
    req.flush(getMockTaskSource());
  });

  it('should inactivate a task', () => {
    service.selectedTask = new TaskDetail();
    service
      .inactivateTask(1)
      .subscribe(result => expect(result).toEqual('test'));
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.inactivateTask + 1
    );
    req.flush('test');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    expect(service.selectedTask).toBeNull();
  });

  it('should activate a task', () => {
    service.selectedTask = new TaskDetail();
    service.activateTask(1).subscribe(result => expect(result).toEqual('test'));
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.activateTask + 1
    );
    req.flush('test');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBeNull();
    expect(service.selectedTask).toBeNull();
  });

  it('should search for tasks', () => {
    const mockDataGridResponse: DatagridSearchReponse = new DatagridSearchReponse(
      getMockElasticResult().hits.hits[0]._source
    );
    const expected = {
      hitCount: 1,
      tasks: [mockDataGridResponse]
    };
    const expectedRequestBody = {
      query: { bool: { filter: [], must: [{ match_all: {} }] } },
      from: 0,
      size: 25,
      _source: [
        'taskAssignmentName',
        'expirationTimestamp',
        'taskGroupName',
        'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskAssignmentResponsibilityDetailValueDesc',
        'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskResponsibilityTypeDescription',
        'teamMemberTaskAssignmentRoleAssociationDTOs.teamName',
        'taskAssignmentID'
      ]
    };
    service
      .searchForTasks('')
      .subscribe(result => expect(result).toEqual(expected));
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    req.flush(getMockElasticResult());
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedRequestBody);
  });

  it('should build a query and search for tasks with a filter', () => {
    const mockFilter: Filter = new ElasticFilter('test', 'testField', () =>
      of(['testSearch'])
    );
    const expectedFilterQuery = [
      {
        query_string: {
          query: '(test query)',
          fields: ['testField'],
          default_operator: 'AND'
        }
      }
    ];
    mockFilter.model = ['test query'];
    service.searchForTasks('', 25, 100, [mockFilter]).subscribe(() => {});
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    req.flush(getMockElasticResult());
    expect(req.request.method).toBe('POST');
    expect(req.request.body.query.bool.filter).toEqual(expectedFilterQuery);
    expect(req.request.body.from).toEqual(25);
    expect(req.request.body.size).toEqual(100);
  });

  it('should build a query and search for task with active status filter and aditional filter', () => {
    const mockElasticFilter: Filter = new ElasticFilter(
      'test',
      'test field',
      () => of(['string'])
    );
    mockElasticFilter.model = ['test', 'strings-dash'];
    const filterOptions: Array<FilterOptions> = [
      { label: 'Active', value: 'active', indexOf: 0 },
      { label: 'Inactive', value: 'inactive', indexOf: 1 }
    ];
    const statusFilter: Filter = new CheckboxFilter(
      'status',
      'expired',
      'Active',
      null,
      filterOptions,
      ['active']
    );
    const expectedFilter = [
      {
        query_string: {
          query: '(test) OR (strings\\-dash)',
          fields: ['test field'],
          default_operator: 'AND'
        }
      },
      { range: { expired: { gt: 'now' } } }
    ];
    service
      .searchForTasks('test search', 0, 25, [mockElasticFilter, statusFilter])
      .subscribe(() => {});
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body.query.bool.filter).toEqual(expectedFilter);
  });

  it('should build a query and search for task that are inactive', () => {
    const mockElasticFilter: Filter = new ElasticFilter(
      'test',
      'test field',
      () => of(['string'])
    );
    mockElasticFilter.model = ['test', 'strings-dash'];
    const filterOptions: Array<FilterOptions> = [
      { label: 'Active', value: 'active', indexOf: 0 },
      { label: 'Inactive', value: 'inactive', indexOf: 1 }
    ];
    const statusFilter: Filter = new CheckboxFilter(
      'status',
      'expired',
      'Active',
      null,
      filterOptions,
      ['inactive']
    );
    const expectedFilter = [
      {
        query_string: {
          query: '(test) OR (strings\\-dash)',
          fields: ['test field'],
          default_operator: 'AND'
        }
      },
      { range: { expired: { lte: 'now' } } }
    ];
    service
      .searchForTasks('test search', 0, 25, [mockElasticFilter, statusFilter])
      .subscribe(() => {});
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body.query.bool.filter).toEqual(expectedFilter);
  });

  it('should build a query and search for task with inactive status filter and aditional filter', () => {
    const mockElasticFilter: Filter = new ElasticFilter(
      'test',
      'test field',
      () => of(['string'])
    );
    mockElasticFilter.model = ['test', 'strings-dash'];
    const filterOptions: Array<FilterOptions> = [
      { label: 'Active', value: 'active', indexOf: 0 },
      { label: 'Inactive', value: 'inactive', indexOf: 1 }
    ];
    const statusFilter: Filter = new CheckboxFilter(
      'status',
      'expired',
      'Inactive',
      null,
      filterOptions,
      ['inactive']
    );
    statusFilter.model = ['active', 'inactive'];
    const expectedFilter = [
      {
        query_string: {
          query: '(test) OR (strings\\-dash)',
          fields: ['test field'],
          default_operator: 'AND'
        }
      },
      { range: { expired: {} } }
    ];
    service
      .searchForTasks('test search', 0, 25, [mockElasticFilter, statusFilter])
      .subscribe(() => {});
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body.query.bool.filter).toEqual(expectedFilter);
  });

  it('should build a query and search for task with an invaild status filter', () => {
    const mockElasticFilter: Filter = new ElasticFilter(
      'test',
      'test field',
      () => of(['string'])
    );
    mockElasticFilter.model = ['test', 'strings-dash'];
    const filterOptions: Array<FilterOptions> = [
      { label: 'Active', value: 'active', indexOf: 0 },
      { label: 'Inactive', value: 'inactive', indexOf: 1 }
    ];
    const statusFilter: Filter = new CheckboxFilter(
      'status',
      'expired',
      'Inactive',
      null,
      filterOptions,
      ['not expected']
    );
    const expectedFilter = [
      {
        query_string: {
          query: '(test) OR (strings\\-dash)',
          fields: ['test field'],
          default_operator: 'AND'
        }
      },
      { range: { expired: {} } }
    ];
    service
      .searchForTasks('test search', 0, 25, [mockElasticFilter, statusFilter])
      .subscribe(() => {});
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body.query.bool.filter).toEqual(expectedFilter);
  });

  it('should build a query and search for task with elastic filter queryStrings', () => {
    const mockElasticFilter: Filter = new ElasticFilter(
      'test',
      'test field',
      () => of(['string'])
    );
    mockElasticFilter.queryStrings = ['test', 'strings-dash'];
    const expectedFilter = [
      {
        query_string: {
          query: '(test) OR (strings\\-dash)',
          fields: ['test field'],
          default_operator: 'AND'
        }
      }
    ];
    service
      .searchForTasks('test search', 0, 25, [mockElasticFilter])
      .subscribe(() => {});
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body.query.bool.filter).toEqual(expectedFilter);
  });

  it('should search for assignment title', () => {
    const expectedBody = {
      query: { bool: { filter: [], must: [{ match_all: {} }] } },
      _source: ['taskAssignmentName']
    };
    const mockResult = {
      hits: {
        hits: [
          {
            _source: {
              taskAssignmentName: 'Mock Task Assignment'
            }
          }
        ]
      }
    };
    service
      .searchForAssignmentTitle('')
      .subscribe(result => expect(result).toEqual(['Mock Task Assignment']));
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedBody);
    req.flush(mockResult);
  });

  it('should search for task category', () => {
    const expectedBody = {
      query: { bool: { filter: [], must: [{ match_all: {} }] } },
      _source: ['taskGroupName']
    };
    const mockResult = {
      hits: {
        hits: [
          {
            _source: {
              taskGroupName: 'Mock Group Name'
            }
          }
        ]
      }
    };
    service
      .searchForTaskCategory('')
      .subscribe(result => expect(result).toEqual(['Mock Group Name']));
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedBody);
    req.flush(mockResult);
  });

  it('should search for work type', () => {
    const expectedBody = {
      query: { bool: { filter: [], must: [{ match_all: {} }] } },
      _source: [
        'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskResponsibilityTypeDescription'
      ]
    };
    const mockResult = {
      hits: {
        hits: [
          {
            _source: {
              taskAssignmentResponsibilityGroupDTOs: [
                {
                  taskAssignmentResponsibilityDetailDTOs: [
                    {
                      taskResponsibilityTypeDescription:
                        'mock task responsibility type description'
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    };
    service
      .searchforWorkType('')
      .subscribe(result =>
        expect(result).toEqual(['mock task responsibility type description'])
      );
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedBody);
    req.flush(mockResult);
  });

  it('should search for work value', () => {
    const expectedBody = {
      query: { bool: { filter: [], must: [{ match_all: {} }] } },
      _source: [
        'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskAssignmentResponsibilityDetailValueDesc'
      ]
    };
    const mockResult = {
      hits: {
        hits: [
          {
            _source: {
              taskAssignmentResponsibilityGroupDTOs: [
                {
                  taskAssignmentResponsibilityDetailDTOs: [
                    {
                      taskAssignmentResponsibilityDetailValueDesc:
                        'mock task responsibility value description'
                    },
                    {
                      taskAssignmentResponsibilityDetailValueDesc: null
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    };
    service
      .searchforWorkValue('')
      .subscribe(result =>
        expect(result).toEqual(['mock task responsibility value description'])
      );
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    req.flush(mockResult);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedBody);
  });

  it('should search for responsible team', () => {
    const expectedBody = {
      query: { bool: { filter: [], must: [{ match_all: {} }] } },
      _source: ['teamMemberTaskAssignmentRoleAssociationDTOs.teamName']
    };
    const mockResult = {
      hits: {
        hits: [
          {
            _source: {
              teamMemberTaskAssignmentRoleAssociationDTOs: [
                {
                  teamName: 'mock team'
                }
              ]
            }
          },
          {
            _source: {}
          }
        ]
      }
    };
    service
      .searchforResponsibleTeam('')
      .subscribe(result => expect(result).toEqual(['mock team']));
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    req.flush(mockResult);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedBody);
  });

  it('should search for work assignment type values with get method', () => {
    const mockTypeService = {
      destination: '/mockUrl?string=',
      query_string: (input: string) => input,
      response_map: (response: any) => response,
      method: HTTPMethod.GET
    };
    service
      .searchForWorkAssignmentTypeValues(mockTypeService, 'mock search')
      .subscribe(result => expect(result).toEqual('test response'));
    const req = testBackend.expectOne('/mockUrl?string=mock search');
    req.flush('test response');
    expect(req.request.method).toBe('GET');
  });

  it('should search for work assignment type values with post method', () => {
    const mockTypeService = {
      destination: '/mockUrl',
      request_body: (input: string) => input,
      response_map: (response: any) => response,
      method: HTTPMethod.POST
    };
    service
      .searchForWorkAssignmentTypeValues(mockTypeService, 'mock search')
      .subscribe(result => expect(result).toEqual('test response'));
    const req = testBackend.expectOne('/mockUrl');
    req.flush('test response');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe('mock search');
  });

  it('should search assigned to on filter', () => {
    const mockAutoComplete = {
      inputEL: {
        nativeElement: {
          value: 'Steve Jobs (APPL)'
        }
      },
      value: 'Steve Jobs (APPL)'
    };
    const eventEmitter = new EventEmitter<Filter>();
    const mockEmployee = new Employee();
    mockEmployee.teams = [
      {
        name: 'The One',
        expirationTimestamp: '2099-12-31T23:59:59.5959',
        id: 123,
        leaderId: null,
        members: null
      },
      {
        name: 'Another One',
        expirationTimestamp: '2019-05-15T17:09:47.471',
        id: 678,
        leaderId: null,
        members: null
      }
    ];
    mockEmployee.firstName = 'Steve';
    mockEmployee.lastName = 'Jobs';
    mockEmployee.userName = 'APPL';
    service.assignToFilter.employeeSuggestions.push(mockEmployee);
    eventEmitter.subscribe(event => {
      expect(event.model).toEqual(['Steve Jobs (APPL)']);
      expect(event.queryStrings).toEqual(['Steve Jobs', 'Team-123']);
      expect(event.selectedSearches).toEqual(['Steve Jobs (APPL)']);
    });
    service.assignToFilter.searchSelected(
      'Steve Jobs (APPL)',
      eventEmitter,
      mockAutoComplete
    );
  });

  it('should return an observable string array of roles', () => {
    const expectedBody = {
      query: {
        bool: {
          filter: [],
          must: [
            {
              query_string: {
                query: '*order*',
                analyzer: 'whitespace_lowercase',
                analyze_wildcard: true,
                fields: [
                  'taskAssignmentName',
                  'taskGroupName',
                  'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs' +
                    '.taskAssignmentResponsibilityDetailValueDesc',
                  'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskResponsibilityTypeDescription',
                  'teamMemberTaskAssignmentRoleAssociationDTOs.teamName'
                ]
              }
            },
            {
              query_string: {
                query: '*owner*',
                analyzer: 'whitespace_lowercase',
                analyze_wildcard: true,
                fields: [
                  'taskAssignmentName',
                  'taskGroupName',
                  'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs' +
                    '.taskAssignmentResponsibilityDetailValueDesc',
                  'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskResponsibilityTypeDescription',
                  'teamMemberTaskAssignmentRoleAssociationDTOs.teamName'
                ]
              }
            }
          ]
        }
      },
      _source: ['teamMemberTaskAssignmentRoleAssociationDTOs.roleTypeName']
    };
    const mockResult = {
      hits: {
        hits: [
          {
            _source: {
              teamMemberTaskAssignmentRoleAssociationDTOs: [
                {
                  roleTypeName: 'a role'
                },
                {
                  roleTypeName: 'b Role'
                },
                {
                  roleTypeName: 'Order Owner'
                }
              ]
            }
          }
        ]
      }
    };
    service
      .searchForRoles('order owner')
      .subscribe(result => expect(result).toEqual(['Order Owner']));
    const req = testBackend.expectOne(
      environment.urls.taskManagementService.search
    );
    req.flush(mockResult);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedBody);
  });

  it('should do nothing on selecting same assigned to on filter', () => {
    const mockAutoComplete = {
      inputEL: {
        nativeElement: {
          value: 'Steve Jobs (APPL)'
        }
      },
      value: 'Steve Jobs (APPL)'
    };
    const eventEmitter = new EventEmitter<Filter>();
    const mockEmployee = new Employee();
    mockEmployee.teams = [
      {
        name: 'The One',
        expirationTimestamp: '2099-12-31T23:59:59.5959',
        id: 123,
        leaderId: null,
        members: null
      },
      {
        name: 'Another One',
        expirationTimestamp: '2019-05-15T17:09:47.471',
        id: 678,
        leaderId: null,
        members: null
      }
    ];
    mockEmployee.firstName = 'Steve';
    mockEmployee.lastName = 'Jobs';
    mockEmployee.userName = 'APPL';
    service.assignToFilter.employeeSuggestions.push(mockEmployee);
    service.assignToFilter.searchTermTeamAssociations.set('Steve Jobs (APPL)', [
      'Team-123'
    ]);
    service.assignToFilter.model.push('Steve Jobs (APPL)');
    service.assignToFilter.queryStrings = ['Steve Jobs', 'Team-123'];
    service.assignToFilter.selectedSearches.push('Steve Jobs (APPL)');
    eventEmitter.subscribe(() => {
      fail('Event was called and should not be.');
    });
    service.assignToFilter.searchSelected(
      'Steve Jobs (APPL)',
      eventEmitter,
      mockAutoComplete
    );

    service
      .searchForAssignedTo('blah')
      .subscribe(result =>
        expect(result).toEqual(['prefName lastName (userID)'])
      );
  });

  it('should search assigned to on filter', () => {
    const mockAutoComplete = {
      inputEL: {
        nativeElement: {
          value: 'Steve Jobs (APPL)'
        }
      },
      value: 'Steve Jobs (APPL)'
    };
    const eventEmitter = new EventEmitter<Filter>();
    const mockEmployee = new Employee();
    mockEmployee.teams = [
      {
        name: 'The One',
        expirationTimestamp: '2099-12-31T23:59:59.5959',
        id: 123,
        leaderId: null,
        members: null
      },
      {
        name: 'Another One',
        expirationTimestamp: '2019-05-15T17:09:47.471',
        id: 678,
        leaderId: null,
        members: null
      }
    ];
    mockEmployee.firstName = 'Steve';
    mockEmployee.lastName = 'Jobs';
    mockEmployee.userName = 'APPL';
    service.assignToFilter.employeeSuggestions.push(mockEmployee);
    eventEmitter.subscribe(event => {
      expect(event.model).toEqual(['Steve Jobs (APPL)']);
      expect(event.queryStrings).toEqual(['Steve Jobs', 'Team-123']);
      expect(event.selectedSearches).toEqual(['Steve Jobs (APPL)']);
    });
    service.assignToFilter.searchSelected(
      'Steve Jobs (APPL)',
      eventEmitter,
      mockAutoComplete
    );
  });

  it('should do nothing on selecting same assigned to on filter', () => {
    const mockAutoComplete = {
      inputEL: {
        nativeElement: {
          value: 'Steve Jobs (APPL)'
        }
      },
      value: 'Steve Jobs (APPL)'
    };
    const eventEmitter = new EventEmitter<Filter>();
    const mockEmployee = new Employee();
    mockEmployee.teams = [
      {
        name: 'The One',
        expirationTimestamp: '2099-12-31T23:59:59.5959',
        id: 123,
        leaderId: null,
        members: null
      },
      {
        name: 'Another One',
        expirationTimestamp: '2019-05-15T17:09:47.471',
        id: 678,
        leaderId: null,
        members: null
      }
    ];
    mockEmployee.firstName = 'Steve';
    mockEmployee.lastName = 'Jobs';
    mockEmployee.userName = 'APPL';
    service.assignToFilter.employeeSuggestions.push(mockEmployee);
    service.assignToFilter.searchTermTeamAssociations.set('Steve Jobs (APPL)', [
      'Team-123'
    ]);
    service.assignToFilter.model.push('Steve Jobs (APPL)');
    service.assignToFilter.queryStrings = ['Steve Jobs', 'Team-123'];
    service.assignToFilter.selectedSearches.push('Steve Jobs (APPL)');
    eventEmitter.subscribe(() => {
      fail('Event was called and should not be.');
    });
    service.assignToFilter.searchSelected(
      'Steve Jobs (APPL)',
      eventEmitter,
      mockAutoComplete
    );
    // Make sure that nothing changed
    expect(service.assignToFilter.model).toEqual(['Steve Jobs (APPL)']);
    expect(service.assignToFilter.queryStrings).toEqual([
      'Steve Jobs',
      'Team-123'
    ]);
    expect(service.assignToFilter.selectedSearches).toEqual([
      'Steve Jobs (APPL)'
    ]);
  });
});
