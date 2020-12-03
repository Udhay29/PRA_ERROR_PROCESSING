import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ErrorReprocessingService } from './error-reprocessing.service';
import { environment } from 'src/environments/environment.prod';

describe('ErrorReprocessingService', () => {
  const URLS = environment.urls.errorReprocessing;
  let service: ErrorReprocessingService;
  let backend: HttpTestingController;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [ErrorReprocessingService]
  }));

  beforeEach(() => {
    service = TestBed.get(ErrorReprocessingService);
    backend = TestBed.get(HttpTestingController);
  });

  it('should call getErrorList', () => {
    const tableParam = {
      taskAssignmentIds: [1, 2],
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
    service.getErrorList(tableParam).subscribe();
    const call = backend.expectOne(URLS.search);
    expect(call.request.method).toBe('POST');
  });

  it('should call userTasks', () => {
    const queryDTO = {
      query: {
        bool: {
          should: [
            {
              multi_match: {
                fields: [
                  'userID'
                ],
                query: 1,
                type: 'phrase_prefix'
              }
            }
          ]
        }
      }
    };
    service.userTasks(queryDTO).subscribe();
    const call = backend.expectOne(URLS.getIds);
    expect(call.request.method).toBe('POST');
  });

  it('should call errorReprocess', () => {
    const reprocessParam = {
      action: '',
      actionPlace: 'GRID',
      errorMessageComment: '',
      jsonPayload: {},
      isEdited: '',
      errorProcessIds: []
    };
    service.errorReprocess(reprocessParam).subscribe();
    const call = backend.expectOne(URLS.reprocess);
    expect(call.request.method).toBe('POST');
  });

  it('should cal getDomainValues', () => {
    const searchQuery = {
      query: ''
    };
    const modelValues = ['Capacity'];
    service.getDomainValues(searchQuery, modelValues);
    service.filterDomain(searchQuery, modelValues).subscribe();
    const call = backend.expectOne(`${URLS.filteredSubDomain}/applicationdomaincodes?subDomainCodes=${modelValues}`);
    expect(call.request.method).toBe('GET');
  });

  it('should cal getDomainValues else', () => {
    const searchQuery = {
      query: ''
    };
    const modelValues = [];
    service.getDomainValues(searchQuery, modelValues);
    service.initialDomain(searchQuery).subscribe();
    const call = backend.expectOne(URLS.domainFilter);
    expect(call.request.method).toBe('GET');
  });

  it('should cal getSubDomainValues', () => {
    const searchQuery = {
      query: ''
    };
    const modelValues = ['Capacity'];
    service.getSubDomainValues(searchQuery, modelValues);
    service.filterSubdomain(searchQuery, modelValues).subscribe();
    const call = backend.expectOne(`${URLS.domainFilter}/search/applicationsubdomaincodes?domainCodes=${modelValues}`);
    expect(call.request.method).toBe('GET');
  });

  it('should cal getSubDomainValues else', () => {
    const searchQuery = {
      query: ''
    };
    const modelValues = [];
    service.getSubDomainValues(searchQuery, modelValues);
    service.initialSubdomain(searchQuery).subscribe();
    const call = backend.expectOne(URLS.domainFilter);
    expect(call.request.method).toBe('GET');
 });

  it('should call searchForUsers', () => {
    const taskID = [1];
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
    const tableParam = {
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
    service.searchForUsers(taskID, filters, tableParam).subscribe();
    const call = backend.expectOne(URLS.search);
    expect(call.request.method).toBe('POST');
  });

  it('should call searchForUsers else', () => {
    const taskID = [1];
    const filters: any = [
      {
        name: 'status',
        field: 'errorStatusCode',
        type: 'DATERANGE',
        inValidDate: false,
        fromDate: '10/28/2019',
        toDate: '10/29/2019',
        model: ['NEW'],
        isActive: function() {
          return true;
        },
        reset: function() {}
      }
    ];
    const tableParam = {
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
    service.searchForUsers(taskID, filters, tableParam).subscribe();
    const call = backend.expectOne(URLS.search);
    expect(call.request.method).toBe('POST');
  });

  it('should call searchForUsers else for DateRange', () => {
    const taskID = [1];
    const filters: any = [
      {
        name: 'status',
        field: 'errorStatusCode',
        type: 'DATERANGE',
        inValidDate: true,
        fromDate: '10/28/2019',
        toDate: '10/29/2019',
       model: ['NEW'],
        isActive: function() {
          return true;
        },
        reset: function() {}
      }
    ];
    const tableParam = {
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
    service.searchForUsers(taskID, filters, tableParam).subscribe();
    const call = backend.expectOne(URLS.search);
    expect(call.request.method).toBe('POST');
  });

  it('should call searchForUsers else for getFilterValues', () => {
    const taskID = [1];
    const filters: any = [
      {
       name: 'status',
        field: 'errorStatusCode',
        type: 'ABC',
        inValidDate: true,
        fromDate: '10/28/2019',
        toDate: '10/29/2019',
        model: ['NEW'],
        isActive: function() {
          return true;
        },
        reset: function() {}
      }
    ];
    const tableParam = {
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
    service.searchForUsers(taskID, filters, tableParam).subscribe();
    const call = backend.expectOne(URLS.search);
    expect(call.request.method).toBe('POST');
  });

  it('should call searchForUsers else for getFilterValues filter condition', () => {
    const taskID = [1];
    const filters: any = [];
    const tableParam = {
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
    service.searchForUsers(taskID, filters, tableParam).subscribe();
    const call = backend.expectOne(URLS.search);
    expect(call.request.method).toBe('POST');
  });

});
