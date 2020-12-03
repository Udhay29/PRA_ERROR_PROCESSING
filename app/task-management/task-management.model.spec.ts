import { DatagridSearchReponse, TaskSortQuery, SortingParams, TaskDetail } from './task-management.model';

describe('DatagridSearchResponse', () => {
    let model: DatagridSearchReponse;
    const source = {
        taskAssignmentName: 'task name',
        taskGroupName: 'task group name',
        expirationTimestamp: '2099-12-31T23:59:59',
        taskAssignmentID: '1'
    };

    it('should create an instance', () => {
        model = new DatagridSearchReponse(source);
        expect(model).toBeTruthy();
        expect(model.status).toBe('Active');
    });

    it('should create an inactive model', () => {
        model = new DatagridSearchReponse({expirationTimestamp: ''});
        expect(model.status).toBe('Inactive');
    });

    it('should validate responsibility group dtos', () => {
        model = new DatagridSearchReponse({});
        const workItem = {
            taskAssignmentResponsibilityDetailDTOs: [{test: 'this is a test'}]
        };
        const validatedWork = model.validateWork([workItem], 'test');
        expect(validatedWork.length).toEqual(1);
        expect(validatedWork).toEqual(['this is a test']);
    });

    it('should validate responsibility group dtos when the key does not exist', () => {
        model = new DatagridSearchReponse({});
        const workItem = {
            taskAssignmentResponsibilityDetailDTOs: [{test: 'this is a test'}]
        };
        const validatedWork = model.validateWork([workItem], 'testtest');
        expect(validatedWork.length).toEqual(0);
        expect(validatedWork).toEqual([]);
    });

    it('should validate undefined responsibility group dtos', () => {
        model = new DatagridSearchReponse({});
        const validatedWork = model.validateWork(undefined, 'test');
        expect(validatedWork.length).toEqual(0);
        expect(validatedWork).toEqual([]);
    });

    it('should validateteams', () => {
        model = new DatagridSearchReponse({});
        const roleAssociations = [
            {teamName: 'z team'},
            {teamName: 'b team'},
            {teamName: 'a team'}
        ];
        const validatedTeam = model.validateResponsibleTeam(roleAssociations);
        expect(validatedTeam).toEqual(['z team', 'b team', 'a team']);
    });

    it('should validate undefined teams', () => {
        model = new DatagridSearchReponse({});
        const validatedTeam = model.validateResponsibleTeam(undefined);
        expect(validatedTeam.length).toEqual(0);
        expect(validatedTeam).toEqual([]);
    });

});

describe('TaskSortQuery', () => {
    const model: TaskSortQuery = new TaskSortQuery();

    it('should create a model', () => {
        expect(model).toBeTruthy();
    });

    it('should build an assignmentTitle sort query', () => {
        const sortingParams: SortingParams = {
            sortKey: 'assignmentTitle',
            sortOrder: 'order'
        };
        const result = TaskSortQuery.buildSortQuery(sortingParams);
        expect(result['taskAssignmentName.keyword']).toEqual({order: 'order', mode: 'min'});
    });

    it('should build an assignmentTitle sort query', () => {
        const sortingParams: SortingParams = {
            sortKey: 'taskCategory',
            sortOrder: 'order',
            mode: 'mode'
        };
        const result = TaskSortQuery.buildSortQuery(sortingParams);
        expect(result['taskGroupName.keyword']).toEqual({order: 'order', mode: 'mode'});
    });

    it('should handle an invalid sort query', () => {
        const sortingParams: SortingParams = {
            sortKey: 'key',
            sortOrder: 'order'
        };
        const result = TaskSortQuery.buildSortQuery(sortingParams);
        expect(result['invalid sort key']).toEqual({order: 'order', mode: 'min'});
    });


});

