import { HttpClient } from '@angular/common/http';
import { isDefined } from '@angular/compiler/src/util';
import { Injectable, EventEmitter } from '@angular/core';
import { RangeQuery } from 'elastic-builder';
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import {
  Filter,
  SearchServiceMethod,
  ElasticFilter
} from 'src/app/shared/filter-panel/filter/filter.model';
import { environment } from 'src/environments/environment';
import { ElasticQuery, ElasticQueryObject } from './elastic-query.model';
import {
  HTTPMethod,
  WorkAssignmentTypeService
} from './task-management-addEdit-task/work-assignment-types';
import {
  dataGridFields,
  DatagridSearchReponse,
  searchFields,
  SortingParams,
  TaskDetail,
  TaskSortQuery
} from './task-management.model';
import { TeamMemberTaskAssignmentRoleAssociationDTO } from './task-management.dto';
import {
  EmployeesService,
  EmployeeSearchResult
} from '../employees/employees.service';
import { Employee } from '../employees/employees.model';
import { NestedField } from '../shared/elastic.service';
import { Team } from '../team-management/team-management.model';
import * as moment from 'moment';

@Injectable()
export class TaskManagementService {
  private readonly URLS: any = environment.urls.taskManagementService;
  private readonly TYPE_ELASTIC_PATH =
    'taskAssignmentResponsibilityGroupDTOs.' +
    'taskAssignmentResponsibilityDetailDTOs.' +
    'taskResponsibilityTypeDescription';
  private readonly VALUE_ELASTIC_PATH =
    'taskAssignmentResponsibilityGroupDTOs.' +
    'taskAssignmentResponsibilityDetailDTOs.' +
    'taskAssignmentResponsibilityDetailValueDesc';
  selectedTask: TaskDetail;
  assignToFilter: AssignToFilter = new AssignToFilter(
    'Assign To',
    [
      'teamMemberTaskAssignmentRoleAssociationDTOs.teamTeamMemberId.keyword',
      'teamMemberTaskAssignmentRoleAssociationDTOs.teamMemberName'
    ],
    event => this.searchForAssignedTo(event.query)
  );

  constructor(
    private httpClient: HttpClient,
    private employeesService: EmployeesService
  ) {}

  private wipeSelectedTaskTap = tap(_ => (this.selectedTask = null));

  saveTaskAssignment(
    taskAssignment: TaskDetail,
    isUpdate: boolean
  ): Observable<any> {
    return isUpdate
      ? this.updateTaskAssignment(taskAssignment)
      : this.createTaskAssignment(taskAssignment);
  }

  createTaskAssignment(taskAssignment: TaskDetail): Observable<any> {
    return this.httpClient.post(
      this.URLS.createTaskAssignment,
      taskAssignment.toDTO()
    );
  }

  updateTaskAssignment(taskAssignment: TaskDetail): Observable<any> {
    return this.httpClient.patch(this.URLS.updateTask, taskAssignment.toDTO());
  }

  getTaskDetails(taskId: number): Observable<TaskDetail> {
    const query = this.URLS.getTaskDetails + taskId;
    return this.httpClient.get(query).pipe(
      map(source => {
        this.selectedTask = new TaskDetail(source);
        return this.selectedTask;
      })
    );
  }

  inactivateTask(taskId: number) {
    const query = this.URLS.inactivateTask + taskId;
    return this.httpClient.patch(query, null).pipe(this.wipeSelectedTaskTap);
  }

  activateTask(taskId: number) {
    const query = this.URLS.activateTask + taskId;
    return this.httpClient.patch(query, null).pipe(this.wipeSelectedTaskTap);
  }

  getTaskCategoryOptions() {
    const dateString = this.createDateString();
    const query = this.URLS.taskCategoryOptions + dateString;
    return this.httpClient
      .get(query)
      .pipe(map((res: any) => res._embedded.taskGroups));
  }

