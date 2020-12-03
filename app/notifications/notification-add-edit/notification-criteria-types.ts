import { environment } from '../../../environments/environment';
import { queries } from './notificationCriteriaValueQueries';
import {
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors
} from '@angular/forms';
import { SubscriptionCriteriaValue } from '../notifications.model';

const URLS = environment.urls.notifications.notificationCriteria;

export enum HTTPMethod {
  GET = 'get',
  POST = 'post'
}

const defaultLabelValueMap = (
  input: string
): NotificationCriteriaMappedValue => ({ label: input, value: input });

export function formatAddress(address: any): string {
  const totalAddress: string[] = [];
  totalAddress.push(
    address.AddressLine1 || address.addressLine1 || address.addressLineOne
  );
  totalAddress.push(
    address.AddressLine2 || address.addressLine2 || address.addressLineTwo
  );
  totalAddress.push(address.CityName || address.city);
  totalAddress.push(address.StateName || address.state);
  totalAddress.push(address.CountryName || address.country);
  totalAddress.push(address.PostalCode || address.zipCode || '');
  return totalAddress.filter(entry => entry).join(', ');
}

export function formatLocationAddress(source: any): string {
  let totalAddress = '';
  totalAddress += source.LocationName ? `${source.LocationName} ` : '';
  totalAddress += source.locationname ? `${source.locationname} ` : '';
  totalAddress += source.LocationCode ? `(${source.LocationCode}) ` : '';
  totalAddress += source.locationCode ? `(${source.locationCode}) ` : '';
  totalAddress += source.code ? `(${source.code}) ` : '';
  totalAddress += source.CustomerCode ? `(${source.CustomerCode}), ` : '';
  totalAddress += formatAddress(source) || formatAddress(source.Address);
  return totalAddress;
}

export function getTwoDigitValue(input) {
  return ('0' + input).slice(-2);
}

export function createDateString() {
  const date = new Date();
  return (
    date.getFullYear() +
    '-' +
    getTwoDigitValue(date.getMonth() + 1) +
    '-' +
    getTwoDigitValue(date.getDate()) +
    'T' +
    getTwoDigitValue(date.getHours()) +
    ':' +
    getTwoDigitValue(date.getMinutes()) +
    ':' +
    getTwoDigitValue(date.getSeconds())
  );
}

export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => {
    const isOk = !isNaN(control.value) && control.value >= 0;
    return isOk ? null : { nonPositiveNumber: { value: control.value } };
  };
}

