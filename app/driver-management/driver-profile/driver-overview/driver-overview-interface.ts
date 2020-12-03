export interface Contact {
  emplId: string;
  userId: string;
  contacts: ContactDetails[];
}

export interface ContactDetails {
  contactType: string;
  contactSubType: string;
  contactString: string;
  contactPreference: string;
}

export interface OperData {
  emplId: string;
  userId: string;
  operData: {
    driverLicense: {
      licenseType: string;
      licenseNumber: string;
      expirationDate: string;
      licenseState: string;
      licenseCountry: string;
      qualifiers: Qualifiers[]
    };
    dispatchBoard: string;
    driverNumber: number;
    seatNumber: string;
    fleetCode: string;
    dotReviewDate: string;
    physicalExpDate: string;
    experienceYears: number;
  };
}
export interface Position {
  emplId: string;
  userId: string;
  positions: Positions[];
}
export interface Positions {
  positionNbr: string;
  description: string;
  entryDate: string;
  reports2PosNbr: string;
  company: string;
  busUnit: string;
  locationCode: string;
  locationDesc: string;
  departmentCode: string;
  departmentDesc: string;
  glLocationCode: string;
  taxLocationCode: string;
  customerID: string;
  managementLevel: string;
  regTemp: string;
  fullTimePartTime: string;
  wageType: string;
  overtimeType: string;
  jobGroup: string;
  jobCode: string;
  jobTitle: string;
  payGroup: string;
}

export interface HireData {
  emplId: number;
  userId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  jobCode: string;
  jobTitle: string;
  status: string;
  originalHireDate: string;
  currentHireDate: string;
  lastTermDate: string;
  seniorityDate: string;
  anniversaryDate: string;
  lastEvalDate: string;
}

export interface Qualifiers {
  qualifierClass: string;
  qualifierType: string;
  expirationDate: string;
  icon: string | null;
}

export interface Address {
  locationName?: string;
  streetNumber?: string;
  streetName?: string;
  city?: string;
  state?: string;
  zip?: string;
  twoDigitCountryCode?: string;
}

export interface TimeOffLocation {
  locationCity?: string;
  locationState?: string;
}

export interface People {
  firstName: string;
  lastName: string;
  userID: string;
  dateOfBirth: string;
  positions: Array<any>;
  operationData: Array<any>;
}

export interface Person {
  emplId: string;
  userId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  prefName: string;
  personType: string;
  personSubType: string;
  isDriver: string;
  status: string;
  positionNbr: string;
  positionDescr: string;
  managerEmplId: string;
  managerName: string;
  departmentCode: string;
  departmentDesc: string;
  businessUnit: string;
  jobCode: string;
  jobTitle: string;
  jobGroup: string;
  locationCode: string;
  locationDesc: string;
  phone: string;
  displayLastName: string;
  displayFirstName: string;
  employee: Employee;
}

export interface Employee {
  emplId: string;
  userId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  prefName: string;
  personType: string;
  status: string;
  positionNbr: string;
  positionDescr: string;
  managerEmplId: string;
  managerName: string;
  departmentCode: string;
  departmentDesc: string;
  jobCode: string;
  jobTitle: string;
  jobGroup: string;
  locationCode: string;
  locationDesc: string;
  phone: string;
  extenstion: string;
  email: string;
}

export interface State {
       stateName: string;
       stateCode: string;
}
