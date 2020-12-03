

export interface TeamMemberTaskAssignmentRoleAssociationDTO {
    teamMemberTaskAssignmentRoleAssociationID?: number;
    alternateRoleIndicator: string;
    taskAssignmentID?: number;
    teamID?: number;
    teamName?: string;
    teamMemberTeamAssignmentID?: number;
    teamMemberID?: string;
    teamMemberName?: string;
    taskGroupRoleTypeAssociationID: number;
    roleTypeCode?: string;
    roleTypeName?: string;
    teamTeamMemberId: string;
    effectiveTimestamp: string;
    expirationTimestamp: string;
}

export interface TaskAssignmentResponsibilityDetailDTO {
    taskAssignmentResponsibilityDetailID?: number;
    taskAssignmentResponsibilityDetailValue: string;
    taskAssignmentResponsibilityDetailValueDesc?: string;
    taskGroupTaskResponsibilityTypeAssociationID: number;
    taskResponsibilityTypeCode?: string;
    taskResponsibilityTypeDescription?: string;
    effectiveTimestamp: string;
    expirationTimestamp: string;
}

export interface TaskAssignmentResponsibilityGroupDTO {
    taskAssignmentResponsibilityGroupID?: number;
    effectiveTimestamp: string;
    expirationTimestamp: string;
    taskAssignmentResponsibilityDetailDTOs: TaskAssignmentResponsibilityDetailDTO[];
}
export interface RoleType {
    createTimestamp: string;
    createProgramName: string;
    lastUpdateTimestamp: string;
    lastUpdateProgramName: string;
    createUserId: string;
    lastUpdateUserId: string;
    roleTypeCode: string;
    roleTypeName: string;
    effectiveTimestamp: string;
    expirationTimestamp: string;
    lastUpdateTimestampString: string;
}
export interface TaskGroupRoleTypeAssociationDTO {
    taskGroupRoleTypeAssociationID: number;
    roleType: RoleType;
    effectiveTimestamp: string;
    expirationTimestamp: string;
    backupTaskAssignmentDTOList?: any;
}
export interface TaskResponsibilityType {
    createTimestamp: string;
    createProgramName: string;
    lastUpdateTimestamp: string;
    lastUpdateProgramName: string;
    createUserId: string;
    lastUpdateUserId: string;
    taskResponsibilityTypeCode: string;
    taskResponsibilityTypeDescription: string;
    effectiveTimestamp: string;
    expirationTimestamp: string;
    lastUpdateTimestampString: string;
}
export interface TaskGroupTaskResponsibilityTypeAssociationDTO {
    taskGroupTaskResponsibilityTypeAssociationID: number;
    taskResponsibilityType: TaskResponsibilityType;
    effectiveTimestamp: string;
    expirationTimestamp: string;
}
export interface TaskGroupDTO {
    taskGroupID: number;
    taskGroupName: string;
    effectiveTimestamp: string;
    expirationTimestamp: string;
    taskGroupRoleTypeAssociationDTOs: TaskGroupRoleTypeAssociationDTO[];
    taskGroupTaskResponsibilityTypeAssociationDTOs: TaskGroupTaskResponsibilityTypeAssociationDTO[];
    taskGroupValidationDTO?: any;
    roleTypeName?: any;
    taskResponsibilityTypeDescription?: any;
    eventType?: any;
}
export interface TaskDTO {
    taskAssignmentID?: number;
    orderOwnershipID?: any;
    taskAssignmentName: string;
    taskGroupID: number;
    taskGroupName?: string;
    teamMemberTaskAssignmentRoleAssociationDTOs: TeamMemberTaskAssignmentRoleAssociationDTO[];
    taskAssignmentResponsibilityGroupDTOs: TaskAssignmentResponsibilityGroupDTO[];
    taskGroupDTO?: TaskGroupDTO;
    effectiveTimestamp: string;
    expirationTimestamp: string;
    roleTypes?: any;
    employeeProfileDTOs?: any;
    eventType?: any;
    teamMemberIDs: string[];
    taskAssignmentValidationDTO?: any;
    oldOrderOwner?: any;
    newOrderOwner?: any;
    responsibilities?: any;
    responsibilitiesDetails?: any;
    teamNames?: any;
    taskGroupNameAndtaskAssignmentID?: any;
    createTimestamp?: string;
    createUserID?: string;
    lastUpdateTimestamp?: string;
    lastUpdateUserID?: string;
}

export interface TaskAssignmentDTO {
    taskAssignmentID: number;
    taskAssignmentName: string;
    taskGroupID: number;
    taskGroupName: string;
    roleTypeCode: string[];
    tastAssignmentResponsibilityGroupDTO: TaskAssignmentResponsibilityDetailDTO[];
}
