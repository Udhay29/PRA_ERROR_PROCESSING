import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ElasticResult } from '../shared/elastic.dto';
import {
  NotificationSource,
  UserNotificationSubscriptionDetail,
  SubscribedPerson,
  UserNotificationSubscriptionCriteria,
  UserNotificationSubscriptionParameterValue,
  SaveDTO
} from './notifications.dto';
import {
  NotificationSubscription,
  NotificationCategory,
  NotificationSubcategory,
  NotificationType,
  NotificationCriterion,
  NotificationPerson
} from './notifications.model';
import { EmployeesService } from '../employees/employees.service';
import {
    BoolQuery,
    QueryStringQuery,
    RequestBodySearch,
    requestBodySearch,
    InnerHits,
    NestedQuery, Sort
} from 'elastic-builder';
import { ElasticService, NestedField } from '../shared/elastic.service';
import { HttpClient } from '@angular/common/http';
import {
  NotificationCriteriaTypeService,
  HTTPMethod
} from './notification-add-edit/notification-criteria-types';
import { AbstractControl } from '@angular/forms';
import {
  ElasticFilter,
  Filter,
  CheckboxFilter
} from '../shared/filter-panel/filter/filter.model';

@Injectable()
export class NotificationsService {
  readonly URLS = environment.urls.notifications;

