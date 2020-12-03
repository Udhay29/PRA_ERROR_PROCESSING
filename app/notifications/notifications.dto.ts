
export interface Details {
  [key: string]: string;
}

export interface UserNotificationSubscriptionParameterValue {
  id: string;
  details: Details;
}

export interface UserNotificationSubscriptionCriteria {
  userNotificationSubscriptionParameterCode: string;
  userNotificationSubscriptionParameterValues: UserNotificationSubscriptionParameterValue[];
}

export interface SubscribedPerson {
  id: string;
  firstName: string;
  preferredName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: any;
  jobTitle: string;
  contactType?: string;
  companyName?: any;
  type: string;
  userName: string;
}

export interface UserNotificationSubscriptionDetail {
  subscribedPerson: SubscribedPerson;
  notificationSubscriptionDeliveryMethodCodes: string[];
}

export interface CreatedBy {
  id: string;
  firstName: string;
  preferredName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: any;
  jobTitle?: any;
  contactType?: any;
  companyName?: any;
  type?: any;
}

export interface LastUpdatedBy {
  id: string;
  firstName: string;
  preferredName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: any;
  jobTitle?: any;
  contactType?: any;
  companyName?: any;
  type?: any;
}

export interface NotificationSource {
  subscriptionID: number;
  subscriptionDomain: string;
  notificationSubscriptionCategory: string;
  notificationSubscriptionSubCategory: string;
  notificationSubscriptionTypes: string[];
  userNotificationSubscriptionCriterias: UserNotificationSubscriptionCriteria[];
  userNotificationSubscriptionDetails: UserNotificationSubscriptionDetail[];
  effectiveTimestamp: Date;
  expirationTimestamp: Date;
  createdBy: CreatedBy;
  lastUpdatedBy: LastUpdatedBy;
  createdTimestamp: string;
  lastUpdatedTimestamp: string;
  status: string;
}

export interface SaveDTO {
  subscriptionID?: number;
  notificationSubscriptionCategory: string;
  notificationSubscriptionSubCategory: string;
  notificationSubscriptionTypes: string[];
  userNotificationSubscriptionCriterias: UserNotificationSubscriptionCriteria[];
  userNotificationSubscriptionDetails: UserNotificationSubscriptionDetail[];
  effectiveTimestamp?: any;
  expirationTimestamp?: any;
  createdBy?: CreatedBy;
  lastUpdatedBy?: CreatedBy;
  createdTimestamp?: any;
  lastUpdatedTimestamp?: any;
  status?: any;
}