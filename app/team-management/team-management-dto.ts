import { TaskAssignmentDTO, TaskAssignmentResponsibilityGroupDTO } from '../task-management/task-management.dto';
import { TaskAssignment } from '../employees/employees.dto';

export interface TeamDTO {
  '@id'?: number;
  taskAssignments?: TaskAssignment;
  teamID?: number;
  teamName: string;
  teamLeaderPersonFirstName?: string;
  teamLeaderPersonLastName?: string;
  teamLeaderPersonID: string;
  teamLeaderTitle?: string;
  taskGroupName?: string;
  taskGroups?: any;
  teamPersonDTOs: TeamPersonDTO[];
  taskAssignment?: any;
  taskAssignmentDTOs?: TaskAssignmentDTO[];
  teamMemberCount?: number;
  teamMemberTeamAssignments?: Array<TeamMemberTeamAssignment | number>;
  teamProfileDTOs?: TeamProfileDTO[];
  teamEffectiveTimestamp?: string;
  teamExpirationTimestamp?: string;
  taskGroupsString?: string;
  teamValidationDTO?: any;
  updatedOn?: string;
  updatedBy?: string;
  createdOn?: string;
  createdBy?: string;
  expirationTimestamp?: string;
}

export interface TeamPersonDTO {
  addOrRemove?: any;
  alternateRoleIndicator?: any;
  currentHireDate?: string;
  email?: string;
  extenstion?: number;
  firstName?: string;
  lastName?: string;
  personEmployeeID: string;
  personId?: number;
  phone?: any;
  preferredName?: string;
  roleTypeCode?: string;
  roleTypeName?: string;
  roleTypes?: string;
  taskCount?: number;
  teamAssignmentEffectiveTimestamp?: string;
  teamAssignmentExpirationTimestamp?: string;
  teamLeaderPersonDTOs?: any;
  teamMemberPersonID?: number;
  title?: string;
  userID?: string;
  userName?: string;
}

export interface TeamProfileDTO {
  userID: string;
  personEmployeeID: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  teamName: string;
  title: string;
  taskAssignmentID: number;
  taskAssignmentName: string;
  taskGroupID: string;
  taskGroupName: string;
  roleTypeCode: string;
  taskAssignmentResponsibilityGroupDTOs: TaskAssignmentResponsibilityGroupDTO[];
}

export interface TeamMemberTeamAssignment {
  '@id': number;
  teamID: number;
  teamMemberPersonID: string;
  teamMemberTeamAssignmentID: number;
}

export interface TeamRoleDTO {
  roleTypes: any[];
  team: TeamDTO;
  teamMemberTeamAssignment: TeamMemberTeamAssignment;
}