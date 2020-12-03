import { DriverProfileModule } from './driver-management/driver-profile/driver-profile.module';
import {
  TestBed,
  async,
  ComponentFixture,
  fakeAsync,
  tick
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {
  NavigationMenuModule,
  DefaultNavigationMenuService,
  NAV_MENU_SERVICE
} from 'lib-platform-components';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { GrowlModule } from 'primeng/growl';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import { EmployeesModule } from './employees/employees.module';
import { TaskmanagementModule } from './task-management/task-management.module';
import { TeamManagementModule } from './team-management/team-management.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { Title } from '@angular/platform-browser';
import { UserService, LocalStorageService } from 'lib-platform-services';
import { MessageService } from 'primeng/components/common/messageservice';
import { AppService } from './app.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {DriverManagementModule} from './driver-management/driver-management.module';

describe('AppComponent', () => {
  let router: Router;
  let route: ActivatedRoute;
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let titleService: Title;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NavigationMenuModule,
        BreadcrumbModule,
        GrowlModule,
        ConfirmDialogModule,
        EmployeesModule,
        TaskmanagementModule,
        TeamManagementModule,
        NotificationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        DriverManagementModule,
        DriverProfileModule

      ],
      declarations: [AppComponent, ErrorComponent],
      providers: [
        UserService,
        LocalStorageService,
        MessageService,
        Title,
        AppService,
        {
          provide: ActivatedRoute,
          useValue: {
            firstChild: {
              snapshot: {
                data: {
                  title: ''
                }
              }
            }
          }
        },
        {
          provide: NAV_MENU_SERVICE,
          useClass: DefaultNavigationMenuService
        },
        ConfirmationService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    titleService = TestBed.get(Title);
    router = TestBed.get(Router);
    route = TestBed.get(ActivatedRoute);
    component = fixture.debugElement.componentInstance;
    router.initialNavigation();
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should set the application title when a route contains title data', fakeAsync(() => {
    route.firstChild.snapshot.data.title = 'A Title';
    const titleServiceSpy = spyOn(titleService, 'setTitle');
    router.navigate(['/a-route']);
    tick();
    expect(titleServiceSpy).toHaveBeenCalledWith('A Title');
  }));

  it('should not set the application title when a route does not contain title data', fakeAsync(() => {
    route.firstChild.snapshot.data.title = undefined;
    const titleSetSpy = spyOn(titleService, 'setTitle');
    spyOn(titleService, 'getTitle').and.returnValue('Old Title');
    router.navigate(['/a-route']);
    tick();
    expect(titleSetSpy).toHaveBeenCalledWith('Old Title');
  }));
});
