import { MenuItem } from 'primeng/api';
import { ProfilePictureService } from '../shared/services/picture.service';
import { AppService } from '../app.service';
import { Subject, of } from 'rxjs';
import { ErrorComponent } from './../error/error.component';
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BreadcrumbModule, PaginatorModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { HttpClientModule } from '@angular/common/http';
import { DriverManagementComponent } from './driver-management.component';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { DriverManagementService } from './driver-management.service';
import { SharedModule } from '../shared/shared.module';
import { Driver } from './driver-management.model';
import { LocalStorageService } from 'lib-platform-services';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../app.component';
import {ElasticFilter} from '../shared/filter-panel/filter/filter.model';

describe('DriverManagementComponent', () => {
  let component: DriverManagementComponent;
  let appComponent: AppComponent;
  let fixture: ComponentFixture<DriverManagementComponent>;
  let appFixture: ComponentFixture<AppComponent>;
  let driverManagementservice: DriverManagementService;
  let appService: AppService;
  let pictureService: ProfilePictureService;
  let router: Router;
  let routes: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BreadcrumbModule,
        TableModule,
        PaginatorModule,
        ButtonModule,
        HttpClientModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        BrowserAnimationsModule,
        SharedModule
      ],
      declarations: [DriverManagementComponent, AppComponent, ErrorComponent],
      providers: [MessageService, LocalStorageService, AppService],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriverManagementComponent);
    appFixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    appComponent = appFixture.componentInstance;
    appService = TestBed.get(AppService);
    driverManagementservice = TestBed.get(DriverManagementService);
    pictureService = TestBed.get(ProfilePictureService);
    router = TestBed.get(Router);
    routes = TestBed.get(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(component).toBeTruthy();
  });
  it ('should load results', () => {
    spyOn(driverManagementservice, 'getEmployee').and.callFake( () => {
      return of(new Driver());
    });
    spyOn(driverManagementservice, 'searchForUsers');
    const result = {employees: [], hitCount: 1};
    component.loadResult(result);
    expect(component.filters.length).toEqual(5);
    expect(component.fullscreen).toEqual(false);
    expect(component.employees).toEqual(result.employees);
    expect(component.totalRecords).toEqual(result.hitCount);
    expect(component.values).toEqual(component.mapEmployeesForTable(result.employees));
    component.getDriverData();
    const returnedResults = component.loadResult(result);
    expect(returnedResults).toBeUndefined();
  });
  it('should load driver data', fakeAsync( () => {
      spyOn(driverManagementservice, 'getEmployee')
          .and.callFake( () => {
            return of(new Driver());
      });
      spyOn(driverManagementservice, 'searchForUsers')
          .and.callFake( () => {
            return of({employees: [], hitCount: 1});
      });
      spyOn(component, 'loadResult');
    component.getDriverData();
    driverManagementservice.getEmployee(23),
          driverManagementservice.searchForUsers(
              component.mostRecentSearch,
              component.firstRecord,
              component.tableSize,
              component.activeFilters)
          .subscribe(res => {
            expect(component.loadResult).toHaveBeenCalledWith({employees: [], hitCount: 1});
            expect(res).toEqual({employees: [], hitCount: 1});
          });
      }));
  it('should check driver', () => {
    const element = {};
    element['businessUnit'] = 'DCS';
    component.onRowSelect(element);
    const employee = {
      scheduleList: [],
      emplid: 5752,
      delegations: [],
      userName: 'DHIY1',
      manager: { userName: 'DHIY1' }
    };
    fixture.detectChanges();
    component.loadEmployeeData(employee);
    expect(component.selectedRowEmp.businessUnit).toBe('DCS');
  });

  it('should check driver with employee id', () => {
    const element = {};
    element['businessUnit'] = 'DCS';
    component.selectedEmp = new Driver();
    component.selectedEmp['emplid'] = 5752;
    component.onRowSelect(element);
    expect(component.selectedRowEmp['businessUnit']).toEqual('DCS');
    expect(component.userPanelIsLoading).toBe(true);

    const employee = {
      scheduleList: [],
      emplid: 5752,
      delegations: [],
      userName: 'DHIY1',
      manager: { userName: 'DHIY1' }
    };
    component.loadEmployeeData(employee);
    const event = { rows: 3, first: 5752 };
    component.buildSearchSubject();
    component.onPageChange(event);
    const obj = { employees: [], hitCount: 5 };
    component.searchForUsersSubscribe(obj);
    expect(component.tableSize).toEqual(3);
  });

  it('should check row selection', () => {
    const tableEmp = {};
    tableEmp['id'] = 'JDCS3165';
    const employee = new Driver();
    employee.emplid = 5752;
    spyOn(driverManagementservice, 'getEmployee').and.callFake(() => {
      return of(employee);
    });
    spyOn(component, 'loadEmployeeData');

    component.onRowSelect(tableEmp);
    component.loadEmployee(5752);
    component.getDriverData();
    expect(component.selectedRowEmp['id']).toEqual('JDCS3165');
    expect(component.userPanelIsLoading).toBe(true);
    driverManagementservice.getEmployee(23).subscribe(response => {
      expect(component.loadEmployeeData).toHaveBeenCalledWith(employee);
    });
  });

  it('should check navigated to driver overview page ', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.selectedEmp = new Driver();
    const userId = (component.selectedEmp['userName'] = 'JDCS3165');
    component.goToFullscreen(userId);
    expect(navigateSpy).toHaveBeenCalledWith(['./user/' + userId], {
      relativeTo: routes
    });
    expect(component).toBeTruthy();
  });

  it('should check search results ', () => {
    component.buildSearchSubject();
    component.onSearch$.subscribe(res => {
      expect(res).toEqual('geo');
      expect(component.values.length).toEqual(0);
    });
    component.onSearch('geo');
  });

  it('should check setBreadcrumbs ', () => {
    const driver: any = {
      emplid: 3434,
      firstName: 'Name',
      lastName: 'lst name',
      title: 'title',
      email: 'test@test.com',
      extenstion: 'ext',
      personEmployeeID: 'id',
      phone: '1234567890',
      preferredName: 'pn',
      userName: 'un',
      manager: {},
      profilePic: 'pp',
      businessUnit: 'bu',
      status: 's'
    };
    const breadcrumbs: MenuItem[] = [
      { label: 'Driver Management', routerLink: '/driver-management' }
    ];
    component.selectedEmp = driver;
    component.setBreadcrumbs(21);
    expect(appService).toBeTruthy();
    expect(appService.breadcrumbs).toEqual(undefined);
    appService.getBreadcrumbObservable().subscribe(res => {
      expect(appComponent.breadcrumbItems.length).toBe(3);
    });
  });

  it('should check isEmployee ', () => {
    const driver: any = {
      emplid: 3434,
      firstName: 'Bruce',
      lastName: 'Cox',
      title: 'Driver',
      email: 'test@test.com',
      extenstion: '123',
      personEmployeeID: '134',
      phone: '1234567890',
      preferredName: 'COXB7',
      userName: 'bruce',
      manager: {},
      profilePic: 'profilePicture',
      businessUnit: 'DCS',
      status: 'avaialble'
    };
    expect(component.isEmployee(driver)).toBe(false);
  });

  it('should onFilters ', () => {
    const filters: any = [
      {
        name: 'isDriver',
        field: 'personDTO.isDriver',
        type: {
          CHECKBOX: 'CHECKBOX'
        },
        model: ['Y'],
        isActive: function() {
          return true;
        },
        reset: function() {}
      }
    ];
    component.onSearch$ = new Subject<any>();
    component.onFilter(filters);
    expect(component.firstRecord).toEqual(0);
  });
  it ('should map employees to table', () => {
    const driver: any[] = [{
      emplid: 3434,
      firstName: 'Bruce',
      lastName: 'Cox',
      title: 'Driver',
      email: 'test@test.com',
      extenstion: '123',
      personEmployeeID: '134',
      phone: '1234567890',
      preferredName: 'Bruce',
      userName: 'COXB7',
      manager: [{}],
      profilePic: 'profilePicture',
      businessUnit: 'DCS',
      status: 'avaialble',
      get fullName(): string {
        return `${this.preferredName ? this.preferredName : this.firstName} ${
            this.lastName
            }`;
      }
    }];
    const activeDriver: any[] = [{
      emplid: 3434,
      firstName: 'Bruce',
      lastName: 'Cox',
      title: 'Driver',
      email: 'test@test.com',
      extenstion: '123',
      personEmployeeID: '134',
      phone: '1234567890',
      preferredName: 'Bruce',
      userName: 'COXB7',
      manager: [{}],
      profilePic: 'profilePicture',
      businessUnit: 'DCS',
      status: 'A',
      get fullName(): string {
        return `${this.preferredName ? this.preferredName : this.firstName} ${
            this.lastName
            }`;
      }
    }];
    const tableDriver: any[] = [
        {
      id: 3434,
      userName: 'COXB7',
      managerid: undefined,
      fullName: 'Bruce Cox (COXB7)',
      title: 'Driver',
      businessUnit: 'DCS',
      status: 'Leave'
    }
    ];
      const activeTableDriver: any[] = [
          {
              id: 3434,
              userName: 'COXB7',
              managerid: undefined,
              fullName: 'Bruce Cox (COXB7)',
              title: 'Driver',
              businessUnit: 'DCS',
              status: 'Active'
          }
      ];
    expect(component.mapEmployeesForTable(driver)).toEqual(tableDriver);
    expect(component.mapEmployeesForTable(activeDriver)).toEqual(activeTableDriver);
  });
  it('should set sort order to desc', fakeAsync(() => {
    const mockColumn = 'test';
    component.sortingState = {
      sortKey: 'test',
      sortOrder: 'asc'
    };
    component.updateSortingState(mockColumn);
    expect(component.sortingState.sortOrder).toEqual('desc');
  }));

  it ('should filter by first name', () => {
    const mockFilter = new ElasticFilter('First Name', 'firstName', event =>
        driverManagementservice.searchForColumn(event.query, 'firstName'));
    const firstNameFilter = component.buildPreferredNameFilter();
        firstNameFilter.searchMethod(event => driverManagementservice.searchForColumn(event.query, 'firstName'));
    spyOn(component, 'buildPreferredNameFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildPreferredNameFilter).toHaveBeenCalled();
    expect(mockFilter.field).toEqual(firstNameFilter.field);
  });
  it ('should build last name filter', () => {
    const mockFilter = new ElasticFilter('Last Name', 'lastName', event =>
        driverManagementservice.searchForColumn(event.query, 'lastName'));
    const lastNameFilter = component.buildPreferredLANameFilter();
        lastNameFilter.searchMethod(event => driverManagementservice.searchForColumn(event.query, 'lastName'));
    spyOn(component, 'buildPreferredLANameFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildPreferredLANameFilter).toHaveBeenCalled();
    expect(mockFilter.field).toEqual(lastNameFilter.field);
  });
  it ('should build alpha code filter', () => {
    const mockFilter = new ElasticFilter('Alpha Code', 'userID', event =>
        driverManagementservice.searchForColumn(event.query, 'userID'));
    const alphaCodeFilter = component.buildPreferredAlphaFilter();
        alphaCodeFilter.searchMethod(event => driverManagementservice.searchForColumn(event.query, 'userID'));
    spyOn(component, 'buildPreferredAlphaFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildPreferredAlphaFilter).toHaveBeenCalled();
    expect(mockFilter.field).toEqual(alphaCodeFilter.field);
  });
  it ('should build business unit filter', () => {
    const mockFilter = new ElasticFilter('Business Unit', 'positions.businessUnit', event =>
        driverManagementservice.searchForColumn(event.query, 'positions.businessUnit'));
    const businessUnitFilter = component.buildPreferredBUFilter();
        businessUnitFilter.searchMethod(event => driverManagementservice.searchForColumn(event.query, 'positions.businessUnit'));
    spyOn(component, 'buildPreferredBUFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildPreferredBUFilter).toHaveBeenCalled();
    expect(mockFilter.field).toEqual(businessUnitFilter.field);
  });
  it ('should build status filter', () => {
    const mockFilter = new ElasticFilter('Status', 'personDTO.status', event =>
        driverManagementservice.searchForColumn(event.query, 'personDTO.status'));
    const statusfilter = component.buildPreferredStatusFilter();
        statusfilter.searchMethod(event => driverManagementservice.searchForColumn(event.query, 'personDTO.status'));
    spyOn(component, 'buildPreferredStatusFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildPreferredStatusFilter).toHaveBeenCalled();
    expect(mockFilter.field).toEqual(statusfilter.field);
  });
});
