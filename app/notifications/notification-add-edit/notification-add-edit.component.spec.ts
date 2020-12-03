import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/components/common/messageservice';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { of, throwError, Observable } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.module';
import {
  NotificationCategory,
  NotificationCriterion,
  NotificationPerson,
  NotificationSubcategory,
  NotificationSubscription,
  NotificationType,
  SubscriptionCriteria,
  SubscriptionDetail
} from '../notifications.model';
import { NotificationsService } from '../notifications.service';
import { NotificationAddEditComponent } from './notification-add-edit.component';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import * as notificationActions from '../state/notification.actions';

describe('NotificationAddEditComponent', () => {
  let component: NotificationAddEditComponent;
  let fixture: ComponentFixture<NotificationAddEditComponent>;
  let notificationService: NotificationsService;
  let messageService: MessageService;
  let confirmationService: ConfirmationService;
  let route: ActivatedRoute;
  let router: Router;
  let store: MockStore<{
    notificationState: {
      selectedNotification: NotificationSubscription;
      error: string;
      loading: boolean;
    };
  }>;

  const categories: NotificationCategory[] = [
    new NotificationCategory('catCode', 'Account')
  ];
  const subcategories: NotificationSubcategory[] = [
    new NotificationSubcategory('subCode', 'Commitment')
  ];
  const types: NotificationType[] = [
    new NotificationType(1, 'Commitment Expiration', false)
  ];
  const criteria: NotificationCriterion[] = [
    new NotificationCriterion(1, 'Days Till Expiration', 'general'),
    new NotificationCriterion(
      2,
      'Weeks From Latest Active Effective Date',
      'general'
    )
  ];
  const internalContacts: NotificationPerson[] = [
    new NotificationPerson(
      '1',
      'Robert',
      'Bob',
      'Olah',
      'Bob.olah@jbhunt.com',
      '1234567890',
      'Stuff Doer',
      null
    )
  ];
  const externalContacts: NotificationPerson[] = [
    new NotificationPerson(
      '2',
      'Dathaniel',
      'Dathan',
      'Deckard',
      'DoubleD@Dimbles.com',
      '0987654321',
      'Doubter',
      null
    )
  ];
  const criteriaValues: string[] = ['a', 'handful', 'of', 'criteria', 'values'];
  const subCritiera: SubscriptionCriteria[] = [
    {
      code: 'Days Till Expiration',
      values: [{ id: '1', details: null }]
    },
    {
      code: 'Weeks From Latest Active Effective Date',
      values: [{ id: '2', details: null }]
    }
  ];
  const subscription: NotificationSubscription = new NotificationSubscription();
  const initialState = {
    notificationState: {
      selectedNotification: null,
      error: '',
      loading: false
    }
  };
  beforeEach(async(() => {
    subscription.types = ['One', 'Two'];
    subscription.subscribers = [];
    messageService = jasmine.createSpyObj({
      add: null
    });
    TestBed.configureTestingModule({
      declarations: [NotificationAddEditComponent],
      imports: [
        AccordionModule,
        AutoCompleteModule,
        ButtonModule,
        CheckboxModule,
        NoopAnimationsModule,
        MessageModule,
        PanelModule,
        ReactiveFormsModule,
        SharedModule,
        TableModule,
        RouterTestingModule,
        HttpClientTestingModule,
        ProgressSpinnerModule
      ],
      providers: [
        NotificationsService,
        FormBuilder,
        ConfirmationService,
        {
          provide: MessageService,
          useValue: messageService
        },
        provideMockStore({ initialState })
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationAddEditComponent);
    component = fixture.componentInstance;
    route = TestBed.get(ActivatedRoute);
    router = TestBed.get(Router);
    notificationService = TestBed.get(NotificationsService);
    confirmationService = TestBed.get(ConfirmationService);
    store = TestBed.get(Store);
    store.setState(initialState);
    spyOn(notificationService, 'getCategories').and.returnValue(of(categories));
    spyOn(notificationService, 'getSubcategories').and.returnValue(
      of(subcategories)
    );
    spyOn(notificationService, 'getTypes').and.returnValue(of(types));
    spyOn(notificationService, 'getCriteria').and.returnValue(of(criteria));
    spyOn(notificationService, 'getInternalContacts').and.returnValue(
      of(internalContacts)
    );
    spyOn(notificationService, 'getExternalContacts').and.returnValue(
      of(externalContacts)
    );
    spyOn(notificationService, 'getNotificationDetails').and.returnValue(
      of(subscription)
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(notificationService.getCategories).toHaveBeenCalledTimes(1);
  });

  it('should suggest categories', () => {
    component.categories = [
      { code: 'ab', description: 'ab' },
      { code: 'bc', description: 'bc' },
      { code: 'cd', description: 'cd' }
    ];
    component.suggestCategories({ query: 'b' });
    expect(component.categorySuggestions).toContain({
      code: 'ab',
      description: 'ab'
    });
    expect(component.categorySuggestions).toContain({
      code: 'bc',
      description: 'bc'
    });
    expect(component.categorySuggestions).not.toContain({
      code: 'cd',
      description: 'cd'
    });
  });

  it('should get subcategories when category is selected', fakeAsync(() => {
    selectCategory('test');
    component.categorySelected();
    tick();
    expect(notificationService.getSubcategories).toHaveBeenCalledWith('test');
  }));

  it('should suggest subcategories if category has been selected', () => {
    selectCategory('testCat');
    component.subcategories = [
      { code: 'ab', description: 'ab' },
      { code: 'bc', description: 'bc' },
      { code: 'cd', description: 'cd' }
    ];
    component.suggestSubcategories({ query: 'b' });
    expect(component.subcategorySuggestions).toContain({
      code: 'ab',
      description: 'ab'
    });
    expect(component.subcategorySuggestions).toContain({
      code: 'bc',
      description: 'bc'
    });
    expect(component.subcategorySuggestions).not.toContain({
      code: 'cd',
      description: 'cd'
    });
  });

  it('should not suggest subcategories if category has not been selected', () => {
    component.subcategories = [
      { code: 'ab', description: 'ab' },
      { code: 'bc', description: 'bc' },
      { code: 'cd', description: 'cd' }
    ];
    component.suggestSubcategories({ query: 'b' });
    expect(component.subcategorySuggestions).toEqual([]);
    expect(component.formNotification.get('category').valid).toBeFalsy();
  });

  it('should get types and criteria when subcategory is selected', fakeAsync(() => {
    selectCategory('Account');
    selectSubcategory('Commitment');
    component.subcategorySelected();
    tick();
    expect(notificationService.getTypes).toHaveBeenCalledWith(
      'Account',
      'Commitment'
    );
    expect(notificationService.getCriteria).toHaveBeenCalledWith(
      'Account',
      'Commitment'
    );
  }));

  it(`should suggest types that haven't already been selected`, () => {
    selectCategory('test');
    selectSubcategory('subtest');
    const type1 = { id: 1, name: 'typeA', internalOnly: true };
    const type2 = { id: 2, name: 'typeB', internalOnly: false };
    const type3 = { id: 3, name: 'Aepyt', internalOnly: true };
    const type4 = { id: 4, name: 'Bepyt', internalOnly: false };
    component.types = [type1, type2, type3, type4];
    component.formTypes = [type2];
    component.suggestTypes({ query: 'type' });
    expect(component.typeSuggestions).toContain(type1);
    expect(component.typeSuggestions).not.toContain(type2);
    expect(component.typeSuggestions).not.toContain(type3);
    expect(component.typeSuggestions).not.toContain(type4);
  });

  it(`should not suggest types if category or subcategory haven't been selected`, () => {
    const type1 = { id: 1, name: 'typeA', internalOnly: true };
    const type2 = { id: 2, name: 'typeB', internalOnly: false };
    const type3 = { id: 3, name: 'Aepyt', internalOnly: true };
    const type4 = { id: 4, name: 'Bepyt', internalOnly: false };
    component.types = [type1, type2, type3, type4];
    component.formTypes = [type2];
    component.suggestTypes({ query: 'type' });
    expect(component.typeSuggestions).toEqual([]);
    expect(component.formNotification.get('category').valid).toBeFalsy();
    expect(component.formNotification.get('subcategory').valid).toBeFalsy();
  });

  it('should sort criteria into the form', () => {
    component.criteria = [
      new NotificationCriterion(1, 'Size', 'general'),
      new NotificationCriterion(2, 'Old Size', null),
      new NotificationCriterion(3, 'Length', 'general'),
      new NotificationCriterion(4, 'Coordinates', 'location')
    ];
    component.sortCriteria();
    expect(component.formCriteria.contains('general')).toBeTruthy();
    expect(component.formCriteria.contains('location')).toBeTruthy();
    expect(
      (component.formCriteria.get('general') as FormGroup).contains('Size')
    ).toBeTruthy();
    expect(
      (component.formCriteria.get('general') as FormGroup).contains('Length')
    ).toBeTruthy();
    expect(
      (component.formCriteria.get('general') as FormGroup).contains('Old Size')
    ).not.toBeTruthy();
    expect(
      (component.formCriteria.get('location') as FormGroup).contains(
        'Coordinates'
      )
    ).toBeTruthy();
  });

  it('should get accurate contact dropdown options', () => {
    expect(component.contactDropdownOptions.length).toBe(2);
    expect(component.contactDropdownOptions).toContain('External');
    component.formTypes = [new NotificationType(1, 'test', true)];
    expect(component.contactDropdownOptions.length).toBe(1);
    expect(component.contactDropdownOptions).not.toContain('External');
  });

  it('should add a new contact', () => {
    selectCategory('test');
    selectSubcategory('subtest');
    component.formTypes = [new NotificationType(1, 'testType', false)];
    expect(component.formContacts.length).toBe(0);
    component.newContact();
    expect(component.formContacts.length).toBe(1);
    expect(component.formContacts.at(0).get('contactType')).not.toBeUndefined();
    expect(component.contacts$.length).toBe(1);
  });

  it('should call different services based on contact type', () => {
    selectCategory('test');
    selectSubcategory('subtest');
    component.formTypes = [new NotificationType(1, 'testType', false)];
    component.newContact();
    component.contactTypeChange('Internal', 0);
    component.suggestContacts({ query: 'Bo' }, 0);
    expect(notificationService.getInternalContacts).toHaveBeenCalled();
    expect(component.contactSuggestions.length).toBe(1);
    expect(component.contactSuggestions[0][0].id).toEqual('1');
    component.contactTypeChange('External', 0);
    component.suggestContacts({ query: 'Da' }, 0);
    expect(notificationService.getExternalContacts).toHaveBeenCalled();
    expect(component.contactSuggestions.length).toBe(1);
    expect(component.contactSuggestions[0][0].id).toEqual('2');
  });

  it('should not create a new contact if types are invalid', () => {
    expect(component.formContacts.length).toBe(0);
    component.newContact();
    expect(component.formContacts.length).toBe(0);
    expect(component.formNotification.get('types').touched).toBeTruthy();
  });

  it('should initialize form when browsed to for editing', () => {
    spyOnProperty(route, 'paramMap', 'get').and.returnValue(
      of(convertToParamMap({ id: 1 }))
    );
    const setState = spyOn(store, 'dispatch')
      .withArgs(new notificationActions.LoadSelectedNotificaiton(1))
      .and.callFake(() => {});
    component.ngOnInit();
    expect(setState).toHaveBeenCalled();
    expect(component.editing).toBeTruthy();
  });

  it('should populate the form in edit', () => {
    spyOnProperty(route, 'paramMap', 'get').and.returnValue(
      of(convertToParamMap({ id: 1 }))
    );
    component.ngOnInit();
    const subscriber: SubscriptionDetail = new SubscriptionDetail();
    subscriber.person = internalContacts[0];
    subscriber.deliveryMethods = [];
    subscription.category = 'Account';
    subscription.subcategory = 'Commitment';
    subscription.types = ['Commitment Expiration'];
    subscription.subscribers = [subscriber];
    store.setState({
      notificationState: {
        selectedNotification: subscription,
        error: '',
        loading: true
      }
    });
    expect(notificationService.getSubcategories).toHaveBeenCalledWith(
      'Account'
    );
    expect(notificationService.getTypes).toHaveBeenCalledWith(
      'Account',
      'Commitment'
    );
    expect(notificationService.getCriteria).toHaveBeenCalledWith(
      'Account',
      'Commitment'
    );
    expect(component.selectedCategory).toEqual(categories[0]);
    expect(component.selectedSubcategory).toEqual(subcategories[0]);
    expect(component.formTypes.length).toEqual(1);
    expect(component.formContacts.value).toEqual([
      {
        contactType: null,
        contact: internalContacts[0],
        inApp: false,
        email: false,
        mobile: false
      }
    ]);
    expect(component.loading).toBeFalsy();
  });

  it('should confirm changes in edit mode', () => {
    const confirmSpy = spyOn(confirmationService, 'confirm').and.returnValue(
      null
    );
    component.editing = true;
    component.categorySelected();
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should ignore nonexistant keys when resetting the form', () => {
    let error;
    try {
      component.resetFormThings('foobar');
    } catch (err) {
      error = err;
    }
    expect(error).toBeUndefined();
  });

  it('should remove contact controls that are not internal when an internal only type is selected', () => {
    component.buildNewContact('Internal', emptyPerson(), true, false, false);
    component.buildNewContact('External', emptyPerson(), true, false, false);
    component.criteria = criteria;
    component.sortCriteria();
    expect(component.formContacts.length).toBe(2);
    component.formTypes = [
      { id: 1234, name: 'Commitment Expiration', internalOnly: true }
    ];
    component.typeSelected({ name: 'Commitment Expiration' });
    expect(component.formContacts.length).toBe(1);
    expect(component.formContacts.at(0).get('contactType').value).toEqual(
      'Internal'
    );
  });

  it('should indicate when a criteria may have more than one value', () => {
    expect(component.isMultiValue('Business Unit')).toBeFalsy();
    expect(component.isMultiValue('Days Till Expiration')).toBeFalsy();
    expect(component.isMultiValue('Trading Partner')).toBeTruthy();
    expect(component.isMultiValue(`This definitely isn't a thing`)).toBeFalsy();
  });

  it('should indicate when a criteria is a typeAhead', () => {
    expect(component.isATypeahead('Business Unit')).toBeTruthy();
    expect(component.isATypeahead('Days Till Expiration')).toBeFalsy();
    expect(component.isATypeahead(`This definitely isn't a thing`)).toBeFalsy();
  });

  it('should indicate when a criteria is a dropdown', () => {
    expect(component.isADropdown('Business Unit')).toBeTruthy();
    expect(component.isADropdown('')).toBeTruthy();
    expect(component.isADropdown('Trading Partner')).toBeFalsy();
    expect(component.isADropdown(`This definitely isn't a thing`)).toBeTruthy();
  });

  it('should remove required criteria validators when a type is removed', () => {
    component.formTypes = [
      { id: 1234, name: 'Commitment Expiration', internalOnly: true },
      { id: 123, name: 'Commitment Review', internalOnly: true }
    ];
    component.criteria = criteria;
    component.sortCriteria();
    selectCategory('Account');
    selectSubcategory('Commitment');
    expect(Array.from(component.getRequiredFields())).toEqual([
      'Days Till Expiration',
      'Weeks From Latest Active Effective Date'
    ]);
    component.formTypes = [component.formTypes[0]];
    component.resetCriteriaValidators({ name: 'Commitment Review' });
    expect(Array.from(component.getRequiredFields())).toEqual([
      'Days Till Expiration'
    ]);
  });

  it('should return the default validators for a given criteria', () => {
    expect(component.getCriteriaTypeValidators('Bill To')).toEqual([]);
    expect(
      component.getCriteriaTypeValidators('Days Till Expiration').length
    ).toEqual(2);
  });

  it('suggest criteria values for type ahead', () => {
    const mockCriteria = criteria.slice();
    mockCriteria.push(
      new NotificationCriterion(10, 'Corporate Account', 'general')
    );
    component.criteria = mockCriteria;
    component.sortCriteria();
    spyOn(notificationService, 'fetchCriteriaValues').and.returnValue(
      of([
        {
          key: 'test',
          Level: {
            hits: {
              hits: [
                {
                  _id: 10
                }
              ]
            }
          }
        }
      ])
    );
    component.suggestCriteriaValues(
      { query: 'test' },
      mockCriteria[2].description
    );
    expect(component.suggestions[`${mockCriteria[2].description}`]).toEqual([
      { label: 'test', value: 10 }
    ]);
  });

  it('should initialize criteria', () => {
    component.criteria = criteria;
    component.sortCriteria();
    component.initCriteria(subCritiera);
    expect(component.formCriteria.value).toEqual({
      general: {
        'Days Till Expiration': '1',
        'Weeks From Latest Active Effective Date': '2'
      }
    });
  });

  it('should touch all the criteria forms', () => {
    component.criteria = criteria;
    component.sortCriteria();
    component.touchAllCriteriaFields();
    component.criteria.forEach(criterion => {
      expect(
        component.formCriteria
          .get(criterion.classification)
          .get(criterion.description).touched
      ).toBeTruthy();
    });
  });

  it('should get all errors on criterion that has been touched', () => {
    component.criteria = criteria;
    component.sortCriteria();
    const testCriterion = component.formCriteria
      .get(criteria[0].classification)
      .get(criteria[0].description);
    testCriterion.markAsTouched();
    testCriterion.setErrors({ required: true });
    expect(
      component.getErrorsArray(
        criteria[0].description,
        criteria[0].classification
      )
    ).toEqual(['required']);
    expect(
      component.getErrorsArray(
        criteria[1].description,
        criteria[1].classification
      )
    ).toBeUndefined();
  });

  it('should save the form add', () => {
    spyOnProperty(component.formNotification, 'valid', 'get').and.returnValue(
      true
    );
    const mockResponse = { userNotificationSubscriptionID: 1512 };
    spyOn(notificationService, 'sendNotificationRequest').and.returnValue(
      of(mockResponse)
    );
    const routerSpy = spyOn(router, 'navigateByUrl');
    component.criteria = criteria;
    component.sortCriteria();
    component.formNotification.markAsTouched();
    component.formNotification.markAsDirty();
    component.saveForm();
    expect(component.formNotification.pristine).toBeTruthy();
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Notification Created',
      detail: 'Subscribed Successfully'
    });
    expect(routerSpy).toHaveBeenCalledWith(`/notifications/${mockResponse.userNotificationSubscriptionID}`);
  });

  it('should save the form edit', () => {
    spyOnProperty(component.formNotification, 'valid', 'get').and.returnValue(
      true
    );
    const mockResponse = { userNotificationSubscriptionID: 1512 };
    spyOn(notificationService, 'sendNotificationRequest').and.returnValue(
      of(mockResponse)
    );
    const routerSpy = spyOn(router, 'navigateByUrl');
    component.notification = {
      id: 10,
      category: 'mockCat',
      subcategory: 'subCat',
      types: ['mockType'],
      domain: 'test',
      criteria: [],
      creator: null,
      lastUpdater: null,
      lastUpdateDateTime: null,
      creationDateTime: null,
      subscribers: null,
      status: 'active'
    };
    component.editing = true;
    component.criteria = criteria;
    component.sortCriteria();
    component.formNotification.markAsTouched();
    component.formNotification.markAsDirty();
    component.saveForm();
    expect(component.formNotification.pristine).toBeTruthy();
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Notification Created',
      detail: 'Subscribed Successfully'
    });
    expect(routerSpy).toHaveBeenCalledWith(`/notifications/${mockResponse.userNotificationSubscriptionID}`);
  });

  it('should return message that nothing has changed on save', () => {
    component.saveForm();
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'No Changes',
      detail: 'Nothing has been changed that needs saving.'
    });
  });

  it('should return invalid form when form is touched and invalid', () => {
    component.formNotification.markAsDirty();
    component.criteria = criteria;
    component.sortCriteria();
    component.saveForm();
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Invalid Form',
      detail:
        'Notification Category is required, Notification Subcategory is required, Notification type is required'
    });
  });

  it('should return error message if there was an http error', () => {
    spyOnProperty(component.formNotification, 'valid', 'get').and.returnValue(
      true
    );
    spyOn(notificationService, 'sendNotificationRequest').and.returnValue(
      throwError(new HttpErrorResponse({}))
    );
    component.criteria = criteria;
    component.sortCriteria();
    component.formNotification.markAsTouched();
    component.formNotification.markAsDirty();
    component.saveForm();
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error Saving Notifications',
      detail: 'Notification Subscription service is currently unavailable'
    });
  });

  it('should return error message if there was an http error with body', () => {
    spyOnProperty(component.formNotification, 'valid', 'get').and.returnValue(
      true
    );
    spyOn(notificationService, 'sendNotificationRequest').and.returnValue(
      throwError(
        new HttpErrorResponse({
          error: {
            errors: [
              {
                errorMessage: 'SQL Error'
              },
              {
                errorMessage: 'help'
              }
            ]
          }
        })
      )
    );
    component.criteria = criteria;
    component.sortCriteria();
    component.formNotification.markAsTouched();
    component.formNotification.markAsDirty();
    component.saveForm();
    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error Saving Notifications',
      detail: 'SQL Error, help'
    });
  });

  it('should navigate away from page and form is not dirty', () => {
    const resetSpy = spyOn(
      component.formNotification,
      'reset'
    ).and.callThrough();
    expect(component.canDeactivate()).toBeTruthy();
    expect(resetSpy).toHaveBeenCalled();
  });

  it('should confirmation message accepted on deactivate and form is dirty', () => {
    const resetSpy = spyOn(
      component.formNotification,
      'reset'
    ).and.callThrough();
    const routerSpy = spyOn(router, 'navigate');
    spyOn(confirmationService, 'confirm').and.callFake((params: any) =>
      params.accept()
    );
    component.formNotification.markAsDirty();
    component.canDeactivate();
    expect(resetSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: route });
  });

  it('should route to notifications from edit when canceled', () => {
    const routerSpy = spyOn(router, 'navigate');
    component.editing = true;
    component.onCancel();
    expect(routerSpy).toHaveBeenCalledWith(['../../'], { relativeTo: route });
  });

  it('should open invalid accordion tab', () => {
    component.criteria = criteria;
    component.sortCriteria();
    fixture.detectChanges();
    component.formCriteria
      .get(criteria[0].classification)
      .setErrors([{ required: true }]);
    component.formCriteria.updateValueAndValidity();
    expect(component.accordion.tabs[0].selected).toBeFalsy();
    component.openInvalidAccordionTabs();
    expect(component.accordion.tabs[0].selected).toBeTruthy();
  });

  it('should do nothing if there are no validators for criterion type', () => {
    const mockCriteria = criteria.slice();
    mockCriteria.push(
      new NotificationCriterion(10, 'Operational Plan Type', 'general')
    );
    component.criteria = mockCriteria;
    component.sortCriteria();
    component.setCriteriaValidators();
    expect(component.formCriteria.get('general').get('Operational Plan Type').validator).toBeNull();
    expect(component.formCriteria.get('general').get('Days Till Expiration').validator).toBeDefined();
  });

  it('should do nothing if there is no criterion type found', () => {
    const mockCriteria = criteria.slice();
    mockCriteria.push(
      new NotificationCriterion(10, 'Does not exist', 'general')
    );
    component.criteria = mockCriteria;
    component.sortCriteria();
    component.setCriteriaValidators();
    expect(component.formCriteria.get('general').get('Does not exist').validator).toBeNull();
    expect(component.formCriteria.get('general').get('Days Till Expiration').validator).toBeDefined();
  });

  function emptyPerson(): NotificationPerson {
    return new NotificationPerson(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
  }

  function selectCategory(code: string, desc?: string) {
    const cat: NotificationCategory = new NotificationCategory(
      code,
      desc || code
    );
    selectAThing('category', cat);
  }

  function selectSubcategory(code: string, desc?: string) {
    const subcat: NotificationSubcategory = new NotificationSubcategory(
      code,
      desc || code
    );
    selectAThing('subcategory', subcat);
  }

  function selectAThing(thing: string, value: any) {
    const control = component.formNotification.get(thing);
    control.setValue(value);
    control.markAsTouched();
    control.updateValueAndValidity();
    component.formNotification.setControl(thing, control);
  }
});
