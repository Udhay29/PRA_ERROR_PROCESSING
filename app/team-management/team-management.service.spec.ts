import {TestBed} from '@angular/core/testing';

import {TeamManagementService} from './team-management.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from 'src/environments/environment.prod';
import {TeamDTO} from './team-management-dto';
import {FilterType} from '../shared/filter-panel/filter/filter.model';
import {of} from 'rxjs';
import {HttpRequest} from '@angular/common/http';

class Mocks {
  static makeElasticFilterMock(name: string, modelValue: string[]) {
    return {
      name: name,
      field: 'field',
      type: FilterType.ELASTIC,
      model: modelValue,
      searchText: 'searchText',
      selectedSearches: ['search'],
      constantTerm: '',
      splitTerms: false,
      searchMethod: () => {},
      search$: of('searchSubject'),
      isActive: () => true,
      reset: () => true
    };
  }
}

describe('TeamManagementService', () => {
  const URLS = environment.urls.teamManagment;
  let service: TeamManagementService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeamManagementService]
    });
  });

  beforeEach(() => {
    service = TestBed.get(TeamManagementService);
    backend = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
  });

  it('should send a properly formed inactivate team request', () => {
    const targetTeams = ['1', '2'];
    service.inactivateTeam(targetTeams).subscribe(request => {
      expect(request.body).toEqual(targetTeams);
    });
    const call = backend.expectOne(URLS.inactivateTeam);
    expect(call.request.method).toEqual('PATCH');
  });

  it('should send a properly formed activate team request', () => {
    const targetTeams = ['1', '2'];
    service.activateTeam(targetTeams).subscribe(request => {
      expect(request.body).toEqual(targetTeams);
    });
    const call = backend.expectOne(URLS.activateTeam);
    expect(call.request.method).toEqual('PATCH');
  });

  it('should send a properly formed save new team request', () => {
    const mockTeamDTO: TeamDTO = {
      teamName: 'SomeTeam',
      teamLeaderPersonID: '1234',
      teamPersonDTOs: []
    };
    service.saveTeam(mockTeamDTO, false).subscribe(request => {
      expect(request.body).toEqual(mockTeamDTO);
    });
    const call = backend.expectOne(URLS.createTeam);
    expect(call.request.method).toEqual('POST');
  });

  it('should send a properly formed update team request', () => {
    const mockTeamDTO: TeamDTO = {
      teamName: 'SomeTeam',
      teamLeaderPersonID: '1234',
      teamPersonDTOs: []
    };
    service.saveTeam(mockTeamDTO, true).subscribe(request => {
      expect(request.body).toEqual(mockTeamDTO);
    });
    const call = backend.expectOne(URLS.updateTeam);
    expect(call.request.method).toEqual('PATCH');
  });

  it('should send a properly formed fetch team request', () => {
    const mockResponse: TeamDTO = {
      teamName: 'team name',
      teamLeaderPersonID: '1234',
      teamPersonDTOs: []
    };
    const teamId = 1;
    const queryString = 'teamID=' + teamId;
    service.getTeamDetails(teamId).subscribe();
    const call = backend.expectOne(URLS.getTeamDetail + queryString);
    expect(call.request.method).toBe('GET');
    expect(call.request.urlWithParams).toBe(URLS.getTeamDetail + queryString);
    call.flush(mockResponse);
  });

  it('should reset the table', () => {
    service.resetTable(true);
    expect(service.onTableReset.value).toBe(true);
  });

  it('should send a properly formed team search request, based on filter criteria', () => {
    const term = 'searchTerm';
    const page = 1;
    const size = 5;
    const employeeCode = ['employee name emplId'];
    const leaderCode = ['leader name leaderId'];
    const mockSortingParams = {
      sortKey: 'sortField',
      sortOrder: 'asc'
    };
    const queryString = `page=${page}&size=${size}&sort=${mockSortingParams.sortKey},${mockSortingParams.sortOrder}` +
      `&taskGroupIDs=1,2,3&personIDs=emplId&teamLeaderPersonIDs=leaderId&activeTeamsOnly=true&inactiveTeamsOnly=false` +
      `&searchCriteria=${term}`;
    const mockFilters = [
      Mocks.makeElasticFilterMock('Status', ['activeTeamsOnly']),
      Mocks.makeElasticFilterMock('Task Category', ['1', '2', '3']),
      Mocks.makeElasticFilterMock('Employee Name', ['employee name']),
      Mocks.makeElasticFilterMock('Team Leader', ['leader name'])
    ];
    service.searchForTeams(term, page, size, mockSortingParams, mockFilters, leaderCode, employeeCode)
      .subscribe();
    const call = backend.expectOne(URLS.search + queryString);
    expect(call.request.method).toBe('GET');
  });

  it('should construct a properly formed task categories request', () => {
    const mockResponse = {
      content: [
        {taskGroupName: 'taskGroup1', taskGroupID: 123},
        {taskGroupName: 'taskGroup2', taskGroupID: 456}
      ]
    };
    service.getTaskCategoriesForFilter().subscribe();
    const call = backend.expectOne(URLS.getTaskCategories);
    expect(call.request.method).toBe('GET');
    call.flush(mockResponse);
  });

  it('should construct a properly formed employee request', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              personDTO: {prefName: 'pref', lastName: 'last', emplId: 123}
            }
          }
        ]
      }
    };
    const term = 'employeeTerm';
    service.searchForEmployeeAndTeamLeader(term).subscribe();
    const call = backend.expectOne(URLS.getfilters);
    const query = call.request.body.query;
    expect(call.request.body._source).toEqual([
      'personDTO.prefName',
      'personDTO.lastName',
      'personDTO.emplId'
    ]);
    expect(query.bool.must[0].query_string.query).toBe(term + '*');
    expect(call.request.method).toBe('POST');
    call.flush(mockResponse);
  });

  it('should construct a properly formed team name request', () => {
    const mockResponse = {
      _embedded: {
        teams: [{teamName: 'team1', teamID: 1234}]
      }
    };
    const term = 'teamNameTerm';
    service.findTeamWithNameContaining(term).subscribe();
    const call = backend.expectOne(
      (request: HttpRequest<any>) =>
        request.url === URLS.findTeamByNameContaining
    );
    expect(call.request.params.get('teamName')).toBe(term);
    expect(call.request.method).toBe('GET');
    call.flush(mockResponse);
  });

  it('should create a properly formed request to find team members by ids', () => {
    const ids = [1, 2, 3, 4];
    service.findTeamMembersByTeamIds(ids).subscribe();
    const call = backend.expectOne(
      (request: HttpRequest<any>) =>
        request.url === URLS.findTeamMembersByTeamIds
    );
    expect(call.request.method).toBe('GET');
    expect(call.request.params.get('teamIDs')).toBe(ids.join());
    call.flush({});
  });

  it('should build a properly formed tokenized query', () => {
    const result = TeamManagementService.buildTokenizedQuery('test term', ['field']);
    expect(result.bool.must[0].query_string.query).toBe('term*');
    expect(result.bool.must[1].multi_match.query).toBe('test');
    expect(result.bool.must[1].multi_match.fields).toEqual(['field']);
  });

});
