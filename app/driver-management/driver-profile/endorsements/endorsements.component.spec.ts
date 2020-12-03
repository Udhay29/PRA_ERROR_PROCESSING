import { ErrorComponent } from '../../../error/error.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EndorsementsComponent } from './endorsements.component';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/primeng';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { PanelModule } from 'primeng/panel';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../../../app-routing.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DriverProfileBannerService } from '../driverprofile_banner/driver-profile-banner.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('EndorsementsComponent', () => {
  let component: EndorsementsComponent;
  let fixture: ComponentFixture<EndorsementsComponent>;
  let driverProfileBannerService: DriverProfileBannerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EndorsementsComponent, ErrorComponent],
      imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        PanelModule,
        BrowserAnimationsModule,
        SharedModule,
        TableModule,
        PaginatorModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        DriverProfileBannerService,
        { provide: APP_BASE_HREF, useValue: '/' }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  describe('EndorsementsComponent With UserID', () => {
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
              expirationDate: '2022-10-31',
              icon: ''
            },
            {
              qualifierClass: 'E',
              qualifierType: 'CDL Endorsement - T - Double/Triple Trailers',
              expirationDate: '2022-10-31',
              icon: ''
            },
            {
              qualifierClass: 'E',
              qualifierType: 'HAZMAT',
              expirationDate: '2022-10-31',
              icon: ''
            },
            {
              qualifierClass: 'E',
              qualifierType: 'CDL Endorsement - N - Tank Vehicle',
              expirationDate: '',
              icon: ''
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

    const personDetailsMock: any = {
    userId: '',
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
          wageType: 'H',
        }
      ]
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(EndorsementsComponent);
      driverProfileBannerService = fixture.debugElement.injector.get(
        DriverProfileBannerService
      );
      component = fixture.componentInstance;
      component.userId = 'COXB7';
      component.operDataInfo = Mock;
      component.personDetails = personDetailsMock;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render title in a panel-title attribute', async () => {
      component.getOperDataCodes();
      expect(component.operData.operData.driverLicense.qualifiers).toEqual(
        Mock.operData.driverLicense.qualifiers
      );
    });
    it('should load operData', () => {
      expect(component.operDataInfo).toEqual(Mock);
    });
    it('should load personDetails', () => {
      expect(component.personDetails).toEqual(personDetailsMock.positions[0].busUnit);
    });

    it('should search data when call onSearch', () => {
      const mockEvent = new MouseEvent('click');
      component.onSearch('event');
      expect(component.mostRecentSearch).toEqual('event');
    });

    it('should update tablesize and firstRecord onPageChange', () => {
      const event = { page: 0, first: 0, rows: 50, pageCount: 1 };
      component.onPageChange(event);
      expect(component.tableSize).toEqual(50);
      expect(component.firstRecord).toEqual(0);
    });

    it('should allEndorsement to be defined onPageChange', () => {
      const event = { page: 0, first: 0, rows: 50, pageCount: 1 };
      component.allEndorsement = [
        {
          expirationDate: '2026-11-19',
          qualifierClass: 'R',
          qualifierType: 'CDL Restriction - Corrective Lenses',
          icon: ''
        }
      ];
      component.onPageChange(event);
      expect(component.allEndorsement.length).toEqual(1);
    });
  });

  describe('EndorsementsComponent Without UserID', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(EndorsementsComponent);
      driverProfileBannerService = fixture.debugElement.injector.get(
        DriverProfileBannerService
      );
      component = fixture.componentInstance;
      component.userId = null;
      component.operDataInfo = null;
      component.personDetails = null;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
});
