import { ErrorComponent } from '../../../error/error.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelModule } from 'primeng/panel';
import { APP_BASE_HREF } from '@angular/common';

import { SharedModule } from '../../../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '../../../app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { DriverProfileBannerComponent } from './driver-profile-banner.component';
import { AvatarModule } from 'ngx-avatar';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ProfilePictureService } from 'src/app/shared/services/picture.service';

describe('DriverProfileBannerComponent', () => {
  let component: DriverProfileBannerComponent;
  let fixture: ComponentFixture<DriverProfileBannerComponent>;
  let profilePictureService: ProfilePictureService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DriverProfileBannerComponent, ErrorComponent],
      imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        PanelModule,
        BrowserAnimationsModule,
        SharedModule,
        AvatarModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        ProfilePictureService,
        { provide: APP_BASE_HREF, useValue: '/' }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  describe('DriverProfileBannerComponentWithUserId', () => {
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
        experienceYears: 0.0
      }
    };

    const personnelInfoMock = {
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

    const personDetailsMock = {
      emplId: '253835',
      positions: [
        {
          busUnit: 'JBI',
          company: 'JBH',
          customerID: 'REGDRA',
          departmentCode: '050075',
          departmentDesc: '',
          description: 'Intermodal Class A Driver Regional',
          entryDate: '2017-02-23',
          fullTimePartTime: 'F',
          glLocationCode: 'ATLGA',
          jobCode: '005134',
          jobGroup: 'REG',
          jobTitle: 'Intermodal Class A Driver Regional',
          locationCode: 'FP GA01',
          locationDesc: 'Forest Park, GA - Ruskin Dr',
          managementLevel: '15',
          overtimeType: 'E',
          payGroup: 'Drivers-EE INTERMODAL (Sun - Sat) Pay Group',
          positionNbr: '10001500',
          regTemp: 'R',
          reports2PosNbr: '00305118',
          taxLocationCode: '',
          wageType: 'H'
        }
      ]
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(DriverProfileBannerComponent);
      profilePictureService = fixture.debugElement.injector.get(
        ProfilePictureService
      );
      component = fixture.componentInstance;
      component.userId = 'COXB7';
      component.operDataInfo = Mock;
      component.personnelInfo = personnelInfoMock;
      component.personDetails = personDetailsMock;
      profilePictureService = TestBed.get(ProfilePictureService);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load personDetails', () => {
      expect(component.personDetails).toEqual(component._personDetails);
    });

    it('should load operData', () => {
      expect(component.operDataInfo).toEqual(component.operData);
    });
    it('should load fleetManagerDetails', () => {
      expect(component.personnelInfo).toEqual(component.status);
    });
  });

  describe('DriverProfileBannerComponentWithoutUserId', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(DriverProfileBannerComponent);
      profilePictureService = fixture.debugElement.injector.get(
        ProfilePictureService
      );
      component = fixture.componentInstance;
      component.userId = null;
      component.operDataInfo = null;
      component.personnelInfo = null;
      component.personDetails = null;
      profilePictureService = TestBed.get(ProfilePictureService);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
});
