export interface PersonCertifications {
  emplId: string;
  userId: string;
  certifications: Certifications[];
}

export interface Certifications {
  CertificateName: any;
  issuer: string;
  certificateNumber: number;
  country: string;
  icon: string | null;
  issueDate: string;
  ExpiryDate: string;
  busUnit: string;
  company: string;
  customerID: string;
  departmentCode: string;
  departmentDesc: string;
  description: string;
  entryDate: string;
  fullTimePartTime: string;
  glLocationCode: string;
  jobCode: string;
  jobGroup: string;
  jobTitle: string;
  locationCode: string;
  locationDesc: string;
  managementLevel: string;
  overtimeType: string;
  payGroup: string;
  positionNbr: string;
  regTemp: string;
  reports2PosNbr: string;
  taxLocationCode: string;
  wageType: string;
}
