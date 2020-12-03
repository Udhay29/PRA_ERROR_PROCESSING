import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ElasticFilter } from '../shared/filter-panel/filter/filter.model';
import { Employee, Person } from './employees.model';
import { Team } from '../team-management/team-management.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  readonly URLS: any = environment.urls.employeeService;

  constructor(private httpClient: HttpClient) { }

  getEmployee( id: number): Observable<Employee> {
    const path: string = this.URLS.findemployeedetailsbyid;

    return this.httpClient.get(path + '?personID=' + id).pipe(
      map(Employee.fromEmployeeDTO)
    );
  }

  searchForUsers( term: string, from: number = 0, size: number = 25, filters?: ElasticFilter[]): Observable<EmployeeSearchResult> {
    const fieldsForLastName: string[] = [
      'firstName^5',
      'lastName^2000',
      'personDTO.prefName^20',
      'emplid',
      'userID',
      'personDTO.jobTitle',
      'roles.roleTypeName',
      'teams.teamName',
      'personDTO.email'
    ];
    const fieldsForPreferedName: string[] = [
      'firstName^5',
      'lastName^20',
      'personDTO.prefName^2000',
      'emplid',
      'userID',
      'personDTO.jobTitle',
      'roles.roleTypeName',
      'teams.teamName',
      'personDTO.email'
    ];
    const query: ElasticQueryObject = this.buildTokenizedQuery(term, fieldsForPreferedName, fieldsForLastName);
    if (filters) {
      query.bool.filter = filters.map(
        filter => {
          return {
            query_string: {
              query: '(' + filter.model.join(') OR (') + ')',
              fields: [filter.field],
              default_operator: 'AND'
            }
          };
        }
      );
    }
    const payload: ElasticQueryForUserSorting = {
      query: query,
      from: from,
      size: size,
      // Adding expirationTimeStamp to the results but can't query_string on that field. Same
      _source: this.sanitizeFields(fieldsForLastName).concat('teams.expirationTimestamp').concat('teams.teamID'),
      sort: [{_score: {order: 'desc'}}, {'personDTO.prefName.keyword': {order: 'asc'}},
      {'lastName.keyword': {order: 'asc'}}, {'firstName.keyword': {order: 'asc'}}]
    };

    return this.httpClient.post(this.URLS.search, payload).pipe(
      map((body: any) => {
        return {
          hitCount: body.hits.total,
          employees: body.hits.hits.map(hit => Employee.fromElasticSource(hit._source))
        };
      })
    );
  }

  searchForTeamMembers( term: string, teams: Team[], emplid: Number ): Observable<Person[]> {
    const fields: string[] = ['firstName^2', 'lastName^2', 'personDTO.prefName^2', 'emplid', 'personDTO.jobTitle'];
    const payload: ElasticQuery = {
      query: this.buildTeamMemberQuery( teams.map(team => team.id), term, fields),
      _source: this.sanitizeFields(fields)
    };
    return this.httpClient.post(this.URLS.search, payload).pipe(
      map((body: any) => body.hits.hits.map(hit => Person.fromElasticSource(hit._source))
                      .filter((person: Person) => person.id !== emplid)
      )
    );
  }

  buildTokenizedQuery( term: string = '', fields: string[], secondFields?: string[]): ElasticQueryObject  {
    term = term.trim();
    const query = { bool: { must: [] }};
    const startOfLastTerm: number = term.lastIndexOf(' ');
    const lastTerm: string = startOfLastTerm > 0 ? term.slice(startOfLastTerm).trim() : null;
    term = startOfLastTerm > 0 ? term.slice(0, startOfLastTerm) : term;

    if (lastTerm) {
      query.bool.must = [{
          multi_match: {
            query: term,
            type: 'cross_fields',
            fields: fields,
            operator: 'and'
          }
      }];
      query.bool.must.push({
        query_string: {
          query: lastTerm + '*',
          analyze_wildcard: true,
          fields: (secondFields === undefined) ? fields : secondFields,
        }
      });
    } else {
      query.bool.must = [{
        query_string: {
          query: term + '*',
          analyze_wildcard: true,
          fields: fields
        }
      }];
    }

    return query;
  }

  buildTeamMemberQuery( teams: number[], term: string, fields: string[] ): ElasticQueryObject {
    const query: ElasticQueryObject = this.buildTokenizedQuery( term, fields);
    query.bool.filter = query.bool.must;
    query.bool.must = { terms: { 'teams.teamID': teams } };
    return query;
  }

  sanitizeFields( fields: string[]): string[] {
    return fields.map(s => s.lastIndexOf('^') > -1 ? s.slice(0, s.lastIndexOf('^')) : s);
  }

  buildSingleFieldQuery(term: string, field: string): ElasticQuery {
    const query: ElasticQueryObject = this.buildTokenizedQuery(term, [field]);
    return {
      query: query,
      _source: [field]
    };
  }

  searchForPreferredNames(term: string): Observable<string[]> {
    const payload: ElasticQuery = this.buildSingleFieldQuery(term, 'personDTO.prefName');
    return this.httpClient.post(this.URLS.search, payload).pipe(
      map((body: any) =>
        body.hits.hits.map(hit => hit._source.personDTO.prefName)
      )
    );
  }

  searchForLastNames(term: string): Observable<string[]> {
    const payload: ElasticQuery = this.buildSingleFieldQuery(term, 'lastName');
    return this.httpClient.post(this.URLS.search, payload).pipe(
      map((body: any) =>
        body.hits.hits.map(hit => hit._source.lastName)
      )
    );
  }

  searchForTitles(term: string): Observable<string[]> {
    const payload: ElasticQuery = this.buildSingleFieldQuery(term, 'personDTO.jobTitle');
    return this.httpClient.post(this.URLS.search, payload).pipe(
      map((body: any) =>
        body.hits.hits.map(hit => hit._source.personDTO.jobTitle)
      )
    );
  }

  searchForTeamNames(term: string): Observable<string[]> {
    const payload: ElasticQuery = this.buildSingleFieldQuery(term, 'teams.teamName');
    return this.httpClient.post(this.URLS.search, payload).pipe(
      map((body: any) =>
        this.flatten(body.hits.hits.map(hit => hit._source.teams.map(team => team.teamName)))
      )
    );
  }

  searchForRoleNames(term: string): Observable<string[]> {
    const payload: ElasticQuery = this.buildSingleFieldQuery(term, 'roles.roleTypeName');
    return this.httpClient.post(this.URLS.search, payload).pipe(
      map((body: any) =>
        this.flatten(body.hits.hits.map(hit => hit._source.roles.map(role => role.roleTypeName)))
      )
    );
  }

  flatten( incoming: Array<any>, depth: number = 0 ): Array<any> {
    let outgoing: Array<any> = [];
    for (let item of incoming) {
      if (item instanceof Array) {
        item = this.flatten(item, depth + 1);
      }
      outgoing = outgoing.concat(item);
    }
    return outgoing;
  }

  saveEmployee( employee: Employee ): Observable<any> {
    return this.httpClient.patch(this.URLS.updateemployee, employee.toSaveDTO());
  }
}

interface ElasticQuery {
  query: ElasticQueryObject;
  _source: string[];
  from?: number;
  size?: number;
}

interface ElasticQueryForUserSorting {
  query: ElasticQueryObject;
  _source: string[];
  from?: number;
  size?: number;
  sort?: [{_score: {order: string}}, {'personDTO.prefName.keyword': {order: string}},
  {'lastName.keyword': {order: string}}, {'firstName.keyword': {order: string}}];
}

interface ElasticQueryObject {
  match_all?: any;
  bool?: BooleanQuery;
}

interface BooleanQuery {
  must?: any | any[];
  filter?: any | any[];
}

export interface EmployeeSearchResult {
  hitCount: number;
  employees: Employee[];
}