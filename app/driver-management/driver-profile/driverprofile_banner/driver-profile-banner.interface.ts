import { Employee } from './../driver-overview/driver-overview-interface';

export interface Person {
  empId: string;
  userId: string;
  positions: PositionsInfo[];
}
export interface PositionsInfo {
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
  gLLocationCode: string;
  taxLocationCode: string;
  customerID: string;
  managementLevel: string;
  regTemp: string;
  fullTimePartTime: string;
  wageType: string;
  overtimeType: string;
  jobGroup: string;
  jobCode: string;
  payGroup: string;
}

export interface People {
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
  employee: Employee;
}