  getRoleTypeOptions(taskGroupId: number) {
    const dateString = this.createDateString();
    const query = `${this.URLS.roleTypeOptions}${dateString}&taskGroupID=${taskGroupId}`;
    return this.httpClient
      .get(query)
      .pipe(map((res: any) => res._embedded.taskGroupRoleTypeAssociations));
  }

  getWorkAssignmentTypeOptions(taskGroupId: number) {
    const dateString = this.createDateString();
    const query = `${this.URLS.workAssignmentTypeOptions}${dateString}&taskGroupID=${taskGroupId}`;
    return this.httpClient
      .get(query)
      .pipe(
        map(
          (res: any) =>
            res._embedded.taskGroupTaskResponsibilityTypeAssociations
        )
      );
  }

  searchForWorkAssignmentTypeValues(
    typeService: WorkAssignmentTypeService,
    query: string
  ): Observable<any[]> {
    if (typeService.method === HTTPMethod.GET) {
      return this.getSearchTypeValues(typeService, query);
    } else if (typeService.method === HTTPMethod.POST) {
      return this.postSearchTypeValues(typeService, query);
    }
  }

  getSearchTypeValues(
    typeService: WorkAssignmentTypeService,
    query: string
  ): Observable<any[]> {
    const urlWithParams: string =
      typeService.destination + typeService.query_string(query);
    return this.httpClient
      .get(urlWithParams)
      .pipe(map(typeService.response_map));
  }

  postSearchTypeValues(
    typeService: WorkAssignmentTypeService,
    query: string
  ): Observable<any[]> {
    return this.httpClient
      .post(typeService.destination, typeService.request_body(query))
      .pipe(map(typeService.response_map));
  }

  getWorkAssignmentTypeValues(
    typeService: WorkAssignmentTypeService
  ): Observable<any> {
    return this.httpClient
      .get(typeService.destination)
      .pipe(map(typeService.response_map));
  }

  searchForTasks(
    term: string,
    from: number = 0,
    size: number = 25,
    filters?: Filter[],
    sortingParams?: SortingParams
  ): Observable<any> {
    const fields: string[] = [...dataGridFields];
    const query: ElasticQueryObject = this.buildTokenizedQuery(term);
    const payload: ElasticQuery = {
      query: query,
      from: from,
      size: size,
      _source: fields
    };
    if (
      isDefined(sortingParams) &&
      isDefined(sortingParams.sortKey) &&
      isDefined(sortingParams.sortOrder)
    ) {
      payload.sort = TaskSortQuery.buildSortQuery(sortingParams);
    }

    if (filters) {
      query.bool.filter = filters.map((filter: Filter) => {
        if (filter.name.toLowerCase() === 'status') {
          const rangeQuery = new RangeQuery();
          rangeQuery.field(filter.field as string);
          if (
            filter.model.includes('active') &&
            !filter.model.includes('inactive')
          ) {
            rangeQuery.gt('now');
          }
          if (
            filter.model.includes('inactive') &&
            !filter.model.includes('active')
          ) {
            rangeQuery.lte('now');
          }
          return rangeQuery.toJSON();
        } else {
          return {
            query_string: {
              query: filter.queryStrings
                ? this.extractFilterTerms(filter.queryStrings)
                : this.extractFilterTerms(filter.model),
              fields: Array.isArray(filter.field)
                ? filter.field
                : [filter.field],
              default_operator: 'AND'
            }
          };
        }
      });
    }

    return this.httpClient.post(this.URLS.search, payload).pipe(
      switchMap((body: any) =>
        of({
          hitCount: body.hits.total,
          tasks: body.hits.hits.map(
            hit => new DatagridSearchReponse(hit._source)
          )
        })
      )
    );
  }

