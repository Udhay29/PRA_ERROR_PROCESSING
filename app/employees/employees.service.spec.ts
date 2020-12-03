import { TestBed } from '@angular/core/testing';

import { EmployeesService } from './employees.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Employee } from './employees.model';
import { environment } from 'src/environments/environment.prod';
import { ElasticFilter, SearchServiceMethod } from '../shared/filter-panel/filter/filter.model';

function getMockElasticResult() {
  return {
    'took': 18,
    'timed_out': false,
    '_shards': {
        'total': 3,
        'successful': 3,
        'skipped': 0,
        'failed': 0
    },
    'hits': {
        'total': 1,
        'max_score': null,
        'hits': [
            {
                '_index': 'infrastructure-employeeprofile-1-2019.03.29',
                '_type': '_doc',
                '_id': '354241',
                '_score': 13537.644,
                '_source': {
                    'personDTO': {
                        'jobTitle': 'Home Depot Class A Driver LOC Exempt LLC',
                        'prefName': 'Scott',
                        'email': ''
                    },
                    'lastName': 'Harrigan',
                    'firstName': 'Scott',
                    'emplid': '354241',
                    'userID': 'HARS61'
                },
                'sort': [
                    13537.644,
                    'Scott',
                    'Harrigan',
                    'Scott'
                ]
            }
        ]
    }
 };
}

function getMockEmployees(): Employee[] {
  const employee: Employee = new Employee();
  employee.lastName = 'Harrigan';
  employee.firstName = 'Scott';
  employee.emplid = 354241;
  employee.userName = 'HARS61';
  employee.title = 'Home Depot Class A Driver LOC Exempt LLC';
  employee.preferredName = 'Scott';
  employee.email = '';
  employee.manager = new Employee();
  employee.teams = [];
  employee.roles = [];
  employee.personEmployeeID = '354241';
  return [employee];
}

