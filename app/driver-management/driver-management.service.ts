import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Driver, DriverSortQuery } from './driver-management.model';
import {
  ElasticQuery,
  ElasticQueryObject
} from '../task-management/elastic-query.model';
import { environment } from 'src/environments/environment';
import {SortingParams} from '../team-management/team-management.model';
import {isDefined} from '@angular/compiler/src/util';

@Injectable({
  providedIn: 'root'
})
export class DriverManagementService {
  readonly URLS: any = environment.urls.employeeService;

  constructor(private readonly httpClient: HttpClient) {}

  getEmployee(id: number): Observable<Driver> {
    const path: string = this.URLS.findemployeedetailsbyid;

    return this.httpClient
      .get(`${path}?personID=${id}`)
      .pipe(map(Driver.fromEmployeeDTO));
  }

  searchForUsers(
    term: string,
    from = 0,
    size = 25,
    filters?: any[],
    sortingParams?: SortingParams
  ): Observable<any> {
    const fields: string[] = [
      'firstName^2',
      'lastName^2',
      'personDTO.isDriver',
      'personDTO.prefName^2',
      'personDTO.status',
      'emplid',
      'userID',
      'personDTO.jobTitle',
      'positions.businessUnit'
    ];
    const query: ElasticQueryObject = this.buildTokenizedQuery(term, fields);
    if (filters) {
      query.bool.filter = filters.map(filter => {
        return {
          query_string: {
            query: `(${filter.model.join(') OR (')})`,
            fields: [filter.field],
            default_operator: 'AND'
          }
        };
      });
    }
    const payload: ElasticQuery = {
      query,
      from,
      size,
      _source: this.sanitizeFields(fields),
    };
    if (
        isDefined(sortingParams) &&
        isDefined(sortingParams.sortKey) &&
        isDefined(sortingParams.sortOrder)
    ) {
      payload.sort = DriverSortQuery.buildSortQuery(sortingParams);
    } else {
      payload.sort = DriverSortQuery.buildSortQuery({sortKey: 'fullName', sortOrder: 'asc'});
    }
    return this.httpClient.post(this.URLS.search, payload).pipe(
      map((body: any) => {
        return {
          hitCount: body.hits.total,
          employees: body.hits.hits.map(hit =>
            Driver.fromElasticSource(hit._source)
          )
        };
      })
    );
  }

  buildTokenizedQuery(term = '', fields: string[]): ElasticQueryObject {
    term = term.trim();
    const query = { bool: { must: [] } };
    const startOfLastTerm: number = term.lastIndexOf(' ');
    const lastTerm: string =
      startOfLastTerm > 0 ? term.slice(startOfLastTerm).trim() : null;
    term = startOfLastTerm > 0 ? term.slice(0, startOfLastTerm) : term;

    query.bool.must = [
      {
        query_string: {
          query: (lastTerm ? lastTerm : term) + '*',
          analyze_wildcard: true,
          fields
        }
      }
    ];
    if (lastTerm) {
      query.bool.must.push({
        multi_match: {
          query: term,
          type: 'cross_fields',
          fields,
          operator: 'and'
        }
      });
    }

    return query;
  }

  sanitizeFields(fields: string[]): string[] {
    return fields.map(s =>
      s.lastIndexOf('^') > -1 ? s.slice(0, s.lastIndexOf('^')) : s
    );
  }

  searchForColumn(term: string, field: string): Observable<string[]> {
    const payload: ElasticQuery = this.buildSingleFieldQuery(term, field);
    return this.httpClient
      .post(this.URLS.search, payload)
      .pipe(
        map((body: any) => body.hits.hits.map(hit => hit._source.firstName))
      );
  }
  searchForLColumn(term: string, field: string): Observable<string[]> {
    const payload: ElasticQuery = this.buildSingleFieldQuery(term, field);
    return this.httpClient
      .post(this.URLS.search, payload)
      .pipe(
        map((body: any) => body.hits.hits.map(hit => hit._source.lastName))
      );
  }
  searchForAlphaColumn(term: string, field: string): Observable<string[]> {
    const payload: ElasticQuery = this.buildSingleFieldQuery(term, field);
    return this.httpClient
      .post(this.URLS.search, payload)
      .pipe(map((body: any) => body.hits.hits.map(hit => hit._source.userID)));
  }

  searchForBUColumn(term: string, field: string): Observable<string[]> {
    const payload: ElasticQuery = this.buildSingleFieldQuery(term, field);
    return this.httpClient
      .post(this.URLS.search, payload)
      .pipe(
        map((body: any) =>
          body.hits.hits.map(hit => hit._source.positions[0].businessUnit)
        )
      );
  }

  searchForStatusColumn(term: string, field: string): Observable<string[]> {
    const payload: ElasticQuery = this.buildSingleFieldQuery(term, field);
    return this.httpClient
      .post(this.URLS.search, payload)
      .pipe(
        map((body: any) =>
          body.hits.hits.map(hit => hit._source.personDTO.status)
        )
      );
  }

  searchForNameColumn(term: string, field: string): Observable<string[]> {
    this.buildSingleFieldQuery(term, field);
    return new Observable<string[]>();
  }

  buildSingleFieldQuery(term: string, field: string): ElasticQuery {
    const query: ElasticQueryObject = this.buildTokenizedQuery(term, [field]);
    return {
      query,
      _source: [field]
    };
  }
}
