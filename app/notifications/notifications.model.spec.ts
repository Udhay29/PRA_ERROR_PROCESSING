import {
  NotificationSubscription,
  NotificationPerson,
  SubscriptionDetail,
  DeliveryMethods,
  SubscriptionCriteria
} from './notifications.model';
import { NotificationMocks } from 'src/mocks/notifications.mocks';
import { UserNotificationSubscriptionDetail } from './notifications.dto';


describe('NotificationsModel', () => {
  it('should create a new notification subscription instance', () => {
    const model = new NotificationSubscription();
    expect(model instanceof NotificationSubscription).toBeTruthy();
  });

  it('should create a new notification subscription instance based on the dto', () => {
    const dto = NotificationMocks.searchResponse(10);
    const model = new NotificationSubscription(dto.hits.hits[1]._source);
    expect(model instanceof NotificationSubscription).toBeTruthy();
    expect(model.id).toBe(1);
  });

  it('should create a new notification person instance', () => {
    const notificationPerson = new NotificationPerson(
      'asdf123',
      'Test',
      'Test',
      'Testerson',
      'test.testerson@test.com',
      '555555555',
      'Tester',
      undefined
    );
    expect(notificationPerson instanceof NotificationPerson).toBeTruthy();
    expect(notificationPerson.id).toEqual('asdf123');
  });

  it('should build fullname based on other names', () => {
    const person = new NotificationPerson(
      'jisajh0',
      'John',
      'Big John',
      'Henry',
      undefined,
      undefined,
      undefined,
      undefined
    );
    expect(person.fullName).toEqual('Big John Henry');
    person.preferredName = undefined;
    expect(person.fullName).toEqual('John Henry');
  });

  it('should create a new subscription detail instance', () => {
    const subscriptionDetail = new SubscriptionDetail();
    expect(subscriptionDetail instanceof SubscriptionDetail).toBeTruthy();
    expect(subscriptionDetail.person).toBeUndefined();
  });

  it('should create a new subscription detail with delivery methods', () => {
    const detailDto: UserNotificationSubscriptionDetail = {
      'subscribedPerson': {
        'id': 'JISAXYZ',
        'firstName': 'Xephuris',
        'preferredName': 'Greg',
        'lastName': 'Yephuris',
        'emailAddress': 'xephuris.yephuris@jbhunt.com',
        'phoneNumber': null,
        'jobTitle': 'E&T Contract Worker',
        'contactType': 'CWR',
        'companyName': null,
        'userName': 'JISAXYZ',
        'type': 'Internal'
      },
      'notificationSubscriptionDeliveryMethodCodes': [
        'In-App',
        'Email',
        'Horseback'
      ]
    };
    const subscriptionDetail = new SubscriptionDetail(detailDto);
    expect(subscriptionDetail instanceof SubscriptionDetail).toBeTruthy();
    expect(subscriptionDetail.deliveryMethods.length).toBe(2);
    expect(subscriptionDetail.deliveryMethods).toContain(DeliveryMethods.EMAIL);
    expect(subscriptionDetail.deliveryMethods).toContain(DeliveryMethods.IN_APP);
  });

  it('should create a new Subscription criteria instance', () => {
    const criteria = new SubscriptionCriteria();
    expect(criteria instanceof SubscriptionCriteria);
    expect(criteria.code).toBeUndefined();
  });
});