describe('@EmployeesService', () => {

  let testBackend: HttpTestingController;
  let employeesService: EmployeesService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [HttpClientTestingModule],
    providers: [EmployeesService]});
    employeesService = TestBed.get(EmployeesService);
    testBackend = TestBed.get(HttpTestingController);
    });

  describe('%TestBed', () => {
    it('should be mock Employee Service', () => {
      expect(employeesService).toBeTruthy();
    });

    it('should be mock HttpTestingController', () => {
      expect(testBackend).toBeTruthy();
    });
  });

  describe('#searchForUsers', () => {

    it('should search for users WHEN we have 1 term', () => {
      const mockEmployees: Employee[] = getMockEmployees();
      const term: string = 'harrigan';
      const expected = {
        hitCount: 1,
        employees: mockEmployees
      };
      const expectedRequestBody = {
        'query': {
          'bool': {
            'must': [
              {
                'query_string': {
                  'query': 'harrigan*',
                  'analyze_wildcard': true,
                  'fields': [
                    'firstName^5',
                    'lastName^20',
                    'personDTO.prefName^2000',
                    'emplid',
                    'userID',
                    'personDTO.jobTitle',
                    'roles.roleTypeName',
                    'teams.teamName',
                    'personDTO.email'
                  ]
                }
              }
            ],
            'filter': []
          }
        },
        'from': 0,
        'size': 1,
        '_source': [
          'firstName',
          'lastName',
          'personDTO.prefName',
          'emplid',
          'userID',
          'personDTO.jobTitle',
          'roles.roleTypeName',
          'teams.teamName',
          'personDTO.email',
          'teams.expirationTimestamp',
          'teams.teamID'
        ],
        'sort': [
          {
            '_score': {
              'order': 'desc'
            }
          },
          {
            'personDTO.prefName.keyword': {
              'order': 'asc'
            }
          },
          {
            'lastName.keyword': {
              'order': 'asc'
            }
          },
          {
            'firstName.keyword': {
              'order': 'asc'
            }
          }
        ]
      };
      employeesService.searchForUsers(term, 0, 1, []
        ).subscribe(result =>
        expect(result).toEqual(expected));
      const req = testBackend.expectOne(
        environment.urls.employeeService.search);
      req.flush(getMockElasticResult());
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(expectedRequestBody);
    });

    it('should search for users WHEN we have more terms', () => {
      const mockEmployees: Employee[] = getMockEmployees();
      const term: string = 'scott harrigan';
      const expected = {
        hitCount: 1,
        employees: mockEmployees
      };
      const expectedRequestBody = {
        'query': {
          'bool': {
            'must': [
              {
                'multi_match': {
                  'query': 'scott',
                  'type': 'cross_fields',
                  'fields': [
                    'firstName^5',
                    'lastName^20',
                    'personDTO.prefName^2000',
                    'emplid',
                    'userID',
                    'personDTO.jobTitle',
                    'roles.roleTypeName',
                    'teams.teamName',
                    'personDTO.email'
                  ],
                  'operator': 'and'
                }
              },
              {
                'query_string': {
                  'query': 'harrigan*',
                  'analyze_wildcard': true,
                  'fields': [
                    'firstName^5',
                    'lastName^2000',
                    'personDTO.prefName^20',
                    'emplid',
                    'userID',
                    'personDTO.jobTitle',
                    'roles.roleTypeName',
                    'teams.teamName',
                    'personDTO.email'
                  ]
                }
              }
            ],
            'filter': []
          }
        },
        'from': 0,
        'size': 1,
        '_source': [
          'firstName',
          'lastName',
          'personDTO.prefName',
          'emplid',
          'userID',
          'personDTO.jobTitle',
          'roles.roleTypeName',
          'teams.teamName',
          'personDTO.email',
          'teams.expirationTimestamp',
          'teams.teamID'
        ],
        'sort': [
          {
            '_score': {
              'order': 'desc'
            }
          },
          {
            'personDTO.prefName.keyword': {
              'order': 'asc'
            }
          },
          {
            'lastName.keyword': {
              'order': 'asc'
            }
          },
          {
            'firstName.keyword': {
              'order': 'asc'
            }
          }
        ]
      };
      employeesService.searchForUsers(term, 0, 1, []).subscribe(result =>
        expect(result).toEqual(expected));
      const req = testBackend.expectOne(
        environment.urls.employeeService.search);
      req.flush(getMockElasticResult());
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(expectedRequestBody);
    });

    it('should search for users WHEN we have filter', () => {
      const term: string = 'harrigan';
      const filter: ElasticFilter = {model: ['model'], field: 'field'} as ElasticFilter;
      const filters: ElasticFilter[] = [filter];
      const spy: jasmine.Spy = spyOn(employeesService, 'searchForUsers');
      employeesService.searchForUsers(term, 0, 1, filters);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('#buildTokenizedQuery', () => {
    it('should build tokenized query WHEN we have 1 term', () => {
      const term: string = 'Hash';
      const fields: string[] = ['field'];
      const expectedQuery = {
        'bool': {
          'must': [
            {
              'query_string': {
                'query': 'Hash*',
                'analyze_wildcard': true,
                'fields': [
                  'field'
                ]
              }
            }
          ]
        }
      };
      const tokenizedQuery = employeesService.buildTokenizedQuery(term, fields);
      expect(tokenizedQuery).toEqual(expectedQuery);
    });

    it('should build tokenized query WHEN we have more terms with secondFields', () => {
      const term: string = 'Hash Sha';
      const fields: string[] = ['field'];
      const lastTermFileds: string[] = ['otherField'];
      const expectedQuery = {
        'bool': {
          'must': [
            {
              'multi_match': {
                'query': 'Hash',
                'type': 'cross_fields',
                'fields': [
                  'field'
                ],
                'operator': 'and'
              }
            },
            {
              'query_string': {
                'query': 'Sha*',
                'analyze_wildcard': true,
                'fields': [
                  'otherField'
                ]
              }
            }
          ]
        }
      };
      const tokenizedQuery = employeesService.buildTokenizedQuery(term, fields, lastTermFileds);
      expect(tokenizedQuery).toEqual(expectedQuery);
    });

    it('should build tokenized query WHEN we have more terms but no secondFields', () => {
      const term: string = 'Hash Sha';
      const fields: string[] = ['field'];
      const expectedQuery = {
        'bool': {
          'must': [
            {
              'multi_match': {
                'query': 'Hash',
                'type': 'cross_fields',
                'fields': [
                  'field'
                ],
                'operator': 'and'
              }
            },
            {
              'query_string': {
                'query': 'Sha*',
                'analyze_wildcard': true,
                'fields': [
                  'field'
                ]
              }
            }
          ]
        }
      };
      const tokenizedQuery = employeesService.buildTokenizedQuery(term, fields);
      expect(tokenizedQuery).toEqual(expectedQuery);
    });
  });

});
