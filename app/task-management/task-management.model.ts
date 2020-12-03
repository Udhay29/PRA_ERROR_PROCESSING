import {
  TeamMemberTaskAssignmentRoleAssociationDTO,
  TaskAssignmentResponsibilityGroupDTO,
  TaskAssignmentResponsibilityDetailDTO,
  TaskDTO,
} from './task-management.dto';
import { localTimeString } from '../shared/javaLocalTime';

export class DatagridSearchReponse {
  assignmentTitle: string;
  taskCategory: string;
  workTypes: string[];
  workValues: string[];
  responsibleTeams: any[];
  taskAssignmentID: number;
  status: string;

  workAssignPopOverMsg = 'Work Assignment is the way to funnel work down to your employees.' +
    'For Example: John Doe will only see appointments that need to be set for Frito Lay Orders';

  constructor(source: any) {
    this.assignmentTitle = source.taskAssignmentName;
    this.taskCategory = source.taskGroupName;
    this.workTypes = this.validateWork(source.taskAssignmentResponsibilityGroupDTOs, 'taskResponsibilityTypeDescription');
    this.workValues = this.validateWork(source.taskAssignmentResponsibilityGroupDTOs, 'taskAssignmentResponsibilityDetailValueDesc');
    this.responsibleTeams = this.validateResponsibleTeam(source.teamMemberTaskAssignmentRoleAssociationDTOs);
    this.status = source.expirationTimestamp === '2099-12-31T23:59:59' ? 'Active' : 'Inactive';
    this.taskAssignmentID = source.taskAssignmentID;
  }

  validateWork(taskAssignmentResponsibilityGroupDTOs: Array<any> | undefined, key: string): string[] {
    const response: string[] = [];
    if (taskAssignmentResponsibilityGroupDTOs) {
      taskAssignmentResponsibilityGroupDTOs.map(item => {
        item.taskAssignmentResponsibilityDetailDTOs.map((details: any) => {
          if (details[key]) {
            response.push(details[key]);
          }
        });
      });
    }
    return response;
  }

  validateResponsibleTeam(teamMemberTaskAssignmentRoleAssociationDTOs: Array<any> | undefined): string[] {
    const response: string[] = [];
    if (teamMemberTaskAssignmentRoleAssociationDTOs) {
      teamMemberTaskAssignmentRoleAssociationDTOs.map((teamMember: any) => {
        response.push(teamMember.teamName);
      });
    }
    return response.filter((v, i, a) => a.indexOf(v) === i);
  }
}

export const dataGridFields: string[] = [
  'taskAssignmentName',
  'expirationTimestamp',
  'taskGroupName',
  'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskAssignmentResponsibilityDetailValueDesc',
  'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskResponsibilityTypeDescription',
  'teamMemberTaskAssignmentRoleAssociationDTOs.teamName',
  'taskAssignmentID'
];

export const searchFields: string[] = [
  'taskAssignmentName^2',
  'taskGroupName',
  'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskAssignmentResponsibilityDetailValueDesc^2',
  'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskResponsibilityTypeDescription',
  'teamMemberTaskAssignmentRoleAssociationDTOs.teamName'
];

export interface SortingParams {
  sortKey: string;
  sortOrder: string;
  mode?: string;
}

export class TaskSortQuery {
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
      case 'assignmentTitle':
        return 'taskAssignmentName.keyword';
      case 'taskCategory':
        return 'taskGroupName.keyword';
      default:
        return 'invalid sort key';
    }
  }
}

export class TaskDetail {
  assignmentTitle: string;
  responsibleTeams: any[] = [];
  taskCategory: { taskCategoryName: string, taskCategoryId: number };
  taskAssignmentStatus: string;
  workAssignments: any[] = [];
  expiredWorkAssignments: any[] = [];
  assignedTo: any[] = [];
  expiredAssignedTo: any[] = [];
  id: number;
  updatedOn: string;
  updatedBy: string;
  createdOn: string;
  createdBy: string;
  effectiveTimestamp: any;
  expirationTimestamp: any;
  taskAssignmentResponsibilityEffectiveTimestamp: any;
  taskAssignmentResponsibilityExpirationTimestamp: any;
  taskAssignmentResponsibilityGroupID: number;
  groupID: number;

