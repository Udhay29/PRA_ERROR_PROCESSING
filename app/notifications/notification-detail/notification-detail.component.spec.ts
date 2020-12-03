import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationDetailComponent } from './notification-detail.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store } from '@ngrx/store';
import {
  NotificationSubscription,
  SubscriptionDetail
} from '../notifications.model';
import { Router, ActivatedRoute } from '@angular/router';
import * as actions from '../state/notification.actions';
import { ConfirmationService } from 'primeng/api';
import { NotificationsService } from '../notifications.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { componentNeedsResolution } from '@angular/core/src/metadata/resource_loading';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { strict } from 'assert';

describe('NotificationDetailComponent', () => {
  let component: NotificationDetailComponent;
  let fixture: ComponentFixture<NotificationDetailComponent>;
  let store: MockStore<{
    notificationState: {
      selectedNotification: NotificationSubscription;
      error: string;
      loading: boolean;
    };
  }>;
  let router: Router;
  let route: ActivatedRoute;
  let confirmationService: ConfirmationService;
  let messageService: MessageService;
  let notificationService: NotificationsService;

  const initialState = {
    notificationState: {
      selectedNotification: null,
      error: '',
      loading: false
    }
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationDetailComponent],
      imports: [
        ProgressSpinnerModule,
        PanelModule,
        TableModule,
        ButtonModule,
        RouterTestingModule,
        NoopAnimationsModule,
        HttpClientTestingModule
      ],
      providers: [
        provideMockStore({
          initialState
        }),
        NotificationsService,
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    store = TestBed.get(Store);
    store.setState(initialState);
    router = TestBed.get(Router);
    route = TestBed.get(ActivatedRoute);
    confirmationService = TestBed.get(ConfirmationService);
    messageService = TestBed.get(MessageService);
    notificationService = TestBed.get(NotificationsService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should unsubscribe form selectedNotification and loading', () => {
    component.ngOnDestroy();
    expect(component.selectedNotification$.closed).toBeTruthy();
    expect(component.loading$.closed).toBeTruthy();
  });

  it('should return true if array contains In-App', () => {
    expect(component.isInApp(['In-App', 'Email'])).toBeTruthy();
  });

  it('should return true if array contains Email', () => {
    expect(component.isEmail(['In-App', 'Email'])).toBeTruthy();
  });

  it('should return false if array does not contain Mobile', () => {
    expect(component.isMobile(['In-App', 'Email'])).toBeFalsy();
  });

  it('should route to edit if edit button is clicked', () => {
    const routerSpy = spyOn(router, 'navigate');
    component.onEditClick();
    expect(routerSpy).toHaveBeenCalledWith(['edit'], { relativeTo: route });
  });

  it('should mapCritera values when there is a notificaiton', () => {
    const mockNotificationSub = new NotificationSubscription();
    mockNotificationSub.criteria = [
      { code: 'Days Till Expiration', values: [{ id: '1', details: null }] },
      {
        code: 'Corporate Account',
        values: [
          {
            id: '17044',
            details: {
              zipCode: '770063634',
              country: 'USA',
              addressLineTwo: '',
              code: 'HIHOCR',
              city: 'Houston',
              name: 'High Fashion Ldcn - Oc OKX',
              addressLineOne: '3100 Travis St',
              id: '17044',
              state: 'TX',
              roleType: 'Bill To'
            }
          }
        ]
      },
      {
        code: 'Order Number',
        values: [{ id: '10', details: null }, { id: '20', details: null }]
      }
    ];
    store.setState({
      notificationState: {
        selectedNotification: mockNotificationSub,
        error: '',
        loading: false
      }
    });
    expect(component.criteria).toEqual([
      {
        title: 'Days Till Expiration',
        value: '1'
      },
      {
        title: 'Corporate Account',
        value: 'High Fashion Ldcn - Oc OKX'
      },
      {
        title: 'Order Number',
        value: '10, 20'
      }
    ]);
  });

  it('should confirm inactivation of a notification and then inactivate', () => {
    component.notification = new NotificationSubscription();
    component.notification.id = 1;
    spyOn(notificationService, 'inactivateSubscription').and.returnValue(
      of('')
    );
    spyOn(confirmationService, 'confirm').and.callFake((params: any) =>
      params.accept()
    );
    const actionSpy = spyOn(store, 'dispatch');
    const messageServiceSpy = spyOn(messageService, 'add');
    const routerSpy = spyOn(router, 'navigate');
    component.onInactivateClick();
    expect(messageServiceSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Inactivate Successful',
      detail: `Successfully inactivated notification subscription 1`
    });
    expect(component.loading).toBeFalsy();
    expect(actionSpy).toHaveBeenCalledWith(new actions.ClearSelectedNotification());
    expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: route });
  });

  it('should handle error on inactivation', () => {
    component.notification = new NotificationSubscription();
    component.notification.id = 1;
    spyOn(notificationService, 'inactivateSubscription').and.returnValue(
      throwError(new HttpErrorResponse({error: 'This is an error.'}))
    );
    spyOn(confirmationService, 'confirm').and.callFake((params: any) =>
      params.accept()
    );
    const messageServiceSpy = spyOn(messageService, 'add');
    component.onInactivateClick();
    expect(messageServiceSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Inactivate Failed',
      detail: 'This is an error.'
    });
    expect(component.loading).toBeFalsy();
  });

  it('should confirm activation of a notification and then activate', () => {
    component.notification = new NotificationSubscription();
    component.notification.id = 1;
    spyOn(notificationService, 'activateSubscription').and.returnValue(of(''));
    spyOn(confirmationService, 'confirm').and.callFake((params: any) =>
      params.accept()
    );
    const actionSpy = spyOn(store, 'dispatch');
    const messageServiceSpy = spyOn(messageService, 'add');
    const routerSpy = spyOn(router, 'navigate');
    component.onActivateClick();
    expect(messageServiceSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Activate Successful',
      detail: `Successfully activated notification subscription 1`
    });
    expect(component.loading).toBeFalsy();
    expect(actionSpy).toHaveBeenCalledWith(new actions.ClearSelectedNotification());
    expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: route });
  });

  it('should handle error on activation', () => {
    component.notification = new NotificationSubscription();
    component.notification.id = 1;
    spyOn(notificationService, 'activateSubscription').and.returnValue(
      throwError(new HttpErrorResponse({error: 'This is an error.'}))
    );
    spyOn(confirmationService, 'confirm').and.callFake((params: any) =>
      params.accept()
    );
    const messageServiceSpy = spyOn(messageService, 'add');
    component.onActivateClick();
    expect(messageServiceSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Activate Failed',
      detail: 'This is an error.'
    });
    expect(component.loading).toBeFalsy();
  });
});