  searchForRoles(term: string): Observable<string[]> {
    return this.searchForFields(
      term,
      'teamMemberTaskAssignmentRoleAssociationDTOs.roleTypeName'
    ).pipe(
      map((body: any) =>
        [].concat
          .apply(
            [],
            body.hits.hits.map(hit =>
              hit._source.teamMemberTaskAssignmentRoleAssociationDTOs.map(
                (roleDto: TeamMemberTaskAssignmentRoleAssociationDTO) =>
                  roleDto.roleTypeName
              )
            )
          )
          .filter(
            (role, index, self) =>
              self.indexOf(role) === index &&
              role.toLowerCase().includes(term.toLowerCase())
          )
      )
    );
  }

  searchForAssignmentTitle(term: string): Observable<string[]> {
    return this.searchForFields(term, 'taskAssignmentName').pipe(
      map((body: any) =>
        body.hits.hits.map(hit => hit._source.taskAssignmentName)
      )
    );
  }

  searchForTaskCategory(term: string): Observable<string[]> {
    return this.searchForFields(term, 'taskGroupName').pipe(
      map((body: any) => body.hits.hits.map(hit => hit._source.taskGroupName))
    );
  }

  searchforWorkType(term: string): Observable<string[]> {
    return this.searchForFields(term, this.TYPE_ELASTIC_PATH).pipe(
      map((body: any) => {
        const response = [];
        body.hits.hits.map(hit =>
          hit._source.taskAssignmentResponsibilityGroupDTOs.map(groupDto =>
            groupDto.taskAssignmentResponsibilityDetailDTOs.map(detailDto =>
              response.push(detailDto.taskResponsibilityTypeDescription)
            )
          )
        );
        return Array.from(new Set(response));
      })
    );
  }

  searchforWorkValue(term: string): Observable<string[]> {
    return this.searchForFields(term, this.VALUE_ELASTIC_PATH).pipe(
      map((body: any) => {
        const response = [];
        body.hits.hits.map(hit =>
          hit._source.taskAssignmentResponsibilityGroupDTOs.map(groupDto =>
            groupDto.taskAssignmentResponsibilityDetailDTOs.map(detailDto => {
              if (detailDto.taskAssignmentResponsibilityDetailValueDesc) {
                response.push(
                  detailDto.taskAssignmentResponsibilityDetailValueDesc
                );
              }
            })
          )
        );
        return Array.from(new Set(response));
      })
    );
  }

  searchforResponsibleTeam(term: string): Observable<string[]> {
    return this.searchForFields(
      term,
      'teamMemberTaskAssignmentRoleAssociationDTOs.teamName'
    ).pipe(
      map((body: any) => {
        const response = [];
        body.hits.hits.map(hit => {
          if (
            hit._source.hasOwnProperty(
              'teamMemberTaskAssignmentRoleAssociationDTOs'
            )
          ) {
            hit._source.teamMemberTaskAssignmentRoleAssociationDTOs.map(
              roleDto => {
                response.push(roleDto.teamName);
              }
            );
          }
        });
        return response;
      })
    );
  }

  searchForAssignedTo(term: string): Observable<string[]> {
    return this.employeesService.searchForUsers(term).pipe(
      map((response: EmployeeSearchResult) => {
        const result: string[] = [];
        response.employees.map((employee: Employee) => {
          this.assignToFilter.employeeSuggestions.push(employee);
          result.push(`${employee.fullName} (${employee.userName})`);
        });
        return result;
      })
    );
  }

  private searchForFields(term: string, fieldKey: string | string[]) {
    const payload: ElasticQuery = this.buildQuery(term, fieldKey);
    return this.httpClient.post(this.URLS.search, payload);
  }

  private createDateString() {
    const date = new Date();
    return (
      date.getFullYear() +
      '-' +
      this.getTwoDigitValue(date.getMonth() + 1) +
      '-' +
      this.getTwoDigitValue(date.getDate()) +
      'T' +
      this.getTwoDigitValue(date.getHours()) +
      ':' +
      this.getTwoDigitValue(date.getMinutes()) +
      ':' +
      this.getTwoDigitValue(date.getSeconds())
    );
  }

  private getTwoDigitValue(input) {
    return ('0' + input).slice(-2);
  }

