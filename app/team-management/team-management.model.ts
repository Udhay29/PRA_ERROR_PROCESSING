import {
  TeamRoleDTO,
  TeamMemberTeamAssignment,
  TeamDTO,
  TeamPersonDTO,
  TeamProfileDTO
} from './team-management-dto';
import { Employee, TeamEmployee } from '../employees/employees.model';
import * as moment from 'moment-timezone';
import {TitleCasePipe} from '@angular/common';

export class DataGridSearchResponse {
  teamName: string;
  taskCategory: string;
  teamLeader: string;
  numberOfMembers: number;
  status: string;
  createdBy: string;
  updatedBy: string;
  lastUpdateTimestamp: moment.Moment;
  teamID: number;

  constructor(source: any) {
    this.teamName = source.teamName;
    this.taskCategory = source.taskGroupNames != null ? source.taskGroupNames.join(', ') : null;
    const teamLeaderFirstName = source.teamLeaderPreferredName
      ? (source.teamLeaderPreferredName)
      : '';
    const teamLeaderLastName = source.teamLeaderLastName
      ? source.teamLeaderLastName
      : '';
    this.teamLeader = TitleCasePipe.prototype.transform(`${teamLeaderFirstName} ${teamLeaderLastName}`);
    this.numberOfMembers = Number(source.numberOfMembers ? source.numberOfMembers : 0);
    this.status = moment().isBefore(source.expirationTimestamp) ? 'Active' : 'Inactive';
    const createdByFirstName = source.teamLeaderPreferredName
      ? source.createdPreferredName
      : '';
    const createdByLastName = source.teamLeaderLastName
      ? source.createdLastName
      : '';
    this.createdBy = TitleCasePipe.prototype.transform(`${createdByFirstName} ${createdByLastName}`);
    const updatedByFirstName = source.lastUpdatedPreferredName
      ? source.teamLeaderPreferredName
      : '';
    const updatedByLastName = source.lastUpdatedLastName
      ? source.teamLeaderLastName
      : '';
    this.updatedBy = TitleCasePipe.prototype.transform(`${updatedByFirstName} ${updatedByLastName}`);
    this.lastUpdateTimestamp = moment(source.lastUpdateTimestamp).tz('America/Chicago').format('MM/DD/YYYY HH:mm z');
    this.teamID = source.teamID;
  }
}

export const dataGridFields: string[] = [
  'teamName',
  'expirationTimestamp',
  'taskGroupName',
  'teamLeaderPersonFirstName, teamLeaderPersonLastName',
  'teamMemberCount',
  'teamID'
];

export const searchFields: string[] = [
  'teamName^2',
  'taskGroupName',
  'teamLeaderPersonFirstName, teamLeaderPersonLastName^2'
];

export const sortFields: any = {
  name: 'teamName',
  members: 'numberOfMember',
  updatedDateAndTime: 'lastUpdateTimestamp'
};

export interface SortingParams {
  sortKey: string;
  sortOrder: string;
  mode?: string;
}

export class TeamDetail {
  teamName: string;
  teamLeader: string;
  teamLeaderPersonID: string;
  teamLeaderUserID: string;
  teamStatus: string;
  updatedOn: string;
  updatedBy: string;
  createdOn: string;
  createdBy: string;
  taskCount: number;
  taskList: TeamProfileDTO[];
  teamMembers: TeamEmployee[];

  teamID: string;
  teamLeaderTitle: string;
  teamEffectiveTimestamp: string;
  teamExpirationTimestamp: string;
  taskAssignments: any[];

