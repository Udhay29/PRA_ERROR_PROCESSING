import { DriverDTO, PersonDTO, Source } from './driver-management.dto';

export class TeamMember {
  personId: number;
  assignmentId: number;
}

export class Team {
  id: number;
  name: string;
  leader: string;
  members: TeamMember[];
}
export const sortFields: any = {
  name: 'fullName',
  status: 'status',
  businessUnit: 'businessUnit'
};
export interface SortingParams {
  sortKey: string;
  sortOrder: string;
  mode?: string;
}

export class DriverSortQuery {
  static buildSortQuery(sortingParams: SortingParams): any {
    const result = {};
    result[this.mapSortKey(sortingParams.sortKey)] = {
      order: sortingParams.sortOrder,
      mode: sortingParams.mode || 'min'
    };
    return result;
  }

  private static mapSortKey(sortKey: string): string {
    switch (sortKey) {
      case 'fullName':
        return 'lastName.keyword';
      case 'status':
        return 'personDTO.status.keyword';
      case 'businessUnit':
        return 'positions.businessUnit.keyword';
      default:
        return 'invalid sort key';
    }
  }
}

export class Person {
  title?: string;
  prefName?: string;
  firstName?: string;
  lastName?: string;
  id: number;
    constructor(
        title?: string,
        prefName?: string,
        firstName?: string,
        lastName?: string,
        id?: number
    ) {
            this.title =  title;
            this.prefName =  prefName;
            this.firstName = firstName;
            this.lastName = lastName;
            this.id = id;
    }
  static fromElasticSource(source: Source): Person {
    const person: Person = new Person();
    person.id = Number(source.emplid);
    person.firstName = source.firstName;
    person.prefName = source.personDTO.prefName;
    person.lastName = source.lastName;
    person.title = source.personDTO.jobTitle;
    return person;
  }

  static fromPersonDTO(dto: PersonDTO): Person {
    const person: Person = new Person();
    person.title = dto.title;
    person.prefName = dto.preferredName;
    person.firstName = dto.firstName;
    person.lastName = dto.lastName;
    person.id = Number(dto.personEmployeeID);
    return person;
  }
}

export class Driver {
  emplid: number;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  extenstion: string;
  personEmployeeID: string;
  phone: string;
  preferredName: string;
  userName: string;
  manager: Driver;
  profilePic: string;
  businessUnit: string;
  status: string;

  get fullName(): string {
    return `${this.preferredName ? this.preferredName : this.firstName} ${
      this.lastName
    }`;
  }

  readonly isEmployee: boolean = true;

  static fromEmployeeDTO(dto: DriverDTO): Driver {
    const emp: Driver = Driver.fromPersonDTO(dto.personDTO);
    emp.manager = dto.personDTO.manager
      ? Driver.fromPersonDTO(dto.personDTO.manager)
      : undefined;
    return emp;
  }

  static fromElasticSource(source: Source): Driver {
    const emp: Driver = new Driver();
    emp.emplid = Number(source.emplid);
    emp.firstName = source.firstName;
    emp.lastName = source.lastName;
    emp.preferredName = source.personDTO.prefName;
    emp.title = source.personDTO.jobTitle;
    emp.userName = source.userID;
    emp.manager = new Driver();
    emp.businessUnit = source.positions[0].businessUnit;
    emp.status = source.personDTO.status;
    return emp;
  }

  static fromPersonDTO(dto: PersonDTO): Driver {
    const emp: Driver = new Driver();
    emp.emplid = Number(dto.personEmployeeID);
    emp.firstName = dto.firstName;
    emp.lastName = dto.lastName;
    emp.title = dto.title;
    emp.email = dto.email;
    emp.extenstion = dto.extension;
    emp.personEmployeeID = dto.personEmployeeID;
    emp.phone = dto.phone;
    emp.preferredName = dto.preferredName;
    emp.userName = dto.userName;
    return emp;
  }
}
