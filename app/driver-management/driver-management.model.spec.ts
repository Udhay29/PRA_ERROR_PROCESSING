import {TeamMember, Person, Driver, DriverSortQuery} from './driver-management.model';

import {
  DeliveryMethods,
  SubscriptionDetail
} from '../notifications/notifications.model';
import { UserNotificationSubscriptionDetail } from '../notifications/notifications.dto';
import {SortingParams} from '../task-management/task-management.model';

describe('DriverManagement model', () => {
  it('should create a new teamMember instance', () => {
    const model = new TeamMember();
    expect(model instanceof TeamMember).toBeTruthy();
  });

  it('should create a new Person instance', () => {
    const person = new Person('jisajh0', 'John', 'Big John', 'Henry');
    expect(person.firstName).toEqual('Big John');
  });

  it('should create a new subscription detail with delivery methods', () => {
    const detailDto: UserNotificationSubscriptionDetail = {
      subscribedPerson: {
        id: 'JISAXYZ',
        firstName: 'Xephuris',
        preferredName: 'Greg',
        lastName: 'Yephuris',
        emailAddress: 'xephuris.yephuris@jbhunt.com',
        phoneNumber: null,
        jobTitle: 'E&T Contract Worker',
        contactType: 'CWR',
        companyName: null,
        userName: 'JISAXYZ',
        type: 'Internal'
      },
      notificationSubscriptionDeliveryMethodCodes: [
        'In-App',
        'Email',
        'Horseback'
      ]
    };
    const subscriptionDetail = new SubscriptionDetail(detailDto);
    expect(subscriptionDetail instanceof SubscriptionDetail).toBeTruthy();
    expect(subscriptionDetail.deliveryMethods.length).toBe(2);
    expect(subscriptionDetail.deliveryMethods).toContain(DeliveryMethods.EMAIL);
    expect(subscriptionDetail.deliveryMethods).toContain(
      DeliveryMethods.IN_APP
    );
  });

  it('should create a new person from fromElasticSource instance', () => {
    const person = new Person();
    person.firstName = 'first name';
    person.lastName = 'last name';
    const mock = {
      emplid: 'string',
      firstName: 'string',
      lastName: 'string',
      personDTO: {
        jobTitle: 'string',
        managerEmplId: 'string',
        managerName: 'string',
        prefName: 'string',
        status: 'string'
      },
      roles: [{
        roleTypeName: 'string'
      }],
      taskAssignments: [{
        roleTypeCode: ['string'],
        taskAssignmentID: 12345,
        taskAssignmentName: 'string',
        taskAssignmentResponsibilityGroupDTO: [{}],
        taskGroupID: 12345,
        taskGroupName: 'string'
      }],
      teams: [{
        '@id': 12345,
        teamID: 12345,
        teamLeaderPersonID: 'string',
        teamMemberTeamAssignments: [{
          '@id': 12345,
          teamID: 12345,
          teamMemberPersonID: 'string',
          teamMemberTeamAssignmentID: 12345
        }],
        teamName: 'string'
      }],
      userID: 'string',
      positions: [{
        businessUnit: 'string'
      }]
    };
    Person.fromElasticSource(mock);
    expect(person instanceof Person).toBeTruthy();
  });

  it('should create a new person from fromPersonDTO instance', () => {
    const person = new Person();
    person.firstName = 'first name';
    person.lastName = 'last name';
    const mock = {
        email: 'string',
        extension: 'string',
        firstName: 'string',
        lastName: 'string',
        personEmployeeID: 'string',
        phone: 'string',
        preferredName: 'string',
        title: 'string',
        userName: 'string',
        manager: null,
        teamRoleDTOs: [
          {
            roleTypes: [],
            team: {
             '@id': 343,
              teamID: 34,
              teamLeaderPersonID: 'string',
              teamMemberTeamAssignments: [],
              teamName: 'string'
            },
            teamMemberTeamAssignment: undefined
          }
        ]
    };
    Person.fromPersonDTO(mock);
    expect(person instanceof Person).toBeTruthy();
  });

  it('should create a new Driver instance', () => {
    const driver = new Driver();
    driver.preferredName = 'testName';
    driver.firstName = 'firstName';
    driver.lastName = 'lastName';
    expect(driver.fullName).toEqual('testName lastName');
    expect(driver instanceof Driver).toBeTruthy();
  });

  it ('should create a new Driver instance from fromEmployeeDTO', () => {
    const driver = new Driver();
    driver.preferredName = undefined;
    driver.firstName = 'firstName';
    driver.lastName = 'lastName';
    const mock = {
      personDTO: {
        email: 'string',
        extension: 'string',
        firstName: 'string',
        lastName: 'string',
        personEmployeeID: 'string',
        phone: 'string',
        preferredName: 'string',
        title: 'string',
        userName: 'string',
        manager: {
          email: 'string',
          extension: 'string',
          firstName: 'string',
          lastName: 'string',
          personEmployeeID: 'string',
          phone: 'string',
          preferredName: 'string',
          title: 'string',
          userName: 'string',
          manager: null
        }
      },
      teamRoleDTOs: [
        {
          roleTypes: [],
          team: {
            '@id': 343,
            teamID: 34,
            teamLeaderPersonID: 'string',
            teamMemberTeamAssignments: [],
            teamName: 'string'
          },
          teamMemberTeamAssignment: undefined
        }
      ]
    };
    Driver.fromEmployeeDTO(mock);
    expect(driver.fullName).toEqual('firstName lastName');
    expect(driver instanceof Driver).toBeTruthy();
  });

  it('should create a new Driver instance when preferredName is undefined', () => {
    const driver = new Driver();
    driver.preferredName = undefined;
    driver.firstName = 'firstName';
    driver.lastName = 'lastName';
    const mock = {
      personDTO: {
        email: 'string',
        extension: 'string',
        firstName: 'string',
        lastName: 'string',
        personEmployeeID: 'string',
        phone: 'string',
        preferredName: 'string',
        title: 'string',
        userName: 'string',
        manager: undefined
      },
      teamRoleDTOs: [
        {
          roleTypes: [],
          team: {
            '@id': 343,
            teamID: 34,
            teamLeaderPersonID: 'string',
            teamMemberTeamAssignments: [],
            teamName: 'string'
          },
          teamMemberTeamAssignment: undefined
        }
      ]
    };
    Driver.fromEmployeeDTO(mock);
    expect(driver.fullName).toEqual('firstName lastName');
    expect(driver instanceof Driver).toBeTruthy();
  });
  it('should create a new Person instance', () => {
    const person = new Person('title', 'prefName', 'firstName', 'ln', 343);
    expect(person instanceof Person).toBeTruthy();
  });
  it('should create a new Driver instance from Elastic Source', () => {
    const driver = new Driver();
    driver.firstName = 'firstName';
    driver.lastName = 'lastName';
    const mock = {
        emplid: 'string',
        firstName: 'string',
        lastName: 'string',
        personDTO: {
          jobTitle: 'string',
          managerEmplId: 'string',
          managerName: 'string',
          prefName: 'string',
          status: 'string'
        },
        roles: [{
          roleTypeName: 'string'
        }],
        taskAssignments: [{
          roleTypeCode: ['string'],
          taskAssignmentID: 12345,
          taskAssignmentName: 'string',
          taskAssignmentResponsibilityGroupDTO: [{}],
          taskGroupID: 12345,
          taskGroupName: 'string'
        }],
        teams: [{
          '@id': 12345,
          teamID: 12345,
          teamLeaderPersonID: 'string',
          teamMemberTeamAssignments: [{
            '@id': 12345,
            teamID: 12345,
            teamMemberPersonID: 'string',
            teamMemberTeamAssignmentID: 12345
          }],
          teamName: 'string'
        }],
        userID: 'string',
        positions: [{
          businessUnit: 'string'
        }]
    };
    Driver.fromElasticSource(mock);
    expect(driver.fullName).toEqual('firstName lastName');
    expect(driver instanceof Driver).toBeTruthy();
  });

});
describe('DriverSortQuery', () => {
  const model: DriverSortQuery = new DriverSortQuery();

  it('should create a model', () => {
    expect(model).toBeTruthy();
  });

  it('should build a fullName sort query', () => {
    const sortingParams: SortingParams = {
      sortKey: 'fullName',
      sortOrder: 'order'
    };
    const result = DriverSortQuery.buildSortQuery(sortingParams);
    expect(result['lastName.keyword']).toEqual({order: 'order', mode: 'min'});
  });

  it('should build a status sort query', () => {
    const sortingParams: SortingParams = {
      sortKey: 'status',
      sortOrder: 'order',
      mode: 'mode'
    };
    const result = DriverSortQuery.buildSortQuery(sortingParams);
    expect(result['personDTO.status.keyword']).toEqual({order: 'order', mode: 'mode'});
  });

  it('should build a businessUnit sort query', () => {
    const sortingParams: SortingParams = {
      sortKey: 'businessUnit',
      sortOrder: 'order',
      mode: 'mode'
    };
    const result = DriverSortQuery.buildSortQuery(sortingParams);
    expect(result['positions.businessUnit.keyword']).toEqual({order: 'order', mode: 'mode'});
  });

  it('should handle an invalid sort query', () => {
    const sortingParams: SortingParams = {
      sortKey: 'key',
      sortOrder: 'order'
    };
    const result = DriverSortQuery.buildSortQuery(sortingParams);
    expect(result['invalid sort key']).toEqual({order: 'order', mode: 'min'});
  });
});