  readonly nestedFields: NestedField[] = [
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

  readonly subscribedUsersFields: NestedField[] = [
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

  readonly fields: string[] = [
    'notificationSubscriptionCategory',
    'notificationSubscriptionSubCategory',
    'notificationSubscriptionTypes',
    'createdBy*',
    'lastUpdatedBy*',
    'status'
  ];

  readonly sortByLastUpdated: Sort = new Sort('lastUpdatedTimestamp', 'desc');

  constructor(
    private httpClient: HttpClient,
    private employeesService: EmployeesService,
    private elasticService: ElasticService
  ) {}

  searchForNotifications(
    term?: string,
    from: number = 0,
    size: number = 25,
    filters?: Filter[]
  ): Observable<NotificationSearchResult> {
    return this.elasticService
      .search(
        term,
        this.fields,
        this.URLS.search,
        filters,
        this.nestedFields,
        false,
        this.sortByLastUpdated,
        from,
        size
      )
      .pipe(
        map((response: ElasticResult<NotificationSource>) => {
          return {
            count: response.hits.total,
            notifications: response.hits.hits.map(
              (hit: any) => new NotificationSubscription(hit._source)
            )
          };
        })
      );
  }

  getNotificationDetails(id: number): Observable<NotificationSubscription> {
    return this.httpClient
      .get(this.URLS.subscriptions + id)
      .pipe(map((resp: any) => new NotificationSubscription(resp)));
  }

  getCategories(): Observable<NotificationCategory[]> {
    return this.httpClient.get(this.URLS.categories).pipe(
      map((resp: any) => {
        const categories: NotificationCategory[] = [];
        for (const cat of resp._embedded.notificationCategories) {
          categories.push(NotificationCategory.fromDTO(cat));
        }
        return categories;
      })
    );
  }

  getSubcategories(
    categoryDescription: string
  ): Observable<NotificationSubcategory[]> {
    return this.httpClient
      .get(this.URLS.subcategories, {
        params: { notificationCategories: categoryDescription }
      })
      .pipe(
        map((resp: any) => {
          const subcategories: NotificationSubcategory[] = [];
          for (const subcat of resp) {
            subcategories.push(NotificationSubcategory.fromDTO(subcat));
          }
          return subcategories;
        })
      );
  }

  getTypes(
    categoryDescription: string,
    subcategoryDescription: string
  ): Observable<NotificationType[]> {
    return this.httpClient
      .get(this.URLS.types, {
        params: {
          notificationCategories: categoryDescription,
          notificationSubCategories: subcategoryDescription
        }
      })
      .pipe(
        map((resp: any) => {
          const types: NotificationType[] = [];
          for (const type of resp) {
            types.push(NotificationType.fromDTO(type));
          }
          return types;
        })
      );
  }

  getCriteria(
    categoryDescription: string,
    subcategoryDescription: string
  ): Observable<NotificationCriterion[]> {
    return this.httpClient
      .get(this.URLS.criteria, {
        params: {
          notificationCategory: categoryDescription,
          notificationSubCategory: subcategoryDescription
        }
      })
      .pipe(
        map((resp: any) => {
          const criteria: NotificationCriterion[] = [];
          for (const type of resp) {
            criteria.push(NotificationCriterion.fromDTO(type));
          }
          return criteria;
        })
      );
  }

  getInternalContacts(term: string): Observable<NotificationPerson[]> {
    return this.employeesService.searchForUsers(term).pipe(
      map(result => {
        const persons: NotificationPerson[] = [];
        result.employees.forEach(employee =>
          persons.push(
            new NotificationPerson(
              employee.userName,
              employee.firstName,
              employee.preferredName,
              employee.lastName,
              employee.email,
              employee.phone,
              employee.title,
              employee.userName
            )
          )
        );
        return persons;
      })
    );
  }

  inactivateSubscription(subscriptionID: number) {
    return this.httpClient.patch(this.URLS.inactivate + subscriptionID, null);
  }

  activateSubscription(subscriptionID: number) {
    return this.httpClient.patch(this.URLS.activate + subscriptionID, null);
  }

  getExternalContacts(term: string): Observable<NotificationPerson[]> {
    const fields: string[] = [
      'Name',
      'TelephoneNumber',
      'Email',
      'LocationID',
      'PartyId',
      'Address.AddressID',
      'TelephoneID',
      'EmailID',
      'PersonId'
    ];
    const query = new BoolQuery().must(
      new QueryStringQuery(term + '*')
        .defaultField('Name')
        .defaultOperator('AND')
    );
    const requestBody: RequestBodySearch = new RequestBodySearch()
      .from(0)
      .source(fields)
      .size(5)
      .query(query);
    return this.httpClient
      .post(this.URLS.externalContacts, requestBody.toJSON())
      .pipe(
        map((response: any) => {
          const persons: NotificationPerson[] = [];
          response.hits.hits.forEach(hit => {
            persons.push(
              new NotificationPerson(
                hit._source.PersonId + '',
                (hit._source.Name as string).split(' ')[0],
                (hit._source.Name as string).split(' ')[0],
                (hit._source.Name as string).split(' ')[1],
                hit._source.Email,
                hit._source.TelephoneNumber,
                null,
                null
              )
            );
          });
          return persons;
        })
      );
  }

  searchForField(term: string, field: string): Observable<any> {
    return this.elasticService.search(
      term,
      [field],
      this.URLS.search,
      null,
      null,
      true
    );
  }

  buildFilters(): Filter[] {
    return [
      this.buildCategoryFilter(),
      this.buildSubCategoryFilter(),
      this.buildTypeFilter(),
      this.buildCriteriaFilter(),
      this.buildInternalContactFilter(),
      this.buildExternalContactFilter(),
      this.buildCreatedByFilter(),
      this.buildLastUpdatedByFilter(),
      this.buildStatusFilter()
    ];
  }

  buildCategoryFilter(): ElasticFilter {
    return new ElasticFilter(
      'Category',
      'notificationSubscriptionCategory',
      event =>
        this.searchForField(
          event.query,
          'notificationSubscriptionCategory'
        ).pipe(
          map((body: any) =>
            body.hits.hits.map(
              hit => hit._source.notificationSubscriptionCategory
            )
          )
        )
    );
  }

  buildSubCategoryFilter(): ElasticFilter {
    return new ElasticFilter(
      'Sub Category',
      'notificationSubscriptionSubCategory',
      event =>
        this.searchForField(
          event.query,
          'notificationSubscriptionSubCategory'
        ).pipe(
          map((body: any) =>
            body.hits.hits.map(
              hit => hit._source.notificationSubscriptionSubCategory
            )
          )
        )
    );
  }

  buildTypeFilter(): ElasticFilter {
    return new ElasticFilter('Type', 'notificationSubscriptionTypes', event =>
      this.searchForField(event.query, 'notificationSubscriptionTypes').pipe(
        map((body: any) => {
          const types: Set<string> = new Set();
          body.hits.hits.forEach(hit =>
            hit._source.notificationSubscriptionTypes.forEach(
              (type: string) => {
                if (type.toLowerCase().includes(event.query.toLowerCase())) {
                  types.add(type);
                }
              }
            )
          );
          return Array.from(types);
        })
      )
    );
  }

  buildInternalContactFilter(): ElasticFilter {
    return new ElasticFilter(
      'Internal Contact',
      this.subscribedUsersFields,
      event =>
        this.elasticService
          .searchCustomQuery(
            this.contactQueryBuilder(event.query, 'Internal'),
            this.URLS.search
          )
          .pipe(map((body: any) => this.mapContactValues(body))),
      true,
      'Internal'
    );
  }

  buildExternalContactFilter(): ElasticFilter {
    return new ElasticFilter(
      'External Contact',
      this.subscribedUsersFields,
      event =>
        this.elasticService
          .searchCustomQuery(
            this.contactQueryBuilder(event.query, 'External'),
            this.URLS.search
          )
          .pipe(map((body: any) => this.mapContactValues(body))),
      true,
      'External'
    );
  }

  buildCreatedByFilter(): ElasticFilter {
    return new ElasticFilter(
      'Created By',
      'createdBy*',
      event =>
        this.searchForField(event.query, 'createdBy*').pipe(
          map((body: any) =>
            Array.from(
              new Set(
                body.hits.hits.map(
                  hit =>
                    `${
                      hit._source.createdBy.preferredName
                        ? hit._source.createdBy.preferredName
                        : hit._source.createdBy.firstName
                    } ${
                      hit._source.createdBy.lastName
                    } (${hit._source.createdBy.id.toLowerCase()})`
                )
              )
            )
          )
        ),
      true
    );
  }

  buildLastUpdatedByFilter(): ElasticFilter {
    return new ElasticFilter(
      'Last Updated By',
      'lastUpdatedBy*',
      event =>
        this.searchForField(event.query, 'lastUpdatedBy*').pipe(
          map((body: any) =>
            Array.from(
              new Set(
                body.hits.hits.map(
                  hit =>
                    `${
                      hit._source.lastUpdatedBy.preferredName
                        ? hit._source.lastUpdatedBy.preferredName
                        : hit._source.lastUpdatedBy.firstName
                    } ${
                      hit._source.lastUpdatedBy.lastName
                    } (${hit._source.lastUpdatedBy.id.toLowerCase()})`
                )
              )
            )
          )
        ),
      true
    );
  }

  buildStatusFilter(): CheckboxFilter {
    return new CheckboxFilter(
      'Status',
      'status',
      'Active',
      new Set(['Active', 'Inactive']),
      null,
      ['Active']
    );
  }

  buildCriteriaFilter(): ElasticFilter {
    return new ElasticFilter('Criteria', this.nestedFields, event =>
      this.elasticService
        .search(
          event.query,
          [''],
          this.URLS.search,
          null,
          this.nestedFields,
          true
        )
        .pipe(
          map((body: any) => {
            return [].concat.apply(
              [],
              body.hits.hits.map(hit => {
                return this.convertCriteriaToOptions(
                  hit._source.userNotificationSubscriptionCriterias
                );
              })
            );
          })
        )
    );
  }

  fetchCriteriaValues(
    value: NotificationCriteriaTypeService,
    query: string,
    form: AbstractControl
  ): Observable<any[]> {
    if (value.method === HTTPMethod.GET) {
      return this.getSearchTypeValues(value, query, form);
    } else {
      return this.postSearchTypeValues(value, query, form);
    }
  }

  contactQueryBuilder(term: string, type: string) {
    const requestBody: RequestBodySearch = new RequestBodySearch();
    const query: BoolQuery = new BoolQuery();
    const queryTerm: string = this.elasticService.extractTerms(
      term + ' ' + type
    );

    query.should(
      new NestedQuery(
        new QueryStringQuery(queryTerm)
          .analyzeWildcard(true)
          .fields(this.subscribedUsersFields[0].fields),
        this.subscribedUsersFields[0].name
      ).innerHits(new InnerHits().source(this.subscribedUsersFields[0].fields))
    );

    return requestBody
      .query(query)
      .from(0)
      .size(25)
      .source('');
  }

  mapContactValues(responseBody: any): string[] {
    return [].concat.apply(
      [],
      responseBody.hits.hits.map(hit => {
        return hit.inner_hits[
          'userNotificationSubscriptionDetails.subscribedPerson'
        ].hits.hits
          .filter(
            person => person._source.preferredName || person._source.firstName
          )
          .map(
            person =>
              `${
                person._source.preferredName
                  ? person._source.preferredName
                  : person._source.firstName
              } ${
                person._source.lastName ? person._source.lastName + ' ' : ''
              }${person._source.id ? `(${person._source.id})` : ''}`
          );
      })
    );
  }

  getSearchTypeValues(
    typeService: NotificationCriteriaTypeService,
    query: string,
    form: AbstractControl
  ): Observable<any[]> {
    const urlWithParams: string =
      typeService.destination + typeService.query_string(query, form);
    return this.httpClient
      .get(urlWithParams)
      .pipe(map(typeService.response_map));
  }

  postSearchTypeValues(
    typeService: NotificationCriteriaTypeService,
    query: string,
    form: AbstractControl
  ): Observable<any[]> {
    return this.httpClient
      .post(typeService.destination, typeService.request_body(query, form))
      .pipe(map(typeService.response_map));
  }

  convertCriteriaToOptions(criterias: any): string[] {
    const options: Set<string> = new Set();
    for (const criteria of criterias) {
      options.add(criteria.userNotificationSubscriptionParameterCode);
      for (const value of criteria.userNotificationSubscriptionParameterValues) {
        if (value.details) {
          const option =
            value.details[criteria.userNotificationSubscriptionParameterCode] ||
            value.details.name;
          if (option) {
            options.add(option);
          }
        }
      }
    }
    return Array.from(options);
  }

  postNotification(saveObj: SaveDTO) {
    return this.httpClient.post(this.URLS.save, saveObj).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  putNotification(saveObj: SaveDTO) {
    return this.httpClient.put(this.URLS.save, saveObj).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  sendNotificationRequest(
    notificationObj: any,
    criteria: NotificationCriterion[],
    editing: boolean
  ) {
    const requestBody: SaveDTO = this.createPayLoadForNotification(
      notificationObj,
      criteria
    );
    if (editing) {
      return this.putNotification(requestBody);
    } else {
      return this.postNotification(requestBody);
    }
  }

  createPayLoadForNotification(
    notificationValues: any,
    criteria: NotificationCriterion[]
  ): SaveDTO {
    return {
      subscriptionID: notificationValues.id ? notificationValues.id : null,
      notificationSubscriptionCategory: notificationValues.category.description,
      notificationSubscriptionSubCategory:
        notificationValues.subcategory.description,
      notificationSubscriptionTypes: this.getTypeName(notificationValues.types),
      userNotificationSubscriptionCriterias: this.composeNotificationCriteria(
        notificationValues.criteria,
        criteria.filter(
          criterion =>
            notificationValues.criteria[criterion.classification][
              criterion.description
            ]
        )
      ),
      userNotificationSubscriptionDetails: this.getUserNotificationSubscriptionDetail(
        notificationValues.contacts
      ),
      status: notificationValues.status ? notificationValues.status : null
    };
  }

  getUserNotificationSubscriptionDetail(contacts) {
    const contactDetails: UserNotificationSubscriptionDetail[] = [];
    let subscribedPerson: SubscribedPerson;
    let notificationSubscriptionDeliveryMethodCodes: string[] = [];

    contacts.forEach(contact => {
      notificationSubscriptionDeliveryMethodCodes = [];
      subscribedPerson = {
        id: contact.contact.id,
        firstName: contact.contact.firstName,
        preferredName: contact.contact.preferredName,
        lastName: contact.contact.lastName,
        emailAddress: contact.contact.emailAddress,
        jobTitle: contact.contact.jobTitle,
        userName: contact.userName,
        type: contact.contactType
      };

      if (contact.contact.phoneNumber) {
        subscribedPerson.phoneNumber = contact.contact.phoneNumber;
      }
      if (contact.contact.companyName) {
        subscribedPerson.companyName = contact.contact.companyName;
      }

      if (contact.inApp) {
        notificationSubscriptionDeliveryMethodCodes.push('In-App');
      }
      if (contact.email) {
        notificationSubscriptionDeliveryMethodCodes.push('Email');
      }
      contactDetails.push({
        subscribedPerson: subscribedPerson,
        notificationSubscriptionDeliveryMethodCodes: notificationSubscriptionDeliveryMethodCodes
      });
    });
    return contactDetails;
  }

  getTypeName(types: NotificationType[]) {
    const typeNames: string[] = [];
    types.forEach(type => {
      typeNames.push(type.name);
    });
    return typeNames;
  }

  composeNotificationCriteria(
    formCriteria: NotificationSource,
    criteriaList: NotificationCriterion[]
  ): UserNotificationSubscriptionCriteria[] {
    const userCriteria: UserNotificationSubscriptionCriteria[] = [];
    criteriaList.forEach(criterion => {
      userCriteria.push({
        userNotificationSubscriptionParameterCode: criterion.description,
        userNotificationSubscriptionParameterValues: this.mapToCriteriaParamValue(
          formCriteria[criterion.classification][criterion.description]
        )
      });
    });
    return userCriteria;
  }

  mapToCriteriaParamValue(
    formEntryObject: any
  ): UserNotificationSubscriptionParameterValue[] {
    if (!Array.isArray(formEntryObject)) {
      return [{ id: formEntryObject, details: null }];
    }
    return formEntryObject.map(entry => {
      return { id: entry.value, details: null };
    });
  }
}

interface ElasticQuery {
  query: ElasticQueryObject;
  _source?: string[];
  from?: number;
  size?: number;
}

interface ElasticQueryObject {
  match_all?: any;
  bool?: BooleanQuery;
}

interface BooleanQuery {
  must?: any | any[];
  filter?: any | any[];
}

export class NotificationSearchResult {
  count: number;
  notifications: NotificationSubscription[];
}