  private buildTokenizedQuery(searchString: string = ''): ElasticQueryObject {
    const searchTerms = this.extractTerms(searchString);
    let mustClause;
    if (searchString === '') {
      mustClause = [{ match_all: {} }];
    } else {
      mustClause = this.createMustClause(searchTerms);
    }
    return {
      bool: {
        filter: [],
        must: mustClause
      }
    };
  }

  private extractTerms(searchString: string) {
    return searchString
      .trim()
      .replace(/[\+\-=\&\|!\(\){}\[\]\^"~\*\?:\\\/]/g, '\\$&')
      .replace(/ +/g, ' ')
      .split(' ');
  }

  private extractFilterTerms(searchStrings: string[]) {
    return (
      '(' +
      searchStrings
        .map(string =>
          string
            .trim()
            .replace(/[\+\-=\&\|!\(\){}\[\]\^"~\*\?:\\\/]/g, '\\$&')
            .replace(/ +/g, ' ')
        )
        .join(') OR (') +
      ')'
    );
  }

  private createMustClause(searchTerms: string[]) {
    return searchTerms.map(term => {
      return {
        query_string: {
          query: `*${term}*`,
          analyzer: 'whitespace_lowercase',
          analyze_wildcard: true,
          fields: this.sanitizeFields(searchFields)
        }
      };
    });
  }

  private sanitizeFields(fields: string[]): string[] {
    return fields.map(s =>
      s.lastIndexOf('^') > -1 ? s.slice(0, s.lastIndexOf('^')) : s
    );
  }

  private buildQuery(term: string, field: string | string[]): ElasticQuery {
    const query: ElasticQueryObject = this.buildTokenizedQuery(term);
    return {
      query: query,
      _source: Array.isArray(field) ? field : [field]
    };
  }
}

class AssignToFilter extends ElasticFilter {
  employeeSuggestions: Employee[] = [];
  searchTermTeamAssociations: Map<string, string[]> = new Map();

  constructor(
    name: string,
    field: string | Array<string | NestedField>,
    searchMethod: SearchServiceMethod,
    splitTerms?: boolean,
    constantTerm?: string
  ) {
    super(name, field, searchMethod, splitTerms, constantTerm);
  }

  searchSelected(
    value: any,
    filterChangeEmitter: EventEmitter<Filter>,
    searchBox: any
  ) {
    let changed: boolean = false;
    if (!this.selectedSearches.includes(value)) {
      this.selectedSearches.push(value);
      changed = true;
    }
    if (!this.model.includes(value)) {
      const selectedEmployee = this.pickEmployee(value);
      this.model.push(value);
      this.searchTermTeamAssociations.set(
        value,
        this.mapTeamNamesFromEmployee(selectedEmployee)
      );
      changed = true;
    }
    this.buildModel();
    this.searchText = null;
    searchBox.inputEL.nativeElement.value = null;
    searchBox.value = null;
    if (changed) {
      this.model = [].concat(this.model);
      filterChangeEmitter.emit(this);
    }
  }

  private mapTeamNamesFromEmployee(employee: Employee): string[] {
    const result: string[] = [];
    employee.teams
      .filter((teamObj: Team) =>
        moment(teamObj.expirationTimestamp).isAfter(moment.now())
      )
      .map((team: Team) => result.push(`Team-${team.id}`));
    return result;
  }

  private pickEmployee(name: string): Employee {
    return this.employeeSuggestions.find(
      (employee: Employee) =>
        `${employee.fullName} (${employee.userName})` === name
    );
  }

  private buildModel(): void {
    const result: Set<string> = new Set();
    const checkedOptions = this.model.filter(modelEntry =>
      this.selectedSearches.includes(modelEntry)
    );
    checkedOptions.forEach((searchTerm: string) => {
      result.add(searchTerm.split(' (')[0]);
      this.searchTermTeamAssociations.get(searchTerm).map((teamID: string) => {
        result.add(teamID);
      });
    });
    this.queryStrings = Array.from(result);
  }

  optionChecked(): void {
    this.buildModel();
  }
}
