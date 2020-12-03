export class DriverDTO {
  personDTO: PersonDTO;
  teamRoleDTOs: TeamRoleDTO[];
}

export class Source {
  emplid: string;
  firstName: string;
  lastName: string;
  personDTO: SourcePersonDTO;
  roles: RoleDTO[];
  taskAssignments: TaskAssignment[];
  teams: TeamDTO[];
  userID: string;
  positions: PositionsDTO[];
}

export class PositionsDTO {
  businessUnit?: string;
}

export class TaskSchedule {
  employeeTaskScheduleDay: string;
  employeeTaskScheduleEndTime: string;
  employeeTaskScheduleID: number;
  employeeTaskScheduleStartTime: string;
  personID: string;
}

export class PersonDTO {
  email?: string;
  extension?: string;
  firstName?: string;
  lastName?: string;
  personEmployeeID: string;
  phone?: string;
  preferredName?: string;
  title?: string;
  userName?: string;
  manager?: PersonDTO;
}

export class SourcePersonDTO {
  jobTitle?: string;
  managerEmplId?: string;
  managerName?: string;
  prefName?: string;
  status: string;
}

export class TeamRoleDTO {
  roleTypes: any[];
  team: TeamDTO;
  teamMemberTeamAssignment: TeamMemberTeamAssignment;
}

export class TeamDTO {
  '@id'?: number;
  teamID: number;
  teamLeaderPersonID?: string;
  teamMemberTeamAssignments?: Array<TeamMemberTeamAssignment | number>;
  teamName: string;
}

export class TeamMemberTeamAssignment {
  '@id': number;
  teamID: number;
  teamMemberPersonID: string;
  teamMemberTeamAssignmentID: number;
}

export class RoleDTO {
  roleTypeName: string;
}

class TaskAssignment {
  roleTypeCode: string[];
  taskAssignmentID: number;
  taskAssignmentName: string;
  taskAssignmentResponsibilityGroupDTO: TaskAssignmentResponsibilityGroupDTO[];
  taskGroupID: number;
  taskGroupName: string;
}

class TaskAssignmentResponsibilityGroupDTO {}
