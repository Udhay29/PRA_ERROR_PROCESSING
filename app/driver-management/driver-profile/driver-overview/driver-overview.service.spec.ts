import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { DriverOverviewService } from './driver-overview.service';

describe('DriverOverviewservice', () => {
  let service: DriverOverviewService;
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DriverOverviewService]
    });
    service = TestBed.get(DriverOverviewService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getCellNumber', () => {
    const contact = {
      emplId: '12345',
      userId: 'COXB7',
      contacts: [
        {
          contactType: 'EMAIL',
          contactSubType: 'WORK',
          contactString: 'test@jbhunt.com',
          contactPreference: 'PRI'
        }
      ]
    };
    service.getCellNumber('COXB7').subscribe(res => {
      expect(res.contacts[0].contactString).toEqual('test@jbhunt.com');
    });
    const req = httpMock.expectOne('eoi/person/contacts/userid/COXB7');
    expect(req.request.method).toEqual('GET');
    req.flush(contact);
    expect(service).toBeTruthy();
  });
  it('should call getHireDate', () => {
    const hireData = {
      emplId: '052091',
      userId: 'COXB7',
      firstName: 'BRUCE',
      middleName: '',
      lastName: 'COX',
      jobCode: '005060',
      jobTitle: 'CRF Class A Driver Regional',
      status: 'A',
      originalHireDate: '1994-06-23',
      currentHireDate: '1994-06-23',
      timeOffServiceDate: '1994-06-23',
      anniversaryDate: '1994-06-23'
    };
    service.getHireDate('COXB7').subscribe(response => {
      expect(response.jobTitle).toEqual('CRF Class A Driver Regional');
    });
    const req = httpMock.expectOne('eoi/person/hiredata/userid/COXB7');
    expect(req.request.method).toEqual('GET');
    req.flush(hireData);
    expect(service).toBeTruthy();
  });

  it('should call getDateOfBirth', () => {
    const res = service.getDateOfBirth('07-07-1981');
    expect(service).toBeTruthy();
    expect(res).not.toBeNull();
  });
});
