import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, Subject, BehaviorSubject} from 'rxjs';
import {environment} from 'src/environments/environment';
import {map, switchMap} from 'rxjs/operators';
import {localTimeString} from '../shared/javaLocalTime';
import {DataGridSearchResponse, SortingParams, TeamDetail} from './team-management.model';
import {Team} from './team-management.model';
import {ElasticQueryObject, ElasticQuery} from '../task-management/elastic-query.model';
import {Filter, FilterOptions} from 'src/app/shared/filter-panel/filter/filter.model';
import {TeamDTO} from './team-management-dto';
import {forEach} from '@angular/router/src/utils/collection';
import {query} from '@angular/animations';


@Injectable({
  providedIn: 'root'
})
export class TeamManagementService {

  URLS: any = environment.urls.teamManagment;
  onTableReset = new BehaviorSubject<boolean>(false);
  onTableReset$ = this.onTableReset.asObservable();
  selectedPage: number;

  constructor(private httpClient: HttpClient) {
  }

  static buildQuery(term: string, fields: string[]): ElasticQuery {
    const elasticQueryObject: ElasticQueryObject = TeamManagementService.buildTokenizedQuery(term, fields);
    return {
      query: elasticQueryObject,
      _source: fields
    };
  }

  static buildTokenizedQuery(term: string = '', fields: string[]): ElasticQueryObject {
    term = term.trim();
    const tokenizedQuery = {bool: {must: []}};
    const startOfLastTerm: number = term.lastIndexOf(' ');
    const lastTerm: string = startOfLastTerm > 0 ? term.slice(startOfLastTerm).trim() : null;
    term = startOfLastTerm > 0 ? term.slice(0, startOfLastTerm) : term;
    tokenizedQuery.bool.must = [{
      query_string: {
        query: (lastTerm ? lastTerm : term) + '*',
        analyze_wildcard: true,
        fields: fields
      }
    }];
    if (lastTerm) {
      tokenizedQuery.bool.must.push({
        multi_match: {
          query: term,
          type: 'cross_fields',
          fields: fields,
          operator: 'and'
        }
      });
    }
    return tokenizedQuery;
  }

  private static createTeamQueryString(page: number, size: number,
                                       sortingParams?: SortingParams, taskGroupIds?: any[], employeeCodes?: any[], teamLeaderCodes?: any[],
                                       isActiveTeam?: boolean, isInActiveTeam?: boolean, term?: string) {
    const sort = TeamManagementService.getSortQuery(sortingParams);
    const taskGroupQuery = TeamManagementService.getTaskGroupQuery(taskGroupIds);
    const employeeQuery = TeamManagementService.getEmployeeQuery(employeeCodes);
    const teamLeaderQuery = TeamManagementService.getTeamLeaderQuery(teamLeaderCodes);
    const activeTeamQuery = TeamManagementService.getActiveTeamQuery(isActiveTeam);
    const inactiveTeamQuery = TeamManagementService.getInactiveTeamQuery(isInActiveTeam);
    const searchQuery = TeamManagementService.getSearchQuery(term);
    return `page=${page}&size=${size}${sort}${taskGroupQuery}${employeeQuery}${teamLeaderQuery}${activeTeamQuery}${inactiveTeamQuery}` +
      `${searchQuery}`;
  }

  private static getSortQuery(sortingParams?: SortingParams) {
    let sort: string = '';
    if (sortingParams) {
      sort = `&sort=${sortingParams.sortKey},${sortingParams.sortOrder}`;
    }
    return sort;
  }

  private static getTaskGroupQuery(taskGroupIds?: any[]) {
    let queryParam: string = '';
    if (taskGroupIds.length > 0) {
      queryParam = `&taskGroupIDs=${taskGroupIds.join(',')}`;
    }
    return queryParam;
  }

  private static getEmployeeQuery(employeeCodes?: any[]) {
    let queryParam: string = '';
    if (employeeCodes.length > 0) {
      queryParam = `&personIDs=${employeeCodes.join(',')}`;
    }
    return queryParam;
  }

  private static getTeamLeaderQuery(teamLeaderCodes?: any[]) {
    let queryParam: string = '';
    if (teamLeaderCodes.length > 0) {
      queryParam = `&teamLeaderPersonIDs=${teamLeaderCodes.join(',')}`;
    }
    return queryParam;
  }

  private static getActiveTeamQuery(isActiveTeam?: boolean) {
    let queryParam: string = '';
    if (isActiveTeam !== undefined && isActiveTeam !== null) {
      queryParam = `&activeTeamsOnly=${isActiveTeam}`;
    }
    return queryParam;
  }

  private static getInactiveTeamQuery(isInActiveTeam?: boolean) {
    let queryParam: string = '';
    if (isInActiveTeam !== undefined && isInActiveTeam !== null) {
      queryParam = `&inactiveTeamsOnly=${isInActiveTeam}`;
    }
    return queryParam;
  }

  private static getSearchQuery(term?: string) {
    let queryParam: string = '';
    if (term) {
      queryParam = `&searchCriteria=${term}`;
    }
    return queryParam;
  }

  resetTable(Flag: boolean) {
    this.onTableReset.next(Flag);
  }