  constructor(source?: any) {
    if (!source) {
      return this;
    }
    this.id = source.taskAssignmentID;
    this.groupID = source.taskGroupDTO.taskGroupID;
    this.assignmentTitle = source.taskAssignmentName;
    this.responsibleTeams = TaskDetail.getResponsibleTeams(source.teamMemberTaskAssignmentRoleAssociationDTOs);
    this.taskCategory = { taskCategoryName: source.taskGroupName, taskCategoryId: source.taskGroupID };
    this.taskAssignmentStatus = source.expirationTimestamp === '2099-12-31T23:59:59' ? 'Active' : 'Inactive';
    this.effectiveTimestamp = source.effectiveTimestamp;
    this.expirationTimestamp = source.expirationTimestamp;
    this.updatedOn = source.lastUpdateTimestamp;
    this.updatedBy = source.lastUpdateUserID;
    this.createdOn = source.createTimestamp;
    this.createdBy = source.createUserID;

    source.taskAssignmentResponsibilityGroupDTOs.forEach((groupDTO: TaskAssignmentResponsibilityGroupDTO) => {
      groupDTO.taskAssignmentResponsibilityDetailDTOs.forEach((detailDTO: TaskAssignmentResponsibilityDetailDTO) => {
        this.workAssignments.push({
          taskResponsibilityTypeDescription: {
            description: detailDTO.taskResponsibilityTypeDescription,
            associationId: detailDTO.taskGroupTaskResponsibilityTypeAssociationID
          },
          taskAssignmentResponsibilityDetail: {
            label: detailDTO.taskAssignmentResponsibilityDetailValueDesc,
            value: detailDTO.taskAssignmentResponsibilityDetailValue,
            effectiveTimestamp: detailDTO.effectiveTimestamp,
            expirationTimestamp: detailDTO.expirationTimestamp,
            id: detailDTO.taskAssignmentResponsibilityDetailID
          }
        });
      });
      this.taskAssignmentResponsibilityEffectiveTimestamp = groupDTO.effectiveTimestamp;
      this.taskAssignmentResponsibilityExpirationTimestamp = groupDTO.expirationTimestamp;
      this.taskAssignmentResponsibilityGroupID = groupDTO.taskAssignmentResponsibilityGroupID;
    });
    this.assignedTo = source.teamMemberTaskAssignmentRoleAssociationDTOs
      .map((team: TeamMemberTaskAssignmentRoleAssociationDTO) => {
        return {
          roleAssociation: { roleTypeAssocId: team.taskGroupRoleTypeAssociationID, name: team.roleTypeName },
          assignee: { id: team.teamTeamMemberId, name: team.teamMemberName || team.teamName },
          effectiveTimestamp: team.effectiveTimestamp,
          expirationTimestamp: team.expirationTimestamp,
          taskAssignmentID: team.taskAssignmentID,
          teamID: team.teamID,
          teamMemberTaskAssignmentRoleAssociationID: team.teamMemberTaskAssignmentRoleAssociationID,
          alternateRoleIndicator: team.alternateRoleIndicator
        };
      });
  }

  static getResponsibleTeams(dtos: TeamMemberTaskAssignmentRoleAssociationDTO[]): any[] {
    const teams = [];
    if (!dtos) {
      return teams;
    }
    dtos.forEach((dto: TeamMemberTaskAssignmentRoleAssociationDTO) => {
      if (dto.teamName != null) {
        teams.push({
          teamName: dto.teamName,
          teamID: dto.teamID
        });
      }
    });

    return teams.sort().filter((v, i, a) => {
      return a.map(mapObj => mapObj.teamID).indexOf(v.teamID) === i;
    });
  }

