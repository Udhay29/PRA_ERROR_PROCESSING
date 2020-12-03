import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { NotificationsService } from './notifications.service';
import { of } from 'rxjs';
import { SharedModule } from '../shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationSubscription } from './notifications.model';
import { NotificationMocks } from 'src/mocks/notifications.mocks';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from 'lib-platform-services';
import { ElasticFilter } from '../shared/filter-panel/filter/filter.model';
import { Router, ActivatedRoute } from '@angular/router';

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let notificationsServiceSpy: NotificationsService;
  let searchReturnObject: NotificationSubscription[];
  let userServiceMock: UserService;
  let router: Router;
  let route: ActivatedRoute;

  beforeEach(async(() => {
    userServiceMock = jasmine.createSpyObj<UserService>({
      load: of({})
    });
    searchReturnObject = [];
    notificationsServiceSpy = jasmine.createSpyObj<NotificationsService>({
      searchForNotifications: of(searchReturnObject),
      buildFilters: [new ElasticFilter('mock', 'mock', () => of(['mock']))]
    });

    TestBed.configureTestingModule({
      declarations: [NotificationsComponent],
      imports: [NoopAnimationsModule, RouterTestingModule, SharedModule],
      providers: [
        {
          provide: NotificationsService,
          useValue: notificationsServiceSpy
        },
        {
          provide: UserService,
          useValue: userServiceMock
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.get(Router);
    route = TestBed.get(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the list of notifications on init', () => {
    expect(notificationsServiceSpy.searchForNotifications).toHaveBeenCalled();
  });

  it('should handle and return an empty list when mapping notifications', () => {
    const mappedColumns = component.mapNotificationsForColumns([]);
    expect(mappedColumns.length).toBe(0);
  });

  it('should map columns to look right on the table', () => {
    const mappedColumns = component.mapNotificationsForColumns([
      NotificationMocks.subscription(1)
    ]);
    expect(mappedColumns.length).toBe(1);
    expect(mappedColumns[0].criteria instanceof Array);
  });

  it('should set page variables and load notifications on page change', next => {
    component.onSearch$.subscribe(() => {
      next();
    });
    component.onPageChange({ rows: 11, first: 12 });
    expect(component.tableSize).toBe(11);
    expect(component.firstRecord).toBe(12);
  });

  it('should convert criteria even without details when necessary', () => {
    const critCode: string = 'TestCriter';
    const critId: string = 'id1';
    const criteria = NotificationMocks.criteria(critCode, critId, null);
    const critStrings = component.convertCriteriaToString([criteria]);
    expect(critStrings).toMatch(critCode);
  });

  it('should call next on search with event', () => {
    component.onSearch$.subscribe(event =>
      expect(event).toEqual(new Event('onSearch'))
    );
    component.firstRecord = 100;
    component.onSearch(new Event('onSearch'));
    expect(component.firstRecord).toEqual(0);
    expect(component.mostRecentSearch).toEqual(new Event('onSearch'));
  });

  it('should set active filters to the filters passed in and call onSearch with the most resent search', () => {
    const mockFilters = [
      new ElasticFilter('mockFilter', 'mockFilter', () => of(['mockResult']))
    ];
    component.mostRecentSearch = new Event('onSearch');
    component.onSearch$.subscribe(search =>
      expect(search).toEqual(new Event('onSearch'))
    );
    component.onFilter(mockFilters);
    expect(component.activeFilters).toEqual(mockFilters);
  });

  it('should navigate to add on button click', () => {
    const routerSpy = spyOn(router, 'navigate');
    component.addNewNotification();
    expect(routerSpy).toHaveBeenCalledWith(['add/'], { relativeTo: route });
  });

  it('should navigate to deatils on row select', () => {
    const routerSpy = spyOn(router, 'navigate');
    component.rowSelected({id: 1});
    expect(routerSpy).toHaveBeenCalledWith([1], { relativeTo: route });
  });

  it('should set selected notification to the value selected', () => {
    component.checkboxConfig.checkboxCallback([new NotificationSubscription()]);
    expect(component.selectedNotifications).toEqual([new NotificationSubscription()]);
  });
});