function sanitizeQueryString(queryString: string): string {
  return queryString
    .trim()
    .replace(/[\+\-=\&\|!\(\){}\[\]\^"~\*\?:\\\/]/g, '\\$&')
    .replace(/[<>]/g, '');
}

export interface NotificationCriteriaType {
  name: string;
  code: string;
  service?: NotificationCriteriaTypeService;
  typeahead?: boolean;
  dropdown?: boolean;
  validators?: { type: string; validator: ValidatorFn; message: string }[];
  values?: NotificationCriteriaMappedValue[];
  multivalue: boolean;
  mapLabelValue?: (obj: any) => NotificationCriteriaMappedValue | string;
  mapFormValue: (obj: any) => NotificationCriteriaMappedValue | string;
}

export interface NotificationCriteriaTypeService {
  destination: string;
  query_string?: (query: string, form: AbstractControl) => string;
  request_body?: (query: string, form: AbstractControl) => Object;
  response_map: (response: any) => any;
  method: HTTPMethod;
}

export interface NotificationCriteriaMappedValue {
  label: string;
  value: any;
}

class QueryString {
  default_field: string;
  query: string;
  default_operator: string;
  analyze_wildcard: boolean;

  constructor(
    query: string,
    defaultField?: string,
    defaultOperator: string = 'AND',
    analyzeWildcard: boolean = true
  ) {
    this.default_field = defaultField;
    this.query = query;
    this.default_operator = defaultOperator;
    this.analyze_wildcard = analyzeWildcard;
    return this;
  }
}

export const notificationCriteriaTypes: NotificationCriteriaType[] = [
  {
    name: 'Bill To',
    code: 'BillTo',
    service: {
      destination: URLS.billTo,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.billTo;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${element._source.OrganizationName} ${formatLocationAddress(
        element._source
      )}`,
      value: element._source.PartyID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: `${
        criteriaValue.details.name ? criteriaValue.details.name : ''
      } ${formatLocationAddress(criteriaValue.details)}`.trim(),
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Corporate Account',
    code: 'CorprtAcct',
    service: {
      destination: URLS.corporateAccount,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.corporateAccount;
        queryObj.query.bool.should.query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.aggregations.unique.buckets
    },
    mapLabelValue: (element: any) => ({
      label: element.key,
      value: element.Level.hits.hits[0]._id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['name'],
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Line of Business',
    code: 'LOB',
    service: {
      destination: URLS.lineOfBusiness,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.lineOfBusiness;
        queryObj.query.bool.must[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: element._source.OrganizationName,
      value: element._source.OrganizationID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['name'],
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Solicitor',
    code: 'Solctr',
    service: {
      destination: URLS.solicitor,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.billTo;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${element._source.OrganizationName} ${formatLocationAddress(
        element._source
      )}`,
      value: element._source.PartyID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => {
      let label = criteriaValue.id;
      if (criteriaValue.details) {
        const details = criteriaValue.details;
        label = `${details.firstName} ${details.lastName}, ${details.contactId} (${details.contactType} ${
          details.contactMethod}: ${details.contactValue})`;
      }
      return {
        label: label,
        value: criteriaValue.id
      };
    },
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Business Unit',
    code: 'BusUnit',
    service: {
      destination: URLS.businessUnit,
      method: HTTPMethod.GET,
      response_map: (res: any) =>
        res._embedded.serviceOfferingBusinessUnitTransitModeAssociations,
      query_string: () => ''
    },
    mapLabelValue: (element: any) =>
      element.financeBusinessUnitServiceOfferingAssociation
        .financeBusinessUnitCode,
    mapFormValue: (element: SubscriptionCriteriaValue) => element[0].id,
    typeahead: true,
    multivalue: false
  },
  {
    name: 'Service Offering',
    code: 'ServOffrng',
    service: {
      destination: URLS.serviceOffering,
      method: HTTPMethod.GET,
      response_map: (res: any) =>
        res._embedded.serviceOfferingBusinessUnitTransitModeAssociations,
      query_string: (input: string, form: AbstractControl) =>
        `=${form.get('general').get('Business Unit').value}`
    },
    mapLabelValue: (element: any) => ({
      label:
        element.financeBusinessUnitServiceOfferingAssociation
          .serviceOfferingCode,
      value:
        element.financeBusinessUnitServiceOfferingAssociation
          .serviceOfferingCode
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.id,
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Order Owner',
    code: 'OrdrOwnr',
    service: {
      destination: URLS.orderOwner,
      method: HTTPMethod.GET,
      query_string: (input: string) => `&typeAheadText=${input}`,
      response_map: (res: any) => res.content
    },
    mapLabelValue: (element: any) => ({
      label: `${element.preferredName} ${element.lastName}`,
      value: element.personId
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['Order Owner'],
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Order Number',
    code: 'OrdrNmbr',
    service: {
      destination: URLS.orderNumber,
      method: HTTPMethod.GET,
      query_string: (input: string) => `/${input}/findbyorderid`,
      response_map: (res: any) => res
    },
    mapLabelValue: (element: any) => ({
      label: element.orderID,
      value: element.orderID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) =>
      criteriaValue.id,
    multivalue: true
  },
  {
    name: 'Task Assignment',
    code: 'TskAssgn',
    service: {
      destination: URLS.taskAssignment,
      method: HTTPMethod.GET,
      query_string: (input: string) =>
        `&taskAssignmentName=${input}&expirationTimestamp=${createDateString()}`,
      response_map: (res: any) => res._embedded.taskAssignments
    },
    mapLabelValue: (element: any) => ({
      label: element.taskAssignmentName,
      value: element.taskAssignmentID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['taskAssignmentName'],
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Destination',
    code: 'Dstn',
    service: {
      destination: URLS.destination,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.destination;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        queryObj.query.bool.should[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${formatLocationAddress(element._source)}`,
      value: element._source.LocationID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: formatLocationAddress(criteriaValue.details),
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Destination Marketing Area',
    code: 'DstnMarkr',
    service: {
      destination: URLS.destinationMarketingArea,
      method: HTTPMethod.GET,
      query_string: (input: string) => `?areaName=${input}`,
      response_map: (res: any) => res._embedded.areas
    },
    mapLabelValue: (element: any) => ({
      label: `${element.marketingArea} ${element.buisnessUnit}`,
      value: element.id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label:
        criteriaValue && criteriaValue.details
          ? criteriaValue.details['Destination Marketing Area']
          : criteriaValue.id,
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true,
    dropdown: false
  },
  {
    name: 'Intermediate Stop',
    code: 'IntrmdteStp',
    service: {
      destination: URLS.intermediateStop,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.intermediateStop;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        queryObj.query.bool.should[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${element._source.LocationName} ${formatLocationAddress(
        element._source
      )}`,
      value: element._source.LocationID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: formatAddress(criteriaValue.details),
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Origin',
    code: 'Orgn',
    service: {
      destination: URLS.origin,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.origin;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        queryObj.query.bool.should[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${formatLocationAddress(element._source)}`,
      value: element._source.LocationID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: formatLocationAddress(criteriaValue.details),
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Origin Marketing Area',
    code: 'OrgnMarkAr',
    service: {
      destination: URLS.originMarketingArea,
      method: HTTPMethod.GET,
      query_string: (input: string) => `?areaName=${input}`,
      response_map: (res: any) => res._embedded.areas
    },
    mapLabelValue: (element: any) => ({
      label: `${element.marketingArea} ${element.buisnessUnit}`,
      value: element.id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['Origin Marketing Area'],
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true,
    dropdown: false
  },
  {
    name: 'Associated User',
    code: 'AsstdUsr',
    service: {
      destination: URLS.user,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.user;
        queryObj.query.bool.must[0].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${element._source.personDTO.prefName} ${element._source.lastName} (${element._source.userID})`,
      value: element._id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['Associated User'],
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Days Till Expiration',
    code: 'DTE',
    validators: [
      {
        type: 'max',
        validator: Validators.max(31),
        message: 'Please enter a value less than 31'
      },
      {
        type: 'nonPositiveNumber',
        validator: positiveNumberValidator(),
        message: 'Please enter a non-negative number'
      }
    ],
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) =>
      criteriaValue[0].id,
    multivalue: false
  },
  {
    name: 'Weeks From Latest Active Effective Date',
    code: 'WFLAED',
    validators: [
      {
        type: 'max',
        validator: Validators.max(12),
        message: 'Please enter a value less than 13'
      },
      {
        type: 'nonPositiveNumber',
        validator: positiveNumberValidator(),
        message: 'Please enter a non-negative number'
      }
    ],
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) =>
      criteriaValue[0].id,
    multivalue: false
  },
  {
    name: 'Destination Capacity Area',
    code: 'DestCapcAr',
    service: {
      destination: URLS.destinationCapacityArea,
      method: HTTPMethod.GET,
      query_string: (input: string) =>
        `?areaType=capacity&projection=area&areaName=${input}`,
      response_map: (res: any) => res._embedded.areas
    },
    mapLabelValue: (element: any) => ({
      label: `${element.marketingArea} - ${element.buisnessUnit}`,
      value: element.id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label:
        criteriaValue && criteriaValue.details
          ? criteriaValue.details['Destination Capacity Area']
          : criteriaValue.id,
      value: criteriaValue.id
    }),
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Origin Capacity Area',
    code: 'OrgnCapcAr',
    service: {
      destination: URLS.originCapacityArea,
      method: HTTPMethod.GET,
      query_string: (input: string) =>
        `?areaType=capacity&projection=area&areaName=${input}`,
      response_map: (res: any) => res._embedded.areas
    },
    mapLabelValue: (element: any) => ({
      label: `${element.marketingArea} - ${element.buisnessUnit}`,
      value: element.id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label:
        criteriaValue && criteriaValue.details
          ? criteriaValue.details['Origin Capacity Area']
          : criteriaValue.id,
      value: criteriaValue.id
    }),
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Trading Partner',
    code: 'TrdngPrtnr',
    service: {
      destination: URLS.tradingPartner,
      method: HTTPMethod.GET,
      query_string: (input: string) => `&partnerCode=${input}`,
      response_map: (res: any) => res
    },
    mapLabelValue: (element: any) => ({
      label: `${element.tradingPartnerDescription} (${element.tradingPartnerCode})`,
      value: element.tradingPartnerCode
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['Trading Partner'],
      value: criteriaValue.id
    }),
    multivalue: true,
    typeahead: true,
    dropdown: false
  },
  {
    name: 'SCAC',
    code: 'SCAC',
    mapLabelValue: defaultLabelValueMap,
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) =>
      criteriaValue[0].id,
    multivalue: false
  },
  {
    name: 'Operational Group - Fleet',
    code: 'OprtnlGrpFleet',
    service: {
      destination: URLS.operationalGroup,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.operationalGroupFleet;
        queryObj.query.bool.must[2].query_string.query =
          sanitizeQueryString(input) + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${element._source.OperationalGroupCode}`,
      value: element._id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['Operational Group - Fleet'],
      value: criteriaValue.id
    }),
    dropdown: true,
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Operational Group - Board',
    code: 'OprtnlGrpBoard',
    service: {
      destination: URLS.operationalGroup,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.operationalGroupBoard;
        queryObj.query.bool.must[2].query_string.query =
          sanitizeQueryString(input) + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${element._source.OperationalGroupCode}`,
      value: element._id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['Operational Group - Board'],
      value: criteriaValue.id
    }),
    dropdown: true,
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Billing Party',
    code: 'BillPrty',
    service: {
      destination: URLS.billingParty,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.billingParty;
        queryObj.query.bool.should.query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.aggregations.unique.buckets
    },
    mapLabelValue: (element: any) => ({
      label: element.key,
      value: element.key
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.id,
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Origin Site',
    code: 'OrgnSite',
    service: {
      destination: URLS.originSite,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.originSite;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        queryObj.query.bool.should[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: formatLocationAddress(element._source),
      value: element._id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: formatLocationAddress(criteriaValue.details),
      value: criteriaValue.id
    }),
    dropdown: true,
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Destination Site',
    code: 'DestSite',
    service: {
      destination: URLS.destinationSite,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.destinationSite;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        queryObj.query.bool.should[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: formatLocationAddress(element._source),
      value: element._id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: formatLocationAddress(criteriaValue.details),
      value: criteriaValue.id
    }),
    dropdown: true,
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Origin Ramp',
    code: 'OrgnRamp',
    service: {
      destination: URLS.originRamp,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.originRamp;
        queryObj.query.bool.must[0].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: formatLocationAddress(element._source),
      value: element._id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: formatAddress(criteriaValue.details),
      value: criteriaValue.id
    }),
    dropdown: true,
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Destination Ramp',
    code: 'DestRamp',
    service: {
      destination: URLS.destinationRamp,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.destinationRamp;
        queryObj.query.bool.must[0].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: formatLocationAddress(element._source),
      value: element._source.LocationID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: formatAddress(criteriaValue.details),
      value: criteriaValue.id
    }),
    dropdown: true,
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Pickup Location',
    code: 'PickLoc',
    service: {
      destination: URLS.pickupLocation,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.pickupLocation;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        queryObj.query.bool.should[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${formatLocationAddress(element._source)}`,
      value: element._source.LocationID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: formatLocationAddress(criteriaValue.details),
      value: criteriaValue.id
    }),
    dropdown: true,
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Delivery Location',
    code: 'DelLoc',
    service: {
      destination: URLS.deliveryLocation,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.deliveryLocation;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        queryObj.query.bool.should[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${formatLocationAddress(element._source.Address)}`,
      value: element._source.LocationID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['Delivery Location'],
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Pickup City + State',
    code: 'PickCityState',
    service: {
      destination: URLS.pickupCityAndState,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.pickupCityAndState;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        queryObj.query.bool.should[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${element._source.Address.CityName}, ${element._source.Address.StateName}`,
      value: element._source.LocationID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: formatAddress(criteriaValue.details),
      value: criteriaValue.id
    }),
    dropdown: true,
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Delivery City + State',
    code: 'DelCityState',
    service: {
      destination: URLS.deliveryCityAndState,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.deliveryCityAndState;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        queryObj.query.bool.should[1].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${element._source.Address.CityName}, ${element._source.Address.StateName}`,
      value: element._source.LocationID
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: formatAddress(criteriaValue.details),
      value: criteriaValue.id
    }),
    dropdown: true,
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Load Number',
    code: 'LoadNmbr',
    service: {
      destination: URLS.loadNumber,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.loadNumber;
        queryObj.query.query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: element._source.OperationalPlanNumber,
      value: element._source.OperationalPlanNumber
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.id,
      value: criteriaValue.id
    }),
    dropdown: true,
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Carrier',
    code: 'Carrier',
    service: {
      destination: URLS.carrier,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.carrier;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: element._source.CarrierName,
      value: element._source.CarrierName
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.id,
      value: criteriaValue.id
    }),
    dropdown: true,
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Dispatcher',
    code: 'Dsptcher',
    service: {
      destination: URLS.dispatcher,
      method: HTTPMethod.GET,
      query_string: (input: string) => `&typeAheadText=${input}`,
      response_map: (res: any) => res.content
    },
    mapLabelValue: (element: any) => ({
      label: `${element.preferredName} ${element.lastName}`,
      value: element.personId
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['Dispatcher'],
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Load Planner',
    code: 'LoadPlnr',
    service: {
      destination: URLS.loadPlanner,
      method: HTTPMethod.GET,
      query_string: (input: string) => `&typeAheadText=${input}`,
      response_map: (res: any) => res.content
    },
    mapLabelValue: (element: any) => ({
      label: `${element.preferredName} ${element.lastName}`,
      value: element.personId
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['Load Planner'],
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Network Planner',
    code: 'NtwrkPlnnr',
    service: {
      destination: URLS.networkPlanner,
      method: HTTPMethod.GET,
      query_string: (input: string) => `&typeAheadText=${input}`,
      response_map: (res: any) => res.content
    },
    mapLabelValue: (element: any) => ({
      label: `${element.preferredName} ${element.lastName}`,
      value: element.personId
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['Network Planner'],
      value: criteriaValue.id
    }),
    typeahead: true,
    multivalue: true
  },
  {
    name: 'Operational Plan Type',
    code: 'OprtnlPlnTpe',
    service: {
      destination: URLS.operationalPlan,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.operationalPlanType;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${element._source.OperationalPlanTypeDescription} (${element._source.OperationalPlanFinanceBusinessUnitCode})`,
      value: element._id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['name'],
      value: criteriaValue.id
    }),
    dropdown: true,
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Operational Plan Sub-Type',
    code: 'OprtnlPlnSubTpe',
    service: {
      destination: URLS.operationalPlan,
      method: HTTPMethod.POST,
      request_body: (input: string) => {
        const queryObj = queries.operationalPlanSubType;
        queryObj.query.bool.should[0].query_string.query = input + '*';
        return queryObj;
      },
      response_map: (res: any) => res.hits.hits
    },
    mapLabelValue: (element: any) => ({
      label: `${element._source.OperationalPlanSubTypeDescription} (${element._source.OperationalPlanFinanceBusinessUnitCode})`,
      value: element._id
    }),
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) => ({
      label: criteriaValue.details['name'],
      value: criteriaValue.id
    }),
    dropdown: true,
    multivalue: true,
    typeahead: true
  },
  {
    name: 'Load Delivery Appointment (Date)',
    code: 'LDA',
    validators: [
      {
        type: 'max',
        validator: Validators.maxLength(6),
        message:
          'Please enter a Delivery Appointment Date in this format *mmddyy*'
      },
      {
        type: 'nonPositiveNumber',
        validator: positiveNumberValidator(),
        message: 'Please enter a non-negative number'
      }
    ],
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) =>
      criteriaValue[0].id,
    multivalue: false
  },
  {
    name: 'Load Pickup Appointment (Date)',
    code: 'LPA',
    validators: [
      {
        type: 'max',
        validator: Validators.max(6),
        message: 'Please enter a Delivery Pickup Date in this format *mmddyy*'
      },
      {
        type: 'nonPositiveNumber',
        validator: positiveNumberValidator(),
        message: 'Please enter a non-negative number'
      }
    ],
    mapFormValue: (criteriaValue: SubscriptionCriteriaValue) =>
      criteriaValue[0].id,
    multivalue: false
  }
];