  toDTO(): TaskDTO {
    const taskGroupTaskResponsibilityTypeAssociationDTOs: TaskAssignmentResponsibilityDetailDTO[] = [];
    // unexpired
    if (this.workAssignments && this.workAssignments.length > 0) {
      this.workAssignments.forEach(workAssign => {
        taskGroupTaskResponsibilityTypeAssociationDTOs.push({
          taskAssignmentResponsibilityDetailValue: workAssign.taskAssignmentResponsibilityDetail.value,
          taskGroupTaskResponsibilityTypeAssociationID: workAssign.taskResponsibilityTypeDescription.associationId,
          effectiveTimestamp: workAssign.taskAssignmentResponsibilityDetail.effectiveTimestamp || localTimeString(),
          expirationTimestamp: workAssign.taskAssignmentResponsibilityDetail.expirationTimestamp || '2099-12-31T23:59:59.0000000',
          taskAssignmentResponsibilityDetailID: workAssign.taskAssignmentResponsibilityDetail.id || null
        });
      });
    }
    // expired
    if (this.expiredWorkAssignments && this.expiredWorkAssignments.length > 0) {
      this.expiredWorkAssignments.forEach(expired => {
        if (expired.taskAssignmentResponsibilityDetail.id) {
          const mapped = {
            taskAssignmentResponsibilityDetailValue: expired.taskAssignmentResponsibilityDetail.value,
            taskGroupTaskResponsibilityTypeAssociationID: expired.taskResponsibilityTypeDescription.associationId,
            effectiveTimestamp: expired.taskAssignmentResponsibilityDetail.effectiveTimestamp,
            expirationTimestamp: localTimeString(),
            taskAssignmentResponsibilityDetailID: expired.taskAssignmentResponsibilityDetail.id
          };
          if (!existsInWorkAssignment(mapped, taskGroupTaskResponsibilityTypeAssociationDTOs)) {
            taskGroupTaskResponsibilityTypeAssociationDTOs.push(mapped);
          }
        }
      });
    }

    let teamMemberTaskAssignmentRoleAssociationDTOs: TeamMemberTaskAssignmentRoleAssociationDTO[] = [];
    // unexpired
    if (this.assignedTo && this.assignedTo.length > 0) {
      teamMemberTaskAssignmentRoleAssociationDTOs = this.assignedTo.map(assign => ({
        alternateRoleIndicator: assign.alternateRoleIndicator || 'N',
        taskGroupRoleTypeAssociationID: assign.roleAssociation.roleTypeAssocId,
        teamTeamMemberId: assign.assignee.id,
        effectiveTimestamp: assign.effectiveTimestamp || localTimeString(),
        expirationTimestamp: assign.expirationTimestamp || '2099-12-31T23:59:59.0000000',
        teamMemberTaskAssignmentRoleAssociationID: assign.teamMemberTaskAssignmentRoleAssociationID || null,
        teamID: assign.teamID || null
      }));
    }
    // expired
    if (this.expiredAssignedTo && this.expiredAssignedTo.length > 0) {
      this.expiredAssignedTo.forEach(expired => {
        if (expired.teamMemberTaskAssignmentRoleAssociationID) {
          const mapped = {
            alternateRoleIndicator: expired.alternateRoleIndicator || 'N',
            taskGroupRoleTypeAssociationID: expired.roleAssociation.roleTypeAssocId,
            teamTeamMemberId: expired.assignee.id,
            effectiveTimestamp: expired.effectiveTimestamp || localTimeString(),
            expirationTimestamp: localTimeString(),
            teamMemberTaskAssignmentRoleAssociationID: expired.teamMemberTaskAssignmentRoleAssociationID,
            teamID: expired.teamID ? expired.teamID : null
          };
          if (!existsInAssignedTo(mapped, teamMemberTaskAssignmentRoleAssociationDTOs)) {
            teamMemberTaskAssignmentRoleAssociationDTOs.push(mapped);
          }
        }
      });
    }

    return {
      taskAssignmentID: this.id ? this.id : null,
      taskAssignmentName: this.assignmentTitle,
      taskGroupID: this.taskCategory.taskCategoryId,
      effectiveTimestamp: this.effectiveTimestamp ? this.effectiveTimestamp : localTimeString(),
      expirationTimestamp: this.expirationTimestamp ? this.expirationTimestamp : '2099-12-31T23:59:59.0000000',
      teamMemberTaskAssignmentRoleAssociationDTOs: teamMemberTaskAssignmentRoleAssociationDTOs,
      taskAssignmentResponsibilityGroupDTOs: [{
        effectiveTimestamp: this.taskAssignmentResponsibilityEffectiveTimestamp || localTimeString(),
        expirationTimestamp: this.taskAssignmentResponsibilityExpirationTimestamp || '2099-12-31T23:59:59.0000000',
        taskAssignmentResponsibilityGroupID: this.taskAssignmentResponsibilityGroupID || null,
        taskAssignmentResponsibilityDetailDTOs: taskGroupTaskResponsibilityTypeAssociationDTOs
      }],
      teamMemberIDs: []
    };
  }
}

function existsInAssignedTo(map: TeamMemberTaskAssignmentRoleAssociationDTO, dtos: TeamMemberTaskAssignmentRoleAssociationDTO[]) {
  return dtos.some(dto => (dto.teamTeamMemberId === map.teamTeamMemberId) &&
    (dto.taskGroupRoleTypeAssociationID === map.taskGroupRoleTypeAssociationID));
}

function existsInWorkAssignment(map: TaskAssignmentResponsibilityDetailDTO, dtos: TaskAssignmentResponsibilityDetailDTO[]) {
  return dtos.some(dto => (dto.taskAssignmentResponsibilityDetailValue === map.taskAssignmentResponsibilityDetailValue) &&
    (dto.taskGroupTaskResponsibilityTypeAssociationID === map.taskGroupTaskResponsibilityTypeAssociationID));
}
