import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { DriverManagementService } from './driver-management.service';

describe('driver management service', () => {
  let service: DriverManagementService;
  let httpMock: HttpTestingController;
  let httpClientSpy: { post: jasmine.Spy };
  const filter: any = {
    name: 'isDriver',
    field: 'personDTO.isDriver',
    type: 'ELASTIC',
    model: ['Y'],
    selectedSearches: ['Y']
  };
  const elasticRes = {
    hits: {
      total: 12,
      hits: [
        {
          _source: {
            emplid: '247261',
            firstName: 'Thomass',
            lastName: 'Blickk',
            personDTO: {
              isEmployee: true,
              status: 'A',
              emplid: 247260,
              firstName: 'Thomas',
              lastName: 'Blick',
              title: 'Intermodal Class A Driver Local',
              email: 'thomasvblick@gmail.com',
              personEmployeeID: '247260',
              phone: '',
              preferredName: 'Thomas',
              userName: 'BLIT7',
              manager: {
                isEmployee: true,
                emplid: 324619,
                firstName: 'Shannon',
                lastName: 'Mcdonald',
                title: 'Fleet Manager',
                email: 'shannon.mcdonald@jbhunt.com',
                personEmployeeID: '324619',
                phone: '8007231169',
                preferredName: 'Shannon',
                userName: 'JITM1781'
              }
            },
            roles: [],
            taskAssignments: [],
            teams: [],
            userID: '123',
            positions: [
              {
                businessUnit: 'DCS'
              }
            ]
          }
        }
      ]
    }
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, HttpClientModule],
      providers: [DriverManagementService]
    });
    service = TestBed.get(DriverManagementService);
    httpMock = TestBed.get(HttpTestingController);
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call searchForColumn', () => {
    service.searchForColumn('JB', 'firstName')
        .subscribe(res => {
          expect(res).toEqual( ['Thomass']
          );
        });
    const req = httpMock.expectOne(service.URLS.search);
    expect(req.request.url).toBe(
        'elastic/infrastructure-employeeprofile/_doc/_search'
    );
    expect(req.request.method).toEqual('POST');
    req.flush(elasticRes);
    httpMock.verify();
  });

  it('should call searchForLColumn', () => {
    service.searchForLColumn('JB', 'lastName')
        .subscribe(res => {
          expect(res).toEqual( ['Blickk']
          );
        });
    const req = httpMock.expectOne(service.URLS.search);
    expect(req.request.url).toBe(
        'elastic/infrastructure-employeeprofile/_doc/_search'
    );
    expect(req.request.method).toEqual('POST');
    req.flush(elasticRes);
    httpMock.verify();
  });

  it('should call searchForAlphaColumn', () => {
    service.searchForAlphaColumn('JB', 'userId')
        .subscribe(res => {
          expect(res).toEqual( ['123']
          );
        });
    const req = httpMock.expectOne(service.URLS.search);
    expect(req.request.url).toBe(
        'elastic/infrastructure-employeeprofile/_doc/_search'
    );
    expect(req.request.method).toEqual('POST');
    req.flush(elasticRes);
    httpMock.verify();
  });

  it('should call searchForStatusColumn', () => {
    service.searchForStatusColumn('JB', 'status')
        .subscribe(res => {
          expect(res).toEqual( ['A']
          );
        });
    const req = httpMock.expectOne(service.URLS.search);
    expect(req.request.url).toBe(
        'elastic/infrastructure-employeeprofile/_doc/_search'
    );
    expect(req.request.method).toEqual('POST');
    req.flush(elasticRes);
    httpMock.verify();
  });

  it('should call searchForNameColumn', () => {
    spyOn(service, 'buildSingleFieldQuery');
    const expectedSearchForNameResData: any[] = [
      { id: 1, name: 'Tarif1', value: '20' },
      { id: 2, name: 'Tarif2', value: '30' }
    ];
    const res = service
      .searchForNameColumn('test', 'firstName')
      .subscribe(
        response =>
          expect(response).toEqual(
            expectedSearchForNameResData,
            'expected res'
          ),
        fail
      );
    httpClientSpy.post.and.returnValue(expectedSearchForNameResData);
    expect(service).toBeTruthy();
    expect(service.buildSingleFieldQuery).toHaveBeenCalled();
  });

  it('should call buildSingleFieldQuery', () => {
    const mock = {
      bool: {
        must: [
          {
            query_string: {
              query: 'r*',
              analyze_wildcard: true,
              fields: ['firstName']
            }
          },
          {
            multi_match: {
              fields: ['firstName'],
              operator: 'and',
              query: 'a',
              type: 'cross_fields'
            }
          }
        ]
      }
    };
    const res = service.buildTokenizedQuery('a r', ['firstName']);
    expect(service).toBeTruthy();
    expect(res).toEqual(mock);
  });

  it('should call buildSingleFieldQuery when first param is undefined', () => {
    const mock = {
      bool: {
        must: [
          {
            query_string: {
              query: '*',
              analyze_wildcard: true,
              fields: ['firstName']
            }
          },
        ],
      }
    };
    const res = service.buildTokenizedQuery(undefined, ['firstName']);
    expect(service).toBeTruthy();
    expect(res).toEqual(mock);
  });
  it('should call searchForBUColumn', () => {
    service.searchForBUColumn('JB', 'positions.businessUnit')
        .subscribe(res => {
          expect(res).toEqual(['DCS']);
        });
    const req = httpMock.expectOne(service.URLS.search);
    expect(req.request.url).toBe(
        'elastic/infrastructure-employeeprofile/_doc/_search'
    );
    expect(req.request.method).toEqual('POST');
    req.flush(elasticRes);

    httpMock.verify();
  });
  it('should call searchForUsers', () => {
    service.searchForUsers('GE', 0, 25, [filter]).subscribe(res => {
      expect(res.hitCount).toEqual(12);
    });
    const req = httpMock.expectOne(service.URLS.search);

    expect(req.request.url).toBe(
      'elastic/infrastructure-employeeprofile/_doc/_search'
    );
    expect(req.request.method).toEqual('POST');
    req.flush(elasticRes);

    httpMock.verify();
  });

  it('should get reports for the workspace', inject(
    [DriverManagementService, HttpTestingController],
    (
      driverManagementService: DriverManagementService,
      testBackend: HttpTestingController
    ) => {
      const driverDTo = {
        personDTO: {
          isEmployee: true,
          emplid: 247260,
          firstName: 'Thomas',
          lastName: 'Blick',
          title: 'Intermodal Class A Driver Local',
          email: 'thomasvblick@gmail.com',
          personEmployeeID: '247260',
          phone: '',
          preferredName: 'Thomas',
          userName: 'BLIT7',
          manager: {
            isEmployee: true,
            emplid: 324619,
            firstName: 'Shannon',
            lastName: 'Mcdonald',
            title: 'Fleet Manager',
            email: 'shannon.mcdonald@jbhunt.com',
            personEmployeeID: '324619',
            phone: '8007231169',
            preferredName: 'Shannon',
            userName: 'JITM1781'
          }
        },
        teamRoleDTO: []
      };

      driverManagementService.getEmployee(1).subscribe(res => {
        expect(res.manager.isEmployee).toEqual(true);
      });
      const req = httpMock.expectOne(
        driverManagementService.URLS.findemployeedetailsbyid + '?personID=1'
      );

      expect(req.request.url).toBe(
        'personnelscheduleservices/employee/findemployeedetailsbyid?personID=1'
      );
      expect(req.request.method).toEqual('GET');
      req.flush(driverDTo);

      httpMock.verify();
    }
  ));

  it('should call searchForUsers when from and size are not present', () => {
    const res = service
      .searchForUsers('GE', undefined, undefined, undefined)
      .subscribe(response => {
        expect(response.hitCount).toEqual(12);
      });
    const req = httpMock.expectOne(service.URLS.search);

    expect(req.request.url).toBe(
      'elastic/infrastructure-employeeprofile/_doc/_search'
    );
    expect(req.request.method).toEqual('POST');
    req.flush(elasticRes);

    httpMock.verify();
  });
});
