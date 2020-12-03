import {
  Team,
  TeamDetail,
  DataGridSearchResponse
} from './team-management.model';
import { TeamDTO, TeamPersonDTO, TeamProfileDTO } from './team-management-dto';
import * as moment from 'moment-timezone';

class Mocks {
  static makeMockTeamDTO(id: number, name: string): TeamDTO {
    return {
      teamID: id,
      teamName: name,
      teamLeaderPersonID: '1234',
      teamMemberTeamAssignments: [
        {
          '@id': id,
          teamID: id,
          teamMemberPersonID: '1234',
          teamMemberTeamAssignmentID: id
        }
      ],
      teamPersonDTOs: [Mocks.makeMockTeamPersonDTO('1234')]
    };
  }

  static makeMockTeamPersonDTO(id: string): TeamPersonDTO {
    return {
      personEmployeeID: id
    };
  }

  static makeMockTeamProfileDTO(
    userId: string,
    emplId: string,
    teamName: string
  ): TeamProfileDTO {
    return {
      userID: userId,
      personEmployeeID: emplId,
      firstName: 'first',
      lastName: 'last',
      preferredName: 'pref',
      teamName: teamName,
      title: 'title',
      taskAssignmentID: 1,
      taskAssignmentName: 'task',
      taskGroupID: 'groupId',
      taskGroupName: 'groupName',
      roleTypeCode: 'roleCode',
      taskAssignmentResponsibilityGroupDTOs: []
    };
  }
}

describe('TeamManagementModel', () => {
  it('should instantiate a new TeamDetail', () => {
    const mockTeamDTO = Mocks.makeMockTeamDTO(1, 'Some Team');
    (mockTeamDTO.teamLeaderPersonFirstName = 'leaderFirst'),
      (mockTeamDTO.teamLeaderPersonLastName = 'leaderLast'),
      (mockTeamDTO.teamExpirationTimestamp = '2099-12-31T23:59:00');
    mockTeamDTO.teamProfileDTOs = [
      Mocks.makeMockTeamProfileDTO('123abc', '1234', mockTeamDTO.teamName)
    ];
    const testTeam = new TeamDetail(mockTeamDTO);
    expect(testTeam.teamName).toBe(mockTeamDTO.teamName);
    expect(+testTeam.teamID).toBe(mockTeamDTO.teamID);
    expect(testTeam.teamLeader).toBe(
      `${mockTeamDTO.teamLeaderPersonFirstName} ${
        mockTeamDTO.teamLeaderPersonLastName
      }`
    );
    expect(testTeam.teamMembers[0].emplid).toBe(
      +mockTeamDTO.teamProfileDTOs[0].personEmployeeID
    );
    expect(testTeam.teamStatus).toBe('Active');
  });

  it('should instantiate a new TeamDetail with default values', () => {
    const mockTeamDTO = Mocks.makeMockTeamDTO(1, 'Some Team');
    mockTeamDTO.teamProfileDTOs = [
      Mocks.makeMockTeamProfileDTO('123abc', '1234', mockTeamDTO.teamName)
    ];
    mockTeamDTO.teamPersonDTOs = [];
    const testTeam = new TeamDetail(mockTeamDTO);
    expect(testTeam.teamName).toBe(mockTeamDTO.teamName);
    expect(+testTeam.teamID).toBe(mockTeamDTO.teamID);
    expect(testTeam.teamLeader).toBe(' ');
    expect(testTeam.teamMembers).toEqual([]);
    expect(testTeam.teamLeaderUserID).toBe('---');
  });

  it('should create a new DataGridSearchResponse', () => {
    const mockSource = {
      teamName: 'Some Team',
      taskGroupNames: ['groupName1', 'groupName2'],
      expirationTimestamp: moment('2099-12-31T23:59:00'),
      teamLeaderPreferredName: 'leaderFirst',
      teamLeaderLastName: 'leaderLast',
      numberOfMembers: 1,
      teamID: 1
    };
    const searchResponse = new DataGridSearchResponse(mockSource);
    expect(searchResponse.teamName).toBe(mockSource.teamName);
    expect(searchResponse.taskCategory).toBe(mockSource.taskGroupNames.join(', '));
    expect(searchResponse.status).toBe('Active');
    expect(searchResponse.teamLeader).toBe(
      `Leaderfirst Leaderlast`
    );
    expect(searchResponse.numberOfMembers).toBe(mockSource.numberOfMembers);
    expect(searchResponse.teamID).toBe(mockSource.teamID);
  });

  it('should create a new DataGridSearchResponse with default values', () => {
    const mockSource = {
      teamID: 1,
      teamName: 'Some Team',
      taskGroupNames: ['groupName1', 'groupName2']
    };
    const searchResponse = new DataGridSearchResponse(mockSource);
    expect(searchResponse.teamName).toBe(mockSource.teamName);
    expect(searchResponse.taskCategory).toBe(mockSource.taskGroupNames.join(', '));
    expect(searchResponse.status).toBe('Inactive');
    expect(searchResponse.teamLeader).toBe(' ');
    expect(searchResponse.numberOfMembers).toBe(0);
    expect(searchResponse.teamID).toBe(mockSource.teamID);
  });

  it('should instantiate a new Team', () => {
    const mockSource = {
      id: 1,
      name: 'SomeTeam',
      leaderId: '1234',
      members: [
        { personId: '1', assignmentId: 1 },
        { personId: '2', assignmentId: 2 }
      ]
    };
    const testTeam = new Team(mockSource);
    expect(testTeam.id).toBe(mockSource.id);
    expect(testTeam.name).toBe(mockSource.name);
    expect(testTeam.leaderId).toBe(mockSource.leaderId);
    expect(testTeam.members).toEqual(mockSource.members);
  });

  it('should create a new Team from a TeamRoleDTO', () => {
    const mockTeamDTO = Mocks.makeMockTeamDTO(1, 'SomeTeam');
    const mockTeamRoleDTO = {
      team: mockTeamDTO,
      roleTypes: [],
      teamMemberTeamAssignment: {
        '@id': 1,
        teamID: 1,
        teamMemberPersonID: '1234',
        teamMemberTeamAssignmentID: 1
      }
    };
    const testTeam = Team.fromTeamRoleDto(mockTeamRoleDTO);
    expect(testTeam.id).toBe(mockTeamDTO.teamID);
    expect(testTeam.name).toBe(mockTeamDTO.teamName);
    expect(testTeam.leaderId).toBe(
      mockTeamRoleDTO.teamMemberTeamAssignment.teamMemberPersonID
    );
  });
});