  constructor(source: TeamDTO) {
    this.taskAssignments = [];
    this.teamName = source.teamName;
    const teamLeaderFirstName = source.teamLeaderPersonFirstName
      ? source.teamLeaderPersonFirstName
      : '';
    const teamLeaderlastName = source.teamLeaderPersonLastName
      ? source.teamLeaderPersonLastName
      : '';
    this.teamLeader = `${teamLeaderFirstName} ${teamLeaderlastName}`;
    this.teamLeaderPersonID = source.teamLeaderPersonID;
    this.teamLeaderTitle = source.teamLeaderTitle;
    this.teamLeaderUserID = !source.teamPersonDTOs.find(
      personDTO => personDTO.personEmployeeID === this.teamLeaderPersonID
    )
      ? null
      : source.teamPersonDTOs.find(
        personDTO => personDTO.personEmployeeID === this.teamLeaderPersonID
      ).userID;
    if (this.teamLeaderUserID === null) {
      this.teamLeaderUserID = '---';
    } else {
      this.teamLeaderUserID = source.teamPersonDTOs.find(
        personDTO => personDTO.personEmployeeID === this.teamLeaderPersonID
      ).userID;
    }
    const expirationDate = new Date(source.teamExpirationTimestamp);
    const currentDate = new Date();
    this.teamStatus = currentDate <= expirationDate ? 'Active' : 'Inactive';
    this.teamID = source.teamID ? source.teamID.toString() : undefined;
    this.updatedOn = source.updatedOn;
    this.updatedBy = source.updatedBy;
    this.createdOn = source.createdOn;
    this.createdBy = source.createdBy;
    this.taskList = source.teamProfileDTOs ? source.teamProfileDTOs.filter(
      (entry: TeamProfileDTO) => entry.personEmployeeID === null
    ) : undefined;
    this.taskCount = this.taskList ? this.taskList.length : undefined;
    this.teamEffectiveTimestamp = source.teamEffectiveTimestamp;
    this.teamExpirationTimestamp = source.teamExpirationTimestamp;
    this.teamMembers = source.teamPersonDTOs.map(
      (teamPerson: TeamPersonDTO) => {
        const employee: TeamEmployee = new TeamEmployee();
        employee.emplid = +teamPerson.personEmployeeID;
        employee.personEmployeeID = teamPerson.personEmployeeID;
        employee.firstName = teamPerson.firstName;
        employee.lastName = teamPerson.lastName;
        employee.preferredName = teamPerson.preferredName;
        employee.title = teamPerson.title;
        employee.userName = teamPerson.userID;
        employee.taskCount = teamPerson.taskCount;
        employee.teamMemberPersonID = teamPerson.teamMemberPersonID;
        employee.teamAssignmentEffectiveTimestamp =
          teamPerson.teamAssignmentEffectiveTimestamp;
        employee.teamAssignmentExpirationTimestamp =
          teamPerson.teamAssignmentExpirationTimestamp;
        return employee;
      }
    );

    if (source.teamProfileDTOs) {
      source.teamProfileDTOs.forEach(profile => {
        this.taskAssignments.push(profile);
      });
    }
  }
}

export class TeamMember {
  personId: string;
  assignmentId: number;

  static fromTeamMemberTeamAssignment(
    tmta: TeamMemberTeamAssignment
  ): TeamMember {
    const teamMember: TeamMember = new TeamMember();
    teamMember.personId = tmta.teamMemberPersonID;
    teamMember.assignmentId = tmta.teamMemberTeamAssignmentID;
    return teamMember;
  }
}

export class TeamMemberSaveDTO {
  personEmployeeID: string;
  teamMemberName?: string;
  addedAsLeader?: boolean;
  teamMemberPersonID?: number;
  teamAssignmentEffectiveTimestamp?: string;
  teamAssignmentExpirationTimestamp?: string;
}

export class Team {
  id: number;
  name: string;
  leaderId: string;
  members: TeamMember[];
  expirationTimestamp: string;

  constructor(source?: any) {
    if (!source) {
      return this;
    }
    this.id = source.id;
    this.name = source.name;
    this.leaderId = source.leaderId;
    this.members = source.members;
  }

  static fromTeamDto(dto: TeamDTO): Team {
    const team: Team = new Team();
    team.id = +dto.teamID;
    team.name = dto.teamName;
    team.leaderId = dto.teamLeaderPersonID;
    team.expirationTimestamp = dto.expirationTimestamp;
    return team;
  }

  static fromTeamRoleDto(trdto: TeamRoleDTO): Team {
    const team: Team = this.fromTeamDto(trdto.team);
    team.members = [
      TeamMember.fromTeamMemberTeamAssignment(trdto.teamMemberTeamAssignment)
    ];
    trdto.team.teamMemberTeamAssignments.forEach(
      (tmta: TeamMemberTeamAssignment | number) => {
        if (isTmta(tmta)) {
          team.members.push(TeamMember.fromTeamMemberTeamAssignment(tmta));
        }

        function isTmta(
          thing: TeamMemberTeamAssignment | number
        ): thing is TeamMemberTeamAssignment {
          return (thing as TeamMemberTeamAssignment).teamID !== null;
        }
      }
    );
    return team;
  }
}