  findTeamWithNameContaining(teamName: string): Observable<any[]> {
    return this.httpClient.get(
      this.URLS.findTeamByNameContaining, {
        params: {
          'teamName': teamName,
          'expirationTimestamp': localTimeString()
        }
      }
    ).pipe(
      map((res: any) => {
        const teamList: any[] = [];
        for (const team of res._embedded.teams) {
          teamList.push({
            teamName: team.teamName,
            teamID: team.teamID
          });
        }
        return teamList;
      })
    );
  }

  findTeamMembersByTeamIds(ids: number[]): Observable<any> {
    const idsParam: string = ids.join();
    return this.httpClient.get(
      this.URLS.findTeamMembersByTeamIds, {
        params: {
          'teamIDs': idsParam
        }
      });
  }

  searchForTeams(term: string, page: number, size: number, sortingParams?: SortingParams, filters?: Filter[], teamLeaderCodes?: any[],
                 employeeCodes?: any[]): Observable<any> {
    let isActiveTeam = false;
    let isInactiveTeam = false;
    let taskGroupIds = [];
    let employeeName = [];
    let teamLeader = [];
    let filteredTeamLeaderIds = [];
    let filteredEmployeeNameIds = [];
    for (const filter of filters) {
      // Status Filter
      if (filter.name === 'Status') {
        isActiveTeam = filter.model.includes('activeTeamsOnly');
        isInactiveTeam = filter.model.includes('inActiveTeamsOnly');
      }
      // Task Category Filter
      if (filter.name === 'Task Category') {
        taskGroupIds = filter.model;
      }
      // Employee Name Filter
      if (filter.name === 'Employee Name') {
        employeeName = filter.model;
        filteredEmployeeNameIds = employeeCodes.filter(values => {
          const name = values.substring(0, values.lastIndexOf(' '));
          const value = values.substring(values.lastIndexOf(' ') + 1);
          if (employeeName.includes(name)) {
            return value;
          }
        }).map(value => value.substring(value.lastIndexOf(' ') + 1));
      }
      // Team Leader Filter
      if (filter.name === 'Team Leader') {
        teamLeader = filter.model;
        filteredTeamLeaderIds = teamLeaderCodes.filter(values => {
          const name = values.substring(0, values.lastIndexOf(' '));
          const value = values.substring(values.lastIndexOf(' ') + 1);
          if (teamLeader.includes(name)) {
            return value;
          }
        }).map(value => value.substring(value.lastIndexOf(' ') + 1));
      }
    }
    size = size ? size : 25;
    const param = TeamManagementService.createTeamQueryString(page, size, sortingParams, taskGroupIds, filteredEmployeeNameIds,
      filteredTeamLeaderIds, isActiveTeam, isInactiveTeam, term);
    const url = this.URLS.search + param;
    return this.httpClient.get(url).pipe(
      switchMap((body: any) => {
        return of({
            hitCount: body.totalElements,
            teams: body.map(res => new DataGridSearchResponse(res))
          }
        );
      })
    );
  }

  getTeamDetails(teamId: any) {
    const detailsQuery = this.URLS.getTeamDetail + 'teamID=' + teamId;
    return this.httpClient.get(detailsQuery).pipe(switchMap((res: TeamDTO) => of(new TeamDetail(res))));
  }

  inactivateTeam(teamId: any) {
    const inactivateTeamQuery = this.URLS.inactivateTeam;
    return this.httpClient.patch(inactivateTeamQuery, [teamId], {observe: 'response'});
  }

  activateTeam(teamId: any) {
    const activateTeamQuery = this.URLS.activateTeam;
    return this.httpClient.patch(activateTeamQuery, [teamId], {observe: 'response'});
  }

  saveTeam(team: TeamDTO, isUpdate: boolean) {
    return isUpdate ? this.updateTeam(team) : this.createTeam(team);
  }

  updateTeam(team: TeamDTO): Observable<any> {
    return this.httpClient.patch(this.URLS.updateTeam, team);
  }

  createTeam(team: TeamDTO): Observable<any> {
    return this.httpClient.post(this.URLS.createTeam, team);
  }

  searchForEmployeeAndTeamLeader(term: string): Observable<string[]> {
    const payload: ElasticQuery = TeamManagementService.buildQuery(term, ['personDTO.prefName', 'personDTO.lastName', 'personDTO.emplId']);
    return this.httpClient.post(this.URLS.getfilters, payload).pipe(
      map((body: any) =>
        body.hits.hits.map(hit => hit._source.personDTO.prefName + ' ' + hit._source.personDTO.lastName
          + ' ' + hit._source.personDTO.emplId)
      )
    );
  }

  getTaskCategoriesForFilter(): Observable<Array<FilterOptions>> {
    return this.httpClient.get(this.URLS.getTaskCategories)
      .pipe(
        map((res: any) => {
          const filterOptions: Array<FilterOptions> = [];
          let i = 0;
          for (const taskGroup of res.content) {
            filterOptions.push({
              label: taskGroup.taskGroupName,
              value: taskGroup.taskGroupID,
              indexOf: i
            });
            i++;
          }
          return filterOptions;
        })
      );
  }
}


