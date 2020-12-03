import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificationsComponent } from './certifications.component';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { PaginatorModule } from 'primeng/primeng';
import { CertificationsService } from './certifications.service';
import { SharedModule } from '../../../shared/shared.module';
import { AppRoutingModule } from '../../../app-routing.module';
import { ErrorComponent } from '../../../error/error.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('CertificationsComponent', () => {
  let component: CertificationsComponent;
  let fixture: ComponentFixture<CertificationsComponent>;
  let certificationsService: CertificationsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CertificationsComponent, ErrorComponent],
      imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        PanelModule,
        BrowserAnimationsModule,
        SharedModule,
        TableModule,
        PaginatorModule,
        RouterTestingModule
      ],
      providers: [
        CertificationsService,
        { provide: APP_BASE_HREF, useValue: '/' }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  describe('CertificationsComponent With data', () => {
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
      fixture = TestBed.createComponent(CertificationsComponent);
      component = fixture.componentInstance;
      component.busUnit = personDetailsMock.positions[0].busUnit;
      certificationsService = TestBed.get(CertificationsService);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should call get certifications method and return person certifications', async () => {
      const dataMock = {
        PersonCertification: [
          {
            EmplId: '052091',
            UserId: 'COXB7',
            Certifications: [
              {
                CertificateName: 'Driver Trainer - JB Hunt',
                Issuer: 'JB Hunt',
                CertificateNumber: '77399',
                Country: '',
                IssueDate: '2018-05-15',
                ExpiryDate: '2021-05-15'
              },
              {
                CertificateName: 'Driver Annual Review - JB Hunt',
                Issuer: 'JB Hunt',
                CertificateNumber: '77398',
                Country: '',
                IssueDate: '2019-03-04',
                ExpiryDate: '2020-02-04'
              },
              {
                CertificateName: 'Driver Physical - JB Hunt',
                Issuer: 'JB Hunt',
                CertificateNumber: '77397',
                Country: '',
                IssueDate: '2018-09-12',
                ExpiryDate: '2019-09-12'
              },
              {
                CertificateName: 'Hazmat Certification (CDL holders) - JB Hunt',
                Issuer: 'JB Hunt',
                CertificateNumber: '77396',
                Country: '',
                IssueDate: '2013-04-08',
                ExpiryDate: null
              }
            ]
          }
        ]
      };
      spyOn(certificationsService, 'getCertifications').and.callFake(() => {
        return of(dataMock);
      });
      component.getCertifications();
      component.certificates$.subscribe(certs => {
        expect(certs).toEqual(dataMock);
        const expiration =
          dataMock.PersonCertification[0].Certifications[3].ExpiryDate;
        expect(expiration).toBe(null);
      });
    });

    it('should search data when call onSearch', () => {
      component.onSearch('event');
      expect(component.mostRecentSearch).toEqual('event');
    });

    it('should update tablesize and firstRecord onPageChange', () => {
      const event = { page: 0, first: 0, rows: 50, pageCount: 1 };
      component.onPageChange(event);
      expect(component.tableSize).toEqual(50);
      expect(component.firstRecord).toEqual(0);
    });

    it('toggleFormFilter', () => {
      component.showFilterFlag = true;
      component.toggleFormFilter();
      expect(component.showFilterFlag).toBeFalsy();
    });

    it('trackByFn', () => {
      const index = component.trackByFn(1);
      expect(index).toEqual(1);
    });

    it('ngOnit', () => {
      const dataMock = {
        PersonCertification: [
          {
            EmplId: '248756',
            UserId: 'HOFP2',
            Certifications: [
              {
                CertificateName: 'Driver Physical - JB Hunt',
                Issuer: 'JB Hunt',
                CertificateNumber: '65564',
                IssueDate: '2019-01-28',
                Country: '',
                ExpiryDate: '2021-01-28'
              }
            ]
          }
        ]
      };
      component.mostRecentSearch = 'even2';
      component.allCertificates = [
        {
          CertificateName: 'asdf',
          issuer: 'asdf',
          certificateNumber: 5,
          country: 'string',
          issueDate: '2019-01-28',
          ExpiryDate: 'string',
          icon: '',
          busUnit: 'JBT',
          company: 'JBH',
          customerID: '',
          departmentCode: '',
          departmentDesc: '',
          description: 'CRF Class A Driver Regional',
          entryDate: '2019-07-21',
          fullTimePartTime: 'F',
          glLocationCode: '',
          jobCode: '005060',
          jobGroup: 'REG',
          jobTitle: 'CRF Class A Driver Regional',
          locationCode: 'LOWAR01',
          locationDesc: 'Lowell, AR - JB Hunt Corporate',
          managementLevel: '15',
          overtimeType: 'E',
          payGroup: 'Drivers-EE TRUCK (Sun - Sat) Pay Group',
          positionNbr: '10001656',
          regTemp: 'R',
          reports2PosNbr: '00001299',
          taxLocationCode: '',
          wageType: 'H'
        }
      ];
      component.ngOnInit();

      component.onSearch$.next('event1');
      expect(component.certificates.length).toBe(0);
    });

    it('should load business unit', () => {
      component.busUnit = personDetailsMock['positions'][0].busUnit;
      expect(component.busUnit).toEqual(component.personDetails);
    });

    it('should load personDetails', () => {
      component.personDetails = 'JBI';
      expect(component.busUnit).toEqual(
        personDetailsMock['positions'][0].busUnit
      );
    });
  });

  describe('CertificationsComponent With null data', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CertificationsComponent);
      component = fixture.componentInstance;
      component.personDetails = null;
      certificationsService = TestBed.get(CertificationsService);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
});
