import {
  NotificationSource,
  UserNotificationSubscriptionCriteria,
  CreatedBy,
  LastUpdatedBy,
  SubscribedPerson,
  UserNotificationSubscriptionDetail
} from './notifications.dto';

export enum DeliveryMethods {
  IN_APP = 'In-App',
  EMAIL = 'Email'
}

export class NotificationPerson {
  id: string;
  firstName: string;
  preferredName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  jobTitle: string;
  type: string;
  userName: string;
  get fullName(): string {
    return (this.preferredName || this.firstName) + ' ' + this.lastName;
  }

  constructor(
    id: string,
    firstName: string,
    preferredName: string,
    lastName: string,
    emailAddress: string,
    phoneNumber: string,
    jobTitle: string,
    userName: string,
    type?: string,
  ) {
    this.id = id;
    this.firstName = firstName;
    this.preferredName = preferredName;
    this.lastName = lastName;
    this.emailAddress = emailAddress;
    this.phoneNumber = phoneNumber;
    this.jobTitle = jobTitle;
    this.userName = userName;
    this.type = type;
  }

  static fromDTO( dto?: CreatedBy | LastUpdatedBy | SubscribedPerson ): NotificationPerson {
    return new NotificationPerson(
      dto.id,
      dto.firstName,
      dto.preferredName,
      dto.lastName,
      dto.emailAddress,
      dto.phoneNumber,
      dto.jobTitle,
      null,
      dto.type
    );
  }
}

export class SubscriptionDetail {
  person: NotificationPerson;
  deliveryMethods: DeliveryMethods[];

  constructor( dto?: UserNotificationSubscriptionDetail) {
    if (!dto) {
      return this;
    }
    this.person = NotificationPerson.fromDTO(dto.subscribedPerson);
    this.deliveryMethods = [];
    for (const code of dto.notificationSubscriptionDeliveryMethodCodes) {
      if (Object.values(DeliveryMethods).includes(code)) {
        this.deliveryMethods.push(code as DeliveryMethods);
      }
    }
  }
}

export class NotificationSubscription {
  id: number;
  domain: string;
  category: string;
  subcategory: string;
  types: string[];
  criteria: SubscriptionCriteria[];
  creator: NotificationPerson;
  creationDateTime: Date;
  lastUpdater: NotificationPerson;
  lastUpdateDateTime: Date;
  subscribers: SubscriptionDetail[];
  status: string;

  constructor(dto?: NotificationSource) {
    if (!dto) {
      return this;
    }
    this.id = dto.subscriptionID;
    this.domain = dto.subscriptionDomain;
    this.category = dto.notificationSubscriptionCategory;
    this.subcategory = dto.notificationSubscriptionSubCategory;
    this.types = dto.notificationSubscriptionTypes;
    this.creator = NotificationPerson.fromDTO(dto.createdBy);
    this.creationDateTime = new Date(dto.createdTimestamp);
    this.lastUpdater = NotificationPerson.fromDTO(dto.lastUpdatedBy);
    this.lastUpdateDateTime = new Date(dto.lastUpdatedTimestamp);
    this.status = dto.status;
    this.criteria = [];
    this.subscribers = [];
    for (const criteria of dto.userNotificationSubscriptionCriterias) {
      this.criteria.push(new SubscriptionCriteria(criteria));
    }
    for (const detail of dto.userNotificationSubscriptionDetails) {
      this.subscribers.push(new SubscriptionDetail(detail));
    }
  }
}

export class SubscriptionCriteria {
  code: string;
  values: SubscriptionCriteriaValue[];

  constructor( dto?: UserNotificationSubscriptionCriteria) {
    if (!dto) {
      return this;
    }
    this.code = dto.userNotificationSubscriptionParameterCode;
    this.values = [];
    for (const value of dto.userNotificationSubscriptionParameterValues) {
      this.values.push({
        id: value.id,
        details: value.details
      });
    }
    return this;
  }
}

export interface SubscriptionCriteriaValue {
  id: string;
  details: { [key: string]: string; };
}

export class NotificationCategory {
  code: string;
  description: string;

  constructor(code: string, description: string) {
    this.code = code;
    this.description = description;
  }

  static fromDTO(dto: any): NotificationCategory {
    return new NotificationCategory(
      dto.notificationCategoryCode,
      dto.notificationCategoryDescription
    );
  }
}

export class NotificationSubcategory {
  code: string;
  description: string;

  constructor(code: string, description: string) {
    this.code = code;
    this.description = description;
  }

  static fromDTO(dto: any): NotificationSubcategory {
    return new NotificationSubcategory(
      dto.notificationSubCategoryCode,
      dto.notificationSubCategoryDescription
    );
  }
}

export class NotificationType {
  id: number;
  name: string;
  internalOnly: boolean;

  constructor(id?: number, name?: string, internalOnly?: boolean) {
    this.id = id;
    this.name = name;
    this.internalOnly = internalOnly;
  }

  static fromDTO(dto: any): NotificationType {
    return new NotificationType(
      dto.notificationTypeID,
      dto.notificationTypeName,
      dto.notificationRecipientType ? dto.notificationRecipientType.includes('Internal Only') : false
    );
  }
}

export class NotificationCriterion {
  id: number;
  description: string;
  classification: string;

  constructor(id?: number, description?: string, classification?: string) {
    this.id = id;
    this.description = description;
    this.classification = classification;
  }

  static fromDTO(dto: any): NotificationCriterion {
    return new NotificationCriterion(
      Number.parseInt(dto.notificationParameterID, 10),
      dto.notificationParameterDescription,
      dto.notificationParameterClassification
    );
  }
}