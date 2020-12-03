import { ErrorComponent } from '../../error/error.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DriverProfileComponent } from './driver-profile.component';
import { PanelModule } from 'primeng/panel';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { DriverProfileService } from './driver-profile.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../../app-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { AvatarModule } from 'ngx-avatar';
import { APP_BASE_HREF } from '@angular/common';

describe('DriverProfileComponent', () => {
  let component: DriverProfileComponent;
  let fixture: ComponentFixture<DriverProfileComponent>;
  let driverProfileService: DriverProfileService;
  let http: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DriverProfileComponent, ErrorComponent],
      imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        PanelModule,
        BrowserAnimationsModule,
        SharedModule,
        HttpClientTestingModule,
        AvatarModule
      ],
      providers: [
        DriverProfileService,
        { provide: APP_BASE_HREF, useValue: '/' }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    http = TestBed.get(HttpTestingController);
    httpClient = TestBed.get(HttpClient);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverProfileComponent);
    component = fixture.componentInstance;
    driverProfileService = TestBed.get(DriverProfileService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load driver number', () => {
    component.userId = 'COXB7';
    spyOn(driverProfileService, 'getOperDataCodes').and.callFake(() => {
      return of({
        operData: {
          driverNumber: 53983
        }
      });
    });
    component.ngOnInit();
    expect(component.operDataInfo.operData.driverNumber).toEqual(53983);
  });
  it('should load business unit ', () => {
    component.userId = 'COXB7';
    const mockPerson = {
      emplId: '052091',
      userId: 'COXB7',
      firstName: '',
      middleName: '',
      lastName: '',
      prefName: '',
      personType: '',
      personSubType: '',
      isDriver: '',
      status: '',
      positionNbr: '',
      positionDescr: '',
      managerEmplId: '',
      managerName: 'Sherri Gillman',
      departmentCode: '',
      departmentDesc: '',
      businessUnit: 'JBT',
      jobCode: '',
      jobTitle: '',
      jobGroup: '',
      locationCode: '',
      locationDesc: '',
      phone: '',
      displayLastName: '',
      displayFirstName: '',
      employee: {
        emplId: '',
        userId: '',
        firstName: '',
        middleName: '',
        lastName: '',
        prefName: '',
        personType: '',
        status: '',
        positionNbr: '',
        positionDescr: '',
        managerEmplId: '',
        managerName: '',
        departmentCode: '',
        departmentDesc: '',
        jobCode: '',
        jobTitle: '',
        jobGroup: '',
        locationCode: '',
        locationDesc: '',
        phone: '',
        extenstion: '',
        email: ''
      }
    };
    spyOn(driverProfileService, 'getDriverPersonalData').and.callFake(() => {
      return of(mockPerson);
    });
    component.ngOnInit();
    expect(component.personDetails.businessUnit).toEqual('JBT');
  });
  it('should load fleet manager details', () => {
    component.userId = 'COXB7';
    const mockPerson = {
      emplId: '052091',
      userId: 'COXB7',
      firstName: '',
      middleName: '',
      lastName: '',
      prefName: '',
      personType: '',
      personSubType: '',
      isDriver: '',
      status: '',
      positionNbr: '',
      positionDescr: '',
      managerEmplId: '',
      managerName: 'Sherri Gillman',
      departmentCode: '',
      departmentDesc: '',
      businessUnit: '',
      jobCode: '',
      jobTitle: '',
      jobGroup: '',
      locationCode: '',
      locationDesc: '',
      phone: '',
      displayLastName: '',
      displayFirstName: '',
      employee: {
        emplId: '',
        userId: '',
        firstName: '',
        middleName: '',
        lastName: '',
        prefName: '',
        personType: '',
        status: '',
        positionNbr: '',
        positionDescr: '',
        managerEmplId: '',
        managerName: '',
        departmentCode: '',
        departmentDesc: '',
        jobCode: '',
        jobTitle: '',
        jobGroup: '',
        locationCode: '',
        locationDesc: '',
        phone: '',
        extenstion: '',
        email: ''
      }
    };
    spyOn(driverProfileService, 'getFleetManagerName').and.callFake(() => {
      return of(mockPerson);
    });
    component.ngOnInit();
    expect(component.personnelInfo.managerName).toEqual('Sherri Gillman');
  });

  it('Should check onTabChange', () => {
    component.onTabChange(event);
    expect(component.certificationsFilter).toBe(false);
  });

  it('Should onShowFilter for certifications', () => {
    const e = {
      comp: 'certifications',
      flag: true
    };
    component.onShowFilter(e);
    expect(component.certificationsFilter).toBe(true);
  });

  it('Should onShowFilter for endorsements', () => {
    const e = {
      comp: 'endorsements',
      flag: true
    };
    component.onShowFilter(e);
    expect(component.endorsementsFilter).toBe(true);
  });

  it('Should onShowFilter for non-endorsements and non-certifications', () => {
    const e = {
      comp: 'Preference',
      flag: true
    };
    component.onShowFilter(e);
    expect(component.endorsementsFilter).toBe(false);
    expect(component.certificationsFilter).toBe(false);
  });
  it('should get state name', () => {
    component.userId = 'COXB7';
    spyOn(driverProfileService, 'getStateName').and.callFake(() => {
      return of([
        {
          stateName: 'Oklahoma',
          stateCode: 'OK'
        },
        {
          stateName: 'Texas',
          stateCode: 'TX'
        }
      ]);
    });
    component.ngOnInit();
   expect(component.states[0].stateName).toEqual('Oklahoma');
  });
});