describe('TaskDetail', () => {
    let model: TaskDetail;
    let source;
    beforeEach(() => {
        source = {
            taskAssignmentID: 1,
            taskAssignmentName: 'title',
            taskGroupName: 'group name',
            taskGroupID: 1,
            expirationTimestamp: '2099-12-31T23:59:59',
            effectiveTimestamp: '2019-05-16T23:59:59',
            lastUpdateTimestamp: '2019-05-16T23:59:59',
            lastUpdateUserID: 'jisa',
            createTimestamp: '2019-05-16T23:59:59',
            createUserID: 'jisa',
            taskGroupDTO: {
                taskGroupID: 1
            },
            taskAssignmentResponsibilityGroupDTOs: [
                {
                    taskAssignmentResponsibilityDetailDTOs: [
                        {
                            taskResponsibilityTypeDescription: 'type description',
                            taskGroupTaskResponsibilityTypeAssociationID: 1,
                            taskAssignmentResponsibilityDetailValueDesc: 'detail value desc',
                            taskAssignmentResponsibilityDetailValue: 'detail value',
                            effectiveTimestamp: '2019-05-16T23:59:59',
                            expirationTimestamp: '2099-12-31T23:59:59',
                            taskAssignmentResponsibilityDetailID: 1
                        }
                    ],
                    effectiveTimestamp: '2019-05-16T23:59:59',
                    expirationTimestamp: '2099-12-31T23:59:59',
                    taskAssignmentResponsibilityGroupID: 1
                }
            ],
            teamMemberTaskAssignmentRoleAssociationDTOs: [{
                taskGroupRoleTypeAssociationID: 1,
                teamMemberName: 'name',
                teamName: 'team name',
                effectiveTimestamp: '2019-05-16T23:59:59',
                expirationTimestamp: '2099-12-31T23:59:59',
                taskAssignmentID: 1,
                teamID: 1,
                teamMemberTaskAssignmentRoleAssociationID: 1,
                alternateRoleIndicator: 'N'
            }]
        };
    });

    it('should create a model', () => {
        model = new TaskDetail(source);
        expect(model).toBeTruthy();
    });

    it('should create a model with no source', () => {
        model = new TaskDetail();
        expect(model).toBeTruthy();
    });

    it('should create an inactive model with no team member', () => {
        source.expirationTimestamp = '';
        model = new TaskDetail(source);
        expect(model.taskAssignmentStatus).toEqual('Inactive');
    });

    it('should get the responsible team', () => {
        model = new TaskDetail(source);
        expect(model.responsibleTeams.length).toEqual(1);
        expect(model.responsibleTeams).toEqual([{teamName: 'team name', teamID: 1}]);
    });

    it('should handle null responsible team', () => {
        source.teamMemberTaskAssignmentRoleAssociationDTOs = [{
            taskGroupRoleTypeAssociationID: 1,
            teamMemberName: 'name',
            effectiveTimestamp: '2019-05-16T23:59:59',
            expirationTimestamp: '2099-12-31T23:59:59',
            taskAssignmentID: 1,
            teamID: 1,
            teamMemberTaskAssignmentRoleAssociationID: 1,
            alternateRoleIndicator: 'N'
        }];
        model = new TaskDetail(source);
        expect(model.responsibleTeams.length).toEqual(0);
        expect(model.responsibleTeams).toEqual([]);
    });

    it('should turn model into a dto', () => {
        model = new TaskDetail(source);
        const dto = model.toDTO();
        expect(dto).toBeTruthy();
        expect(dto.taskAssignmentID).toEqual(source.taskAssignmentID);
        expect(dto.taskAssignmentName).toEqual(source.taskAssignmentName);
        expect(dto.taskGroupID).toEqual(1);

        dto.taskAssignmentResponsibilityGroupDTOs.forEach( group => {
            group.taskAssignmentResponsibilityDetailDTOs.forEach( detail => {
                expect(detail.expirationTimestamp).toEqual('2099-12-31T23:59:59');
            });
        });
        dto.teamMemberTaskAssignmentRoleAssociationDTOs.forEach( role => {
            expect(role.expirationTimestamp).toEqual('2099-12-31T23:59:59');
        });
    });

    it('should turn new model into a dto', () => {
        let workAssignEffective;
        let assignToEffective;
       model = new TaskDetail(source);
       model.id = null;
       model.effectiveTimestamp = null;
       model.expirationTimestamp = null;
       model.taskAssignmentResponsibilityEffectiveTimestamp = null;
       model.taskAssignmentResponsibilityExpirationTimestamp = null;
       model.taskAssignmentResponsibilityGroupID = null;

        model.workAssignments.forEach(workAssignment => {
            workAssignEffective = workAssignment.taskAssignmentResponsibilityDetail.effectiveTimestamp;
            workAssignment.taskAssignmentResponsibilityDetail.effectiveTimestamp = null;
            workAssignment.taskAssignmentResponsibilityDetail.expirationTimestamp = null;
            workAssignment.taskAssignmentResponsibilityDetail.id = null;
        });

       model.assignedTo.forEach(assignTo => {
            assignToEffective = assignTo.effectiveTimestamp;
           assignTo.alternateRoleIndicator = null;
           assignTo.effectiveTimestamp = null;
           assignTo.expirationTimestamp = null;
           assignTo.teamMemberTaskAssignmentRoleAssociationID  = null;
           assignTo.teamID = null;
       });
       const dto = model.toDTO();
       expect(dto.taskAssignmentID).toEqual(null);

       dto.taskAssignmentResponsibilityGroupDTOs.forEach( group => {
            group.taskAssignmentResponsibilityDetailDTOs.forEach( detail => {
                expect(detail.effectiveTimestamp).not.toEqual(workAssignEffective);
                expect(detail.expirationTimestamp).toEqual('2099-12-31T23:59:59.0000000');
                expect(detail.taskAssignmentResponsibilityDetailID).toEqual(null);
            });
        });
        dto.teamMemberTaskAssignmentRoleAssociationDTOs.forEach( role => {
            expect(role.alternateRoleIndicator).toEqual('N');
            expect(role.effectiveTimestamp).not.toEqual(assignToEffective);
            expect(role.expirationTimestamp).toEqual('2099-12-31T23:59:59.0000000');
            expect(role.teamMemberTaskAssignmentRoleAssociationID).toEqual(null);
            expect(role.teamID).toEqual(null);
        });
    });

    it('should turn a model with expired work assignments into a dto', () => {
        model = new TaskDetail(source);
        model.expiredWorkAssignments = model.workAssignments;
        model.workAssignments = null;
        const dto = model.toDTO();
        dto.taskAssignmentResponsibilityGroupDTOs.forEach( group => {
            group.taskAssignmentResponsibilityDetailDTOs.forEach( detail => {
                expect(detail.expirationTimestamp).not.toEqual('2099-12-31T23:59:59.0000000');
            });
        });
    });

    it('should turn a model with expired assignedTos into a dto', () => {
        model = new TaskDetail(source);
        model.expiredAssignedTo = model.assignedTo;
        model.assignedTo = null;
        const dto = model.toDTO();
        dto.teamMemberTaskAssignmentRoleAssociationDTOs.forEach( role => {
            expect(role.expirationTimestamp).not.toEqual('2099-12-31T23:59:59.0000000');
        });
    });

});
