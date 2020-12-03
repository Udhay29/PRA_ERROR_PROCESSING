import { TestBed } from '@angular/core/testing';
import {
  NotificationsService,
  NotificationSearchResult
} from './notifications.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { NotificationSource } from './notifications.dto';
import {
  NotificationSubscription,
  NotificationCategory,
  NotificationSubcategory,
  NotificationType,
  NotificationCriterion,
  NotificationPerson
} from './notifications.model';
import { ElasticResult } from '../shared/elastic.dto';
import { NotificationMocks } from 'src/mocks/notifications.mocks';
import {
  EmployeesService,
  EmployeeSearchResult
} from '../employees/employees.service';
import { of } from 'rxjs';
import { ElasticService, NestedField } from '../shared/elastic.service';
import { Employee } from '../employees/employees.model';
import {
  NotificationCriteriaType,
  NotificationCriteriaTypeService,
  HTTPMethod
} from './notification-add-edit/notification-criteria-types';
import { FormControl } from '@angular/forms';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let testBackend: HttpTestingController;
  let mockEmployeesService: EmployeesService;
  const searchForUsersResponse: EmployeeSearchResult = {
    hitCount: 1,
    employees: [new Employee()]
  };
  let elasticService: ElasticService;

  beforeEach(() => {
    mockEmployeesService = jasmine.createSpyObj({
      searchForUsers: of(searchForUsersResponse)
    });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        NotificationsService,
        {
          provide: EmployeesService,
          useValue: mockEmployeesService
        }
      ]
    });
    testBackend = TestBed.get(HttpTestingController);
    service = TestBed.get(NotificationsService);
    elasticService = TestBed.get(ElasticService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the list of notifications', () => {
    const resultObj: ElasticResult<
      NotificationSource
    > = NotificationMocks.searchResponse(10);
    spyOn(elasticService, 'search').and.returnValue(of(resultObj));
    service
      .searchForNotifications()
      .subscribe((ret: NotificationSearchResult) => {
        expect(ret.count).toBe(271);
        expect(ret.notifications.length).toBe(10);
        expect(
          ret.notifications[0] instanceof NotificationSubscription
        ).toBeTruthy();
      });
  });

  it('should get things for different pages', () => {
    const resultObj: ElasticResult<
      NotificationSource
    > = NotificationMocks.searchResponse(10);
    spyOn(elasticService, 'search').and.returnValue(of(resultObj));
    service
      .searchForNotifications('stuff', 51, 50)
      .subscribe((ret: NotificationSearchResult) => {
        expect(
          ret.notifications[0] instanceof NotificationSubscription
        ).toBeTruthy();
      });
  });

  it('should build all the filters and return them', () => {
    expect(service.buildFilters().length).toEqual(9);
  });

  it('should create a Category Filter', () => {
    spyOn(elasticService, 'search').and.returnValue(
      of(
        NotificationMocks.searchResponseSource(
          ['notificationSubscriptionCategory'],
          1
        )
      )
    );
    const actualResult = service.buildCategoryFilter();
    expect(actualResult.field).toEqual('notificationSubscriptionCategory');
    expect(actualResult.name).toEqual('Category');
    actualResult
      .searchMethod(new Event('mockSearch'))
      .subscribe(result => expect(result).toEqual(['Test Category']));
  });

  it('should create a sub category filter', () => {
    spyOn(elasticService, 'search').and.returnValue(
      of(
        NotificationMocks.searchResponseSource(
          ['notificationSubscriptionSubCategory'],
          1
        )
      )
    );
    const actualResult = service.buildSubCategoryFilter();
    expect(actualResult.field).toEqual('notificationSubscriptionSubCategory');
    expect(actualResult.name).toEqual('Sub Category');
    actualResult
      .searchMethod(new Event('mockSearch'))
      .subscribe(result => expect(result).toEqual(['SubCategory of Test']));
  });

  it('should create a type filter', () => {
    const notificationMocks: ElasticResult<
      NotificationSource
    > = NotificationMocks.searchResponseSource(
      ['notificationSubscriptionTypes'],
      2
    );
    notificationMocks.hits.hits[0]._source.notificationSubscriptionTypes = [
      'Mock Type'
    ];
    spyOn(elasticService, 'search').and.returnValue(of(notificationMocks));
    const actualResult = service.buildTypeFilter();
    expect(actualResult.field).toEqual('notificationSubscriptionTypes');
    expect(actualResult.name).toEqual('Type');
    actualResult
      .searchMethod({ query: 'Unified Test Sub Type' })
      .subscribe(result => expect(result).toEqual(['Unified Test Sub Type']));
  });

  it('should create a internal contact filter', () => {
    const contactMock: any = {
      hits: {
        hits: [
          {
            inner_hits: {
              'userNotificationSubscriptionDetails.subscribedPerson': {
                hits: {
                  hits: [
                    {
                      _source: {
                        firstName: 'Seven',
                        preferredName: 'Six',
                        lastName: 'Day',
                        id: 'jisasd1',
                        type: 'Internal'
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    };
    const nestedField: NestedField[] = [
      {
        name: 'userNotificationSubscriptionDetails.subscribedPerson',
        fields: [
          'userNotificationSubscriptionDetails.subscribedPerson.firstName',
          'userNotificationSubscriptionDetails.subscribedPerson.lastName',
          'userNotificationSubscriptionDetails.subscribedPerson.preferredName',
          'userNotificationSubscriptionDetails.subscribedPerson.id',
          'userNotificationSubscriptionDetails.subscribedPerson.contactType',
          'userNotificationSubscriptionDetails.subscribedPerson.type'
        ]
      }
    ];
    spyOn(elasticService, 'searchCustomQuery').and.returnValue(of(contactMock));
    const actualResult = service.buildInternalContactFilter();
    expect(actualResult.field).toEqual(nestedField);
    expect(actualResult.name).toEqual('Internal Contact');
    expect(actualResult.constantTerm).toEqual('Internal');
    actualResult
      .searchMethod({ query: 'Seven' })
      .subscribe(result => expect(result).toEqual(['Six Day (jisasd1)']));
  });

  it('should create an external contact filter', () => {
    const contactMock: any = {
      hits: {
        hits: [
          {
            inner_hits: {
              'userNotificationSubscriptionDetails.subscribedPerson': {
                hits: {
                  hits: [
                    {
                      _source: {
                        firstName: 'Jim',
                        lastName: 'Bean',
                        id: 'jisajb1',
                        type: 'External'
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    };
    const nestedField: NestedField[] = [
      {
        name: 'userNotificationSubscriptionDetails.subscribedPerson',
        fields: [
          'userNotificationSubscriptionDetails.subscribedPerson.firstName',
          'userNotificationSubscriptionDetails.subscribedPerson.lastName',
          'userNotificationSubscriptionDetails.subscribedPerson.preferredName',
          'userNotificationSubscriptionDetails.subscribedPerson.id',
          'userNotificationSubscriptionDetails.subscribedPerson.contactType',
          'userNotificationSubscriptionDetails.subscribedPerson.type'
        ]
      }
    ];
    spyOn(elasticService, 'searchCustomQuery').and.returnValue(of(contactMock));
    const actualResult = service.buildExternalContactFilter();
    expect(actualResult.field).toEqual(nestedField);
    expect(actualResult.name).toEqual('External Contact');
    expect(actualResult.constantTerm).toEqual('External');
    actualResult
      .searchMethod({ query: 'Jim' })
      .subscribe(result => expect(result).toEqual(['Jim Bean (jisajb1)']));
  });

  it('should create a created by filter', () => {
    const notificationMocks: ElasticResult<
      NotificationSource
    > = NotificationMocks.searchResponseSource(['createdBy'], 2);
    notificationMocks.hits.hits[0]._source.createdBy.preferredName = null;
    notificationMocks.hits.hits[0]._source.createdBy.firstName = 'first';
    notificationMocks.hits.hits[0]._source.createdBy.lastName = 'last';
    notificationMocks.hits.hits[0]._source.createdBy.id = 'jisafl1';
    spyOn(elasticService, 'search').and.returnValue(of(notificationMocks));
    const actualResult = service.buildCreatedByFilter();
    expect(actualResult.field).toEqual('createdBy*');
    expect(actualResult.name).toEqual('Created By');
    actualResult
      .searchMethod(new Event('mockSearch'))
      .subscribe(result =>
        expect(result).toEqual([
          'first last (jisafl1)',
          'Brent Nelson (jisabn4)'
        ])
      );
  });

  it('should create a updated by filter', () => {
    const notificationMocks: ElasticResult<
      NotificationSource
    > = NotificationMocks.searchResponseSource(['lastUpdatedBy'], 2);
    notificationMocks.hits.hits[0]._source.lastUpdatedBy.preferredName = null;
    notificationMocks.hits.hits[0]._source.lastUpdatedBy.firstName = 'first';
    notificationMocks.hits.hits[0]._source.lastUpdatedBy.lastName = 'last';
    notificationMocks.hits.hits[0]._source.lastUpdatedBy.id = 'jisafl1';
    spyOn(elasticService, 'search').and.returnValue(of(notificationMocks));
    const actualResult = service.buildLastUpdatedByFilter();
    expect(actualResult.field).toEqual('lastUpdatedBy*');
    expect(actualResult.name).toEqual('Last Updated By');
    actualResult
      .searchMethod(new Event('mockSearch'))
      .subscribe(result =>
        expect(result).toEqual([
          'first last (jisafl1)',
          'Brent Nelson (jisabn4)'
        ])
      );
  });

  it('should create a status filter with active as default option', () => {
    const actualResult = service.buildStatusFilter();
    expect(actualResult.defaultOptionLabelName).toEqual('Active');
  });

  it('should create a criteria filter', () => {
    const notificationMocks: ElasticResult<
      NotificationSource
    > = NotificationMocks.searchResponseSource(
      ['userNotificationSubscriptionCriterias'],
      1
    );
    notificationMocks.hits.hits[0]._source.userNotificationSubscriptionCriterias.push(
      {
        userNotificationSubscriptionParameterCode: 'mockParameterOne',
        userNotificationSubscriptionParameterValues: [
          { id: '1', details: null }
        ]
      }
    );
    notificationMocks.hits.hits[0]._source.userNotificationSubscriptionCriterias.push(
      {
        userNotificationSubscriptionParameterCode: 'mockParameterTwo',
        userNotificationSubscriptionParameterValues: [
          { id: '1', details: { value: 'test' } }
        ]
      }
    );
    spyOn(elasticService, 'search').and.returnValue(of(notificationMocks));
    const mockNestedFields: NestedField[] = [
      {
        name: 'userNotificationSubscriptionCriterias',
        fields: [
          'userNotificationSubscriptionCriterias.userNotificationSubscriptionParameterCode'
        ]
      },
      {
        name:
          'userNotificationSubscriptionCriterias.userNotificationSubscriptionParameterValues',
        fields: [
          'userNotificationSubscriptionCriterias.userNotificationSubscriptionParameterValues.ids',
          'userNotificationSubscriptionCriterias.userNotificationSubscriptionParameterValues.details*'
        ]
      }
    ];
    const actualResult = service.buildCriteriaFilter();
    expect(actualResult.field).toEqual(mockNestedFields);
    expect(actualResult.name).toEqual('Criteria');
    actualResult.searchMethod(new Event('mockSearch')).subscribe(result => {
      return expect(result).toEqual([
        'Trading Partner',
        'Test Trading Partner',
        'Bill To',
        'Test Bill to',
        'mockParameterOne',
        'mockParameterTwo'
      ]);
    });
  });

  it('should get the list of categories', () => {
    const response = {
      _embedded: {
        notificationCategories: [
          {
            notificationCategoryCode: 'Account',
            applicationDomainCode: 'PartLocMDM',
            effectiveTimestamp: '2016-01-01T00:00:00',
            expirationTimestamp: '2199-12-31T23:59:59',
            notificationCategoryDescription: 'Account',
            lastUpdateTimestampString: '2017-06-30T01:56:09.136914',
            _links: {
              self: {
                href:
                  'https://scm-tst.jbhunt.com/admin/adminservices/notificationcategories/Account'
              },
              notificationCategory: {
                href:
                  'https://scm-tst.jbhunt.com/admin/adminservices/notificationcategories/Account'
              },
              notificationSubCategories: {
                href:
                  'https://scm-tst.jbhunt.com/admin/adminservices/notificationcategories/Account/notificationSubCategories'
              },
              notificationTypes: {
                href:
                  'https://scm-tst.jbhunt.com/admin/adminservices/notificationcategories/Account/notificationTypes'
              }
            }
          }
        ]
      }
    };
    service.getCategories().subscribe((resp: NotificationCategory[]) => {
      expect(resp[0].code).toEqual('Account');
      expect(resp[0].description).toEqual('Account');
    });
    testBackend
      .expectOne(environment.urls.notifications.categories)
      .flush(response);
  });

  it('should get the related subcategories', () => {
    const response = [
      {
        notificationSubCategoryCode: 'LoadStatus',
        effectiveTimestamp: '2018-01-01T00:00:00',
        expirationTimestamp: '2199-12-31T23:59:59',
        notificationSubCategoryDescription: 'Load Status',
        notificationCategory: {
          notificationCategoryCode: 'LoadPlanng',
          applicationDomainCode: 'OPEX',
          effectiveTimestamp: '2018-01-01T00:00:00',
          expirationTimestamp: '2199-12-31T23:59:59',
          notificationCategoryDescription: 'Load Planning',
          lastUpdateTimestampString: '2019-01-07T00:07:18.2521531'
        },
        lastUpdateTimestampString: '2019-01-07T00:09:05.2849283'
      }
    ];
    service
      .getSubcategories('testCat')
      .subscribe((resp: NotificationSubcategory[]) => {
        expect(resp[0].code).toEqual('LoadStatus');
        expect(resp[0].description).toEqual('Load Status');
      });
    testBackend
      .expectOne(
        environment.urls.notifications.subcategories +
          '?notificationCategories=testCat'
      )
      .flush(response);
  });

  it('should get related types', () => {
    const response = [
      {
        notificationTypeID: 321,
        notificationTypeName: 'Load plan Assigned',
        notificationDescription: 'Load plan Assigned to a Driver',
        notificationRecipientType: 'Internal Only',
        notificationCategory: 'LoadPlanng',
        notificationSubCategory: 'LoadStatus'
      }
    ];
    service
      .getTypes('Load Planning', 'Load Status')
      .subscribe((resp: NotificationType[]) => {
        expect(resp[0].name).toEqual('Load plan Assigned');
        expect(resp[0].internalOnly).toBeTruthy();
        expect(resp[0].id).toBe(321);
      });
    testBackend
      .expectOne(
        environment.urls.notifications.types +
          '?notificationCategories=Load%20Planning&notificationSubCategories=Load%20Status'
      )
      .flush(response);
  });

  it('should get related criteria', () => {
    const response = [
      {
        notificationParameterID: '2375',
        notificationParameterDescription: 'Business Unit',
        notificationParameterClassification: 'general'
      }
    ];
    service
      .getCriteria('Load Planning', 'Load Status')
      .subscribe((resp: NotificationCriterion[]) => {
        expect(resp[0].id).toBe(2375);
        expect(resp[0].description).toEqual('Business Unit');
        expect(resp[0].classification).toEqual('general');
      });
    testBackend
      .expectOne(
        environment.urls.notifications.criteria +
          '?notificationCategory=Load%20Planning&notificationSubCategory=Load%20Status'
      )
      .flush(response);
  });

  it('should get internal contact options', () => {
    const emp = new Employee();
    emp.emplid = 299327;
    emp.firstName = 'Adam';
    emp.lastName = 'Kesler';
    emp.title = 'James Hardie Class A Driver Local';
    emp.email = 'adam.kesler@jbhunt.com';
    emp.extenstion = '';
    emp.personEmployeeID = '';
    emp.phone = '479-867-5309';
    emp.preferredName = 'Adam';
    emp.userName = 'KESA';
    emp.teams = null;
    emp.scheduleList = null;
    emp.delegations = null;
    emp.roles = null;
    emp.manager = null;
    emp.profilePic = null;
    searchForUsersResponse.employees = [emp];
    service
      .getInternalContacts('Adam')
      .subscribe((contacts: NotificationPerson[]) => {
        expect(contacts[0].firstName).toEqual('Adam');
        expect(contacts[0].lastName).toEqual('Kesler');
        expect(contacts[0].phoneNumber).toEqual('479-867-5309');
        expect(contacts[0].emailAddress).toEqual('adam.kesler@jbhunt.com');
        expect(contacts[0].jobTitle).toEqual(
          'James Hardie Class A Driver Local'
        );
      });
    expect(mockEmployeesService.searchForUsers).toHaveBeenCalledWith('Adam');
  });

  it('should get external contact options', () => {
    const response = {
      took: 23,
      timed_out: false,
      _shards: {
        total: 6,
        successful: 6,
        skipped: 0,
        failed: 0
      },
      hits: {
        total: 267,
        max_score: 1,
        hits: [
          {
            _index: 'masterdata-account-contact-1-2019.02.22',
            _type: 'doc',
            _id: '857284025333442',
            _score: 1,
            _source: {
              Email: 'RUSTY.SHACKLEFORD@POCKETSAND.COM',
              PersonId: 85728,
              PartyId: 40253,
              Address: {
                AddressID: 351493
              },
              TelephoneNumber: '6553271205',
              Name: 'Rusty Shackleford'
            }
          }
        ]
      }
    };
    service
      .getExternalContacts('Rus')
      .subscribe((contacts: NotificationPerson[]) => {
        expect(contacts[0].firstName).toEqual('Rusty');
        expect(contacts[0].lastName).toEqual('Shackleford');
        expect(contacts[0].phoneNumber).toEqual('6553271205');
        expect(contacts[0].emailAddress).toEqual(
          'RUSTY.SHACKLEFORD@POCKETSAND.COM'
        );
      });
    testBackend
      .expectOne(req => {
        return (
          req.method === 'POST' &&
          req.url === environment.urls.notifications.externalContacts &&
          req.body.query.bool.must.query_string.query.includes('Rus')
        );
      })
      .flush(response);
  });

  it('should get notification details', () => {
    const response = {
      subscriptionID: 3509,
      domainCode: null,
      subscriptionDomain: 'OrdMgmnt',
      notificationSubscriptionCategory: 'Order Level',
      notificationSubscriptionSubCategory: 'Order',
      notificationSubscriptionTypes: [
        'Any Delivery On Order Delayed',
        'Any Delivery On Order May be Delay'
      ],
      userNotificationSubscriptionCriterias: [
        {
          userNotificationSubscriptionParameterCode: 'Business Unit',
          userNotificationSubscriptionParameterValues: [
            {
              id: 'JBT',
              details: {
                'Business Unit': 'JBT'
              }
            }
          ]
        }
      ],
      userNotificationSubscriptionDetails: [
        {
          subscribedPerson: {
            id: 'JCNT098',
            firstName: 'Jyothi',
            preferredName: 'Jyothi',
            lastName: 'Asipu',
            emailAddress: 'jyothi.asipu@jbhunt.com',
            subscribedEmailType: null,
            phoneNumber: null,
            jobTitle: 'E&T Contract Worker',
            contactType: 'CWR',
            companyName: null,
            type: 'Internal'
          },
          notificationSubscriptionDeliveryMethodCodes: ['In-App', 'Email']
        }
      ],
      effectiveTimestamp: '2019-05-24T06:58:26',
      expirationTimestamp: '2099-12-31T00:00:00',
      createdBy: {
        id: 'JCNT098',
        firstName: null,
        preferredName: 'Process ID',
        lastName: null,
        emailAddress: null,
        subscribedEmailType: null,
        phoneNumber: null,
        jobTitle: null,
        contactType: null,
        companyName: null,
        type: null
      },
      lastUpdatedBy: {
        id: 'JCNT098',
        firstName: null,
        preferredName: 'Process ID',
        lastName: null,
        emailAddress: null,
        subscribedEmailType: null,
        phoneNumber: null,
        jobTitle: null,
        contactType: null,
        companyName: null,
        type: null
      },
      createdTimestamp: '2019-05-24T06:58:26',
      lastUpdatedTimestamp: '2019-05-24T06:58:26',
      status: 'Active'
    };
    service
      .getNotificationDetails(3509)
      .subscribe((sub: NotificationSubscription) => {
        expect(sub.id).toBe(3509);
        expect(sub.category).toEqual('Order Level');
      });
    testBackend
      .expectOne(environment.urls.notifications.subscriptions + '3509')
      .flush(response);
  });

  it('Should fetch for notification criteria type values GET', () => {
    const typeService: NotificationCriteriaTypeService = {
      destination: 'http://test.com',
      method: HTTPMethod.GET,
      request_body: (input: string) => [],
      response_map: (res: any) => res,
      query_string: () => '?mockQuery'
    };
    service
      .fetchCriteriaValues(typeService, 'mockQuery', new FormControl())
      .subscribe(result => expect(result).toEqual([typeService]));
    const req = testBackend.expectOne('http://test.com?mockQuery');
    expect(req.request.method).toBe('GET');
    req.flush([typeService]);
  });

  it('Should fetch for notification criteria type values POST', () => {
    const typeService: NotificationCriteriaTypeService = {
      destination: 'http://test.com',
      method: HTTPMethod.POST,
      request_body: (input: string) => [],
      response_map: (res: any) => res
    };
    service
      .fetchCriteriaValues(typeService, 'mockQuery', new FormControl())
      .subscribe(result => expect(result).toEqual([typeService]));
    const req = testBackend.expectOne('http://test.com');
    expect(req.request.method).toBe('POST');
    req.flush([typeService]);
  });

  it('should post a notification In-App', () => {
    const notificationObj = {
      category: { code: 'Account', description: 'Account' },
      subcategory: { code: 'Commitment', description: 'Commitment' },
      types: [
        { id: 154, name: 'Commitment Expiration', internalOnly: true },
        { id: 155, name: 'Commitment Review', internalOnly: true }
      ],
      criteria: {
        general: {
          'Associated User': [
            { label: 'Cory Steudeman (JISACSE)', value: '339446' }
          ],
          'Business Unit': '',
          'Days Till Expiration': '10',
          'Service Offering': '',
          'Weeks From Latest Active Effective Date': '5'
        },
        account: {
          'Bill To': '',
          'Corporate Account': '',
          'Line of Business': ''
        },
        location: {
          'Destination Capacity Area': '',
          Origin: '',
          'Origin Capacity Area': ''
        }
      },
      contacts: [
        {
          contactType: 'Internal',
          contact: {
            id: 'JISACSE',
            firstName: 'Cory',
            preferredName: 'Cory',
            lastName: 'Steudeman',
            emailAddress: 'Cory.Steudeman@jbhunt.com',
            jobTitle: 'Associate Software Engineer',
            userName: 'JISACSE'
          },
          inApp: true,
          email: false
        }
      ]
    };

    const criteria: NotificationCriterion[] = [
      { id: 564, description: 'Associated User', classification: 'general' },
      { id: 698, description: 'Bill To', classification: 'account' },
      { id: 561, description: 'Business Unit', classification: 'general' },
      { id: 574, description: 'Corporate Account', classification: 'account' },
      {
        id: 586,
        description: 'Days Till Expiration',
        classification: 'general'
      },
      {
        id: 696,
        description: 'Destination Capacity Area',
        classification: 'location'
      },
      { id: 699, description: 'Line of Business', classification: 'account' },
      { id: 693, description: 'Origin', classification: 'location' },
      {
        id: 584,
        description: 'Origin Capacity Area',
        classification: 'location'
      },
      { id: 576, description: 'Service Offering', classification: 'general' },
      {
        id: 573,
        description: 'Weeks From Latest Active Effective Date',
        classification: 'general'
      }
    ];

    service
      .sendNotificationRequest(notificationObj, criteria, false)
      .subscribe(request => expect(request).toBe(''));

    const req = testBackend.expectOne(environment.urls.notifications.save);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      subscriptionID: null,
      status: null,
      notificationSubscriptionCategory: 'Account',
      notificationSubscriptionSubCategory: 'Commitment',
      notificationSubscriptionTypes: [
        'Commitment Expiration',
        'Commitment Review'
      ],
      userNotificationSubscriptionCriterias: [
        {
          userNotificationSubscriptionParameterCode: 'Associated User',
          userNotificationSubscriptionParameterValues: [
            { id: '339446', details: null }
          ]
        },
        {
          userNotificationSubscriptionParameterCode: 'Days Till Expiration',
          userNotificationSubscriptionParameterValues: [
            { id: '10', details: null }
          ]
        },
        {
          userNotificationSubscriptionParameterCode:
            'Weeks From Latest Active Effective Date',
          userNotificationSubscriptionParameterValues: [
            { id: '5', details: null }
          ]
        }
      ],
      userNotificationSubscriptionDetails: [
        {
          subscribedPerson: {
            id: 'JISACSE',
            firstName: 'Cory',
            preferredName: 'Cory',
            lastName: 'Steudeman',
            emailAddress: 'Cory.Steudeman@jbhunt.com',
            jobTitle: 'Associate Software Engineer',
            type: 'Internal',
            userName: undefined
          },
          notificationSubscriptionDeliveryMethodCodes: ['In-App']
        }
      ]
    });
    req.flush('');
  });

  it('should post a notification Email', () => {
    const notificationObj = {
      category: { code: 'Account', description: 'Account' },
      subcategory: { code: 'Commitment', description: 'Commitment' },
      types: [
        { id: 154, name: 'Commitment Expiration', internalOnly: true },
        { id: 155, name: 'Commitment Review', internalOnly: true }
      ],
      criteria: {
        general: {
          'Associated User': [
            { label: 'Cory Steudeman (JISACSE)', value: '339446' }
          ],
          'Business Unit': '',
          'Days Till Expiration': '10',
          'Service Offering': '',
          'Weeks From Latest Active Effective Date': '5'
        },
        account: {
          'Bill To': '',
          'Corporate Account': '',
          'Line of Business': ''
        },
        location: {
          'Destination Capacity Area': '',
          Origin: '',
          'Origin Capacity Area': ''
        }
      },
      contacts: [
        {
          contactType: 'Internal',
          contact: {
            id: 'JISACSE',
            firstName: 'Cory',
            preferredName: 'Cory',
            lastName: 'Steudeman',
            emailAddress: 'Cory.Steudeman@jbhunt.com',
            jobTitle: 'Associate Software Engineer',
            userName: 'JISACSE',
            phoneNumber: '5',
            companyName: 'blah'
          },
          inApp: false,
          email: true
        }
      ]
    };

    const criteria: NotificationCriterion[] = [
      { id: 564, description: 'Associated User', classification: 'general' },
      { id: 698, description: 'Bill To', classification: 'account' },
      { id: 561, description: 'Business Unit', classification: 'general' },
      { id: 574, description: 'Corporate Account', classification: 'account' },
      {
        id: 586,
        description: 'Days Till Expiration',
        classification: 'general'
      },
      {
        id: 696,
        description: 'Destination Capacity Area',
        classification: 'location'
      },
      { id: 699, description: 'Line of Business', classification: 'account' },
      { id: 693, description: 'Origin', classification: 'location' },
      {
        id: 584,
        description: 'Origin Capacity Area',
        classification: 'location'
      },
      { id: 576, description: 'Service Offering', classification: 'general' },
      {
        id: 573,
        description: 'Weeks From Latest Active Effective Date',
        classification: 'general'
      }
    ];

    service
      .sendNotificationRequest(notificationObj, criteria, false)
      .subscribe(request => expect(request).toBe(''));

    const req = testBackend.expectOne(environment.urls.notifications.save);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      subscriptionID: null,
      status: null,
      notificationSubscriptionCategory: 'Account',
      notificationSubscriptionSubCategory: 'Commitment',
      notificationSubscriptionTypes: [
        'Commitment Expiration',
        'Commitment Review'
      ],
      userNotificationSubscriptionCriterias: [
        {
          userNotificationSubscriptionParameterCode: 'Associated User',
          userNotificationSubscriptionParameterValues: [
            { id: '339446', details: null }
          ]
        },
        {
          userNotificationSubscriptionParameterCode: 'Days Till Expiration',
          userNotificationSubscriptionParameterValues: [
            { id: '10', details: null }
          ]
        },
        {
          userNotificationSubscriptionParameterCode:
            'Weeks From Latest Active Effective Date',
          userNotificationSubscriptionParameterValues: [
            { id: '5', details: null }
          ]
        }
      ],
      userNotificationSubscriptionDetails: [
        {
          subscribedPerson: {
            id: 'JISACSE',
            firstName: 'Cory',
            preferredName: 'Cory',
            lastName: 'Steudeman',
            emailAddress: 'Cory.Steudeman@jbhunt.com',
            jobTitle: 'Associate Software Engineer',
            type: 'Internal',
            userName: undefined,
            phoneNumber: '5',
            companyName: 'blah'
          },
          notificationSubscriptionDeliveryMethodCodes: ['Email']
        }
      ]
    });
    req.flush('');
  });

  it('should put a notification Email', () => {
    const notificationObj = {
      id: '1234',
      status: 'active',
      category: { code: 'Account', description: 'Account' },
      subcategory: { code: 'Commitment', description: 'Commitment' },
      types: [
        { id: 154, name: 'Commitment Expiration', internalOnly: true },
        { id: 155, name: 'Commitment Review', internalOnly: true }
      ],
      criteria: {
        general: {
          'Associated User': [
            { label: 'Cory Steudeman (JISACSE)', value: '339446' }
          ],
          'Business Unit': '',
          'Days Till Expiration': '10',
          'Service Offering': '',
          'Weeks From Latest Active Effective Date': '5'
        },
        account: {
          'Bill To': '',
          'Corporate Account': '',
          'Line of Business': ''
        },
        location: {
          'Destination Capacity Area': '',
          Origin: '',
          'Origin Capacity Area': ''
        }
      },
      contacts: [
        {
          contactType: 'Internal',
          contact: {
            id: 'JISACSE',
            firstName: 'Cory',
            preferredName: 'Cory',
            lastName: 'Steudeman',
            emailAddress: 'Cory.Steudeman@jbhunt.com',
            jobTitle: 'Associate Software Engineer',
            userName: 'JISACSE',
            phoneNumber: '5',
            companyName: 'blah'
          },
          inApp: false,
          email: true
        }
      ]
    };

    const criteria: NotificationCriterion[] = [
      { id: 564, description: 'Associated User', classification: 'general' },
      { id: 698, description: 'Bill To', classification: 'account' },
      { id: 561, description: 'Business Unit', classification: 'general' },
      { id: 574, description: 'Corporate Account', classification: 'account' },
      {
        id: 586,
        description: 'Days Till Expiration',
        classification: 'general'
      },
      {
        id: 696,
        description: 'Destination Capacity Area',
        classification: 'location'
      },
      { id: 699, description: 'Line of Business', classification: 'account' },
      { id: 693, description: 'Origin', classification: 'location' },
      {
        id: 584,
        description: 'Origin Capacity Area',
        classification: 'location'
      },
      { id: 576, description: 'Service Offering', classification: 'general' },
      {
        id: 573,
        description: 'Weeks From Latest Active Effective Date',
        classification: 'general'
      }
    ];

    service
      .sendNotificationRequest(notificationObj, criteria, true)
      .subscribe(request => expect(request).toBe(''));

    const req = testBackend.expectOne(environment.urls.notifications.save);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({
      subscriptionID: '1234',
      status: 'active',
      notificationSubscriptionCategory: 'Account',
      notificationSubscriptionSubCategory: 'Commitment',
      notificationSubscriptionTypes: [
        'Commitment Expiration',
        'Commitment Review'
      ],
      userNotificationSubscriptionCriterias: [
        {
          userNotificationSubscriptionParameterCode: 'Associated User',
          userNotificationSubscriptionParameterValues: [
            { id: '339446', details: null }
          ]
        },
        {
          userNotificationSubscriptionParameterCode: 'Days Till Expiration',
          userNotificationSubscriptionParameterValues: [
            { id: '10', details: null }
          ]
        },
        {
          userNotificationSubscriptionParameterCode:
            'Weeks From Latest Active Effective Date',
          userNotificationSubscriptionParameterValues: [
            { id: '5', details: null }
          ]
        }
      ],
      userNotificationSubscriptionDetails: [
        {
          subscribedPerson: {
            id: 'JISACSE',
            firstName: 'Cory',
            preferredName: 'Cory',
            lastName: 'Steudeman',
            emailAddress: 'Cory.Steudeman@jbhunt.com',
            jobTitle: 'Associate Software Engineer',
            type: 'Internal',
            userName: undefined,
            phoneNumber: '5',
            companyName: 'blah'
          },
          notificationSubscriptionDeliveryMethodCodes: ['Email']
        }
      ]
    });
    req.flush('');
  });

  it('should inactivate a subscription', () => {
    service.inactivateSubscription(1).subscribe(result => {
      expect(result).toEqual('');
    });
    const req = testBackend.expectOne(
      environment.urls.notifications.inactivate + 1
    );
    expect(req.request.method).toBe('PATCH');
    req.flush('');
  });

  it('should activate a subscription', () => {
    service.activateSubscription(1).subscribe(result => {
      expect(result).toEqual('');
    });
    const req = testBackend.expectOne(
      environment.urls.notifications.activate + 1
    );
    expect(req.request.method).toBe('PATCH');
    req.flush('');
  });
});
