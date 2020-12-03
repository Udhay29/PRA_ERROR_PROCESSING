import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelModule } from 'primeng/panel';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

import { DriverOverviewComponent } from './driver-overview.component';
import { SharedModule } from '../../../shared/shared.module';
import { DriverOverviewService } from './driver-overview.service';
import { AppRoutingModule } from '../../../app-routing.module';
import { of } from 'rxjs';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { ErrorComponent } from '../../../error/error.component';
import { AvatarModule } from 'ngx-avatar';
import * as moment from 'moment';
import { ProfilePictureService } from 'src/app/shared/services/picture.service';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('DriverOverviewComponent', () => {
  let component: DriverOverviewComponent;
  let fixture: ComponentFixture<DriverOverviewComponent>;
  let profilePictureService: ProfilePictureService;
  let driverOverviewService: DriverOverviewService;
  let http: HttpTestingController;
  let httpClient: HttpClient;

  const Mock = {
    emplId: '052091',
    userId: 'COXB7',
    operData: {
      driverLicense: {
        licenseType: 'CA',
        licenseNumber: 'F081206175',
        expirationDate: '2022-10-31',
        licenseState: 'OK',
        licenseCountry: 'USA',
        qualifiers: [
          {
            qualifierClass: 'E',
            qualifierType:
              'CDL Endorsement - X - Combination of Tank Vehicle and Hazardous Materials',
            expirationDate: '2022-10-31'
          },
          {
            qualifierClass: 'E',
            qualifierType: 'CDL Endorsement - T - Double/Triple Trailers',
            expirationDate: '2022-10-31'
          },
          {
            qualifierClass: 'E',
            qualifierType: 'HAZMAT',
            expirationDate: '2022-10-31'
          },
          {
            qualifierClass: 'E',
            qualifierType: 'CDL Endorsement - N - Tank Vehicle',
            expirationDate: null
          }
        ]
      },
      dispatchBoard: 'L63',
      driverNumber: 53983,
      seatNumber: '1',
      fleetCode: 'JBC SWNET4',
      dotReviewDate: '2020-02-04',
      physicalExpDate: '2019-09-12',
      experienceYears: 0
    }
  };

  const fleetManagerDetails = {
    businessUnit: 'JBI',
    departmentCode: '050075',
    departmentDesc: '',
    displayFirstName: 'Sidney',
    displayLastName: 'Edwards',
    email: '',
    emplId: '253835',
    employee: {
      businessUnit: 'JBI',
      departmentCode: '',
      departmentDesc: '',
      email: 'donald.smith@jbhunt.com',
      emplId: '321812',
      extenstion: '',
      firstName: 'Donald',
      isDriver: 'N',
      jobCode: '001082',
      jobGroup: 'OPS - General',
      jobTitle: 'Fleet Manager',
      lastName: 'Smith',
      locationCode: 'LS GA02',
      locationDesc: 'Lithia Springs, GA - Sydney Ct',
      managerEmplId: '283442',
      managerName: 'Daniel Anderson',
      middleName: '',
      personSubType: '',
      personType: 'EMP',
      phone: '',
      positionDescr: 'Fleet Manager',
      positionNbr: '00305118',
      prefName: 'Donald',
      status: 'A',
      userId: 'JITM2192'
    },
    extenstion: '',
    firstName: 'SIDNEY',
    isDriver: 'Y',
    jobCode: '005134',
    jobGroup: 'REG',
    jobTitle: 'Intermodal Class A Driver Regional',
    lastName: 'EDWARDS',
    locationCode: 'FP GA01',
    locationDesc: 'Forest Park, GA - Ruskin Dr',
    managerEmplId: '321812',
    managerName: 'Donald Smith',
    middleName: '',
    personSubType: '',
    personType: 'EMP',
    phone: '6786603548',
    positionDescr: 'Intermodal Class A Driver Regional',
    positionNbr: '10001500',
    prefName: 'Sidney',
    status: 'A',
    userId: 'EDWS18'
  };
  const stateMock = [
    {
      stateName: 'Oklahoma',
      stateCode: 'OK'
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DriverOverviewComponent, ErrorComponent],
      imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        PanelModule,
        BrowserAnimationsModule,
        SharedModule,
        HttpClientTestingModule,
        AvatarModule,
        RouterTestingModule
      ],
      providers: [
        ProfilePictureService,
        DriverOverviewService,
        { provide: APP_BASE_HREF, useValue: '/' }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    http = TestBed.get(HttpTestingController);
    httpClient = TestBed.get(HttpClient);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverOverviewComponent);
    profilePictureService = fixture.debugElement.injector.get(
      ProfilePictureService
    );
    driverOverviewService = fixture.debugElement.injector.get(
      DriverOverviewService
    );
    component = fixture.componentInstance;
    component.userId = 'COXB7';
    component.operData = Mock.operData;
    component._states = stateMock;
    component.personnelInfo = fleetManagerDetails;
    profilePictureService = TestBed.get(ProfilePictureService);
    driverOverviewService = TestBed.get(DriverOverviewService);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  afterEach(async(() => {
    fixture.destroy();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should load operData', () => {
    component.operDataInfo = Mock;
    expect(component.operDataInfo).toEqual(component.operData);
  });
  it('should load fleetManagerDetails', () => {
    expect(component.personnelInfo).toEqual(component.fleetManager);
  });

  it('should check hire date displayed', async(() => {
    component.userId = 'NICR8';
    spyOn(driverOverviewService, 'getHireDate').and.callFake(() => {
      return of({
        emplId: 52091,
        userId: 'COXB7',
        firstName: 'BRUCE',
        middleName: '',
        lastName: 'COX',
        jobCode: '005060',
        jobTitle: 'CRF Class A Driver Regional',
        status: 'A',
        originalHireDate: '1994-06-23',
        currentHireDate: '1994-06-23',
        lastTermDate: '',
        seniorityDate: '1994-06-23',
        anniversaryDate: '1994-06-23',
        lastEvalDate: '2019-06-23'
      });
    });
    component.getHireDate();
    component.hireInfo$.subscribe(employeeHireInfo => {
      expect(employeeHireInfo.originalHireDate).toEqual('1994-06-23');
    });
  }));

  it('should check cell number valid', async(() => {
    component.userId = 'COXB7';
    spyOn(driverOverviewService, 'getCellNumber').and.callFake(() => {
      return of({
        emplId: '12345',
        userId: 'COXB7',
        contacts: [
          {
            contactType: 'EMAIL',
            contactSubType: 'WORK',
            contactString: 'test@jbhunt.com',
            contactPreference: 'PRI'
          },
          {
            contactType: 'EMAIL',
            contactSubType: 'SEC',
            contactString: 'test@mail.com',
            contactPreference: 'PRI'
          },
          {
            contactType: 'PHONE',
            contactSubType: 'WORK',
            contactString: '147852369',
            contactPreference: 'PRI'
          },
          {
            contactType: 'PHONE',
            contactSubType: 'CELL',
            contactString: '258963147',
            contactPreference: 'PRI'
          },
          {
            contactType: 'PHONE',
            contactSubType: 'WORK_EXT',
            contactString: '73410',
            contactPreference: 'PRI'
          }
        ]
      });
    });
    component.getCellPhoneNumber();
    component.person$.subscribe(employeeCellNumber => {
      expect(employeeCellNumber['contacts'][3].contactSubType).toEqual('CELL');
      expect(employeeCellNumber['contacts'][3].contactString).toEqual(
        '258963147'
      );
    });
  }));

  it('should check Date Of Birth valid', () => {
    const peopleData = {
      firstName: 'QWERT',
      lastName: 'QWERT',
      userID: 'DAY102',
      dateOfBirth: '1901-04-02',
      positions: [{}],
      operationData: [{}]
    };
    spyOn(driverOverviewService, 'getDateOfBirth').and.callFake(() => {
      return of(peopleData);
    });
    component.getDateOfBirth();
    component.dateOfBirth$.subscribe(employeeDOB => {
      expect(employeeDOB.dateOfBirth).toEqual('1901-04-02');
    });
  });

  it('should check for track by function', () => {
    const index = component.trackByFn(1);
    expect(index).toEqual(1);
  });

  it('should check for checkSubContactType function', () => {
    expect(component.checkSubContactType('CELL', 'CELL')).toBeTruthy();
  });
  it('should check for null expiration value in getDaysUntilExpiration', () => {
    const nullExpDate =
      Mock.operData.driverLicense.qualifiers[3].expirationDate;
    expect(component.getDaysUntilExpiration(nullExpDate)).toEqual(null);
    expect(component.loadIcons(nullExpDate)).toEqual(null);
  });
  it('should return state name', () => {
    component.getStateName();
    expect(component.stateName).toEqual('Oklahoma');
  });
  describe('DriverOverviewCompponent With Null Data', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(DriverOverviewComponent);
      driverOverviewService = fixture.debugElement.injector.get(
        DriverOverviewService
      );
      component = fixture.componentInstance;
      component.userId = null;
      component.operDataInfo = null;
      component.states = null;
      component.personnelInfo = null;
      profilePictureService = TestBed.get(ProfilePictureService);
      driverOverviewService = TestBed.get(DriverOverviewService);
      fixture.detectChanges();
    });
    it('should load null data', () => {
      expect(component).toBeTruthy();
    });
  });
});
