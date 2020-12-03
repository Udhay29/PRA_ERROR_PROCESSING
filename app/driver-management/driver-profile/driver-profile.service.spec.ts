import { async, TestBed } from '@angular/core/testing';
import { DriverProfileService } from './driver-profile.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

describe('DriverProfileService', () => {
  let driverProfileService: DriverProfileService;
  let httpMock: HttpTestingController;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DriverProfileService]
    });
    httpMock = TestBed.get(HttpTestingController);
    driverProfileService = TestBed.get(DriverProfileService);
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(driverProfileService).toBeTruthy();
  });
  it('should be call getFleetManagerName', () => {
    const person = {
      emplId: '0520369',
      userId: 'DAY201',
      firstName: 'JOHN DOE',
      middleName: '',
      lastName: 'XXXX',
      jobCode: '006060',
      jobTitle: 'CRF Class A Driver Regional',
      status: 'A',
      originalHireDate: '1994-06-23',
      currentHireDate: '1994-06-23',
      seniorityDate: '1994-06-23',
      anniversaryDate: '1994-06-23',
      managerEmplId: '45678'
    };
    const employee = {
      emplId: '289533',
      userId: 'JOPR1970',
      firstName: 'Andrew',
      middleName: 'Charles',
      lastName: 'Heim',
      prefName: 'Andrew',
      personType: 'EMP',
      status: 'A',
      positionNbr: '00102670',
      positionDescr: 'Operations Support Leader',
      managerEmplId: '011237',
      managerName: 'REGINA CARMEAN',
      departmentCode: '',
      departmentDesc: '',
      jobCode: '001662',
      jobTitle: 'Operations Support Leader',
      jobGroup: 'OPS - General',
      locationCode: 'LOWAR01',
      locationDesc: 'Lowell, AR - JB Hunt Corporate',
      phone: '4794191986',
      extenstion: '71986',
      email: 'Andrew.Heim@jbhunt.com'
    };
    driverProfileService.getFleetManagerName('COXB7').subscribe(res => {
      expect(res.employee.managerName).toEqual('REGINA CARMEAN');
    });
    const req = httpMock.expectOne('eoi/person/userid/COXB7');
    expect(req.request.method).toEqual('GET');
    req.flush(person);
    const request = httpMock.expectOne('eoi/person/emplid/45678');
    expect(request.request.method).toEqual('GET');
    request.flush(employee);
  });
  it('should call getStateName', () => {
    const state = {
      _embedded: {
        states: [
          {
            stateCode: 'OK',
            stateID: 124,
            stateName: 'Oklahoma'
          }
        ]
      }
    };
    driverProfileService.getStateName().subscribe(response => {
      expect(response[0].stateName).toEqual('Oklahoma');
    });
    const request = httpMock.expectOne('masterdatageographyservices/states/');
    expect(request.request.method).toEqual('GET');
    request.flush(state);
  });
});
