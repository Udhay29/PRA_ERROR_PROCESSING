import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterOptions, ElasticFilter, Filter, DateFilter } from 'src/app/shared/filter-panel/filter/filter.model';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ErrorReprocessingService {

  readonly URLS: any = environment.urls.errorReprocessing;

  constructor(private httpClient: HttpClient) { }

  getErrorList(param: any) {
    const path: string = this.URLS.search;
    return this.httpClient.post(path, param);
  }

  userTasks(param: any) {
    const path: string = this.URLS.getIds;
    return this.httpClient.post(path, param);
  }

  errorReprocess(param: any) {
    const path: string = this.URLS.reprocess;
    return this.httpClient.post(path, param);
  }
  getDomainValues(searchQuery, modelValues): Observable<string[]> {
    if (modelValues.length) {
      return this.filterDomain(searchQuery, modelValues);
    } else {
      return this.initialDomain(searchQuery);
    }
  }
  getSubDomainValues(searchQuery, modelValues): Observable<string[]> {
    if (modelValues.length) {
      return this.filterSubdomain(searchQuery, modelValues);
    } else {
      return this.initialSubdomain(searchQuery);
    }
  }

  getStatus(): Observable<Array<FilterOptions>> {
    const path: string = this.URLS.status;
    const filterOptions: Array<FilterOptions> = [];
    return this.httpClient.get(path)
      .pipe(
        map((res: any) => {
          res._embedded.errorStatuses.map(value => {
            filterOptions.push({
              label: value.errorStatusDescription,
              value: value.errorStatusCode,
            });
          });

          return filterOptions;
        })
      );
  }

  searchForUsers(taskID: number[], filters: Filter[], tableParam: any) {
    const param = this.getFilterValues(taskID, filters, tableParam);
    const path: string = this.URLS.search;
    return this.httpClient.post(path, param);
  }

  getFilterValues(taskID: number[], filters: Filter[], tableParam: any) {
    tableParam.taskAssignmentIds = taskID;
    tableParam.startDate = null;
    tableParam.endDate = null;
    if (filters && filters.length > 0) {
      tableParam.domain = this.getFilterDomain(filters, 'Exception Domain');
      tableParam.subDomain = this.getFilterDomain(filters, 'Exception Subdomain');
      filters.forEach(value => {
        if (value.type.toUpperCase() === 'CHECKBOX') {
          tableParam.status = this.getFilterStatus(value, tableParam.status);
        } else if (value.type.toUpperCase() === 'DATERANGE') {
          this.dateRangrparams(value, tableParam);
        }
      });
      return tableParam;
    } else {
      tableParam.domain = [];
      tableParam.subDomain = [];
      tableParam.status = ['New'];
      return tableParam;
    }
  }

  dateRangrparams(value: any, tableParam: any) {
    if (!value.inValidDate && value.fromDate && value.toDate) {
      tableParam.startDate = this.getFilterdate(value.fromDate);
      tableParam.endDate = this.getFilterdate(value.toDate);
    } else {
      tableParam.startDate = null;
      tableParam.endDate = null;
    }
  }

  getFilterdate(value: any) {
    return value ? moment(value).format('YYYY-MM-DD') : null;
  }

  getFilterStatus(value: any, status: Array<string>) {
    return value.name === 'Status' ? value.model : status;
  }

  getFilterDomain(filters: Filter[], reference: string) {
    const filter = filters.filter(value => value.name === reference);
    return filter && filter['length'] ? filter[0]['model'] : [];
  }

  filterDomain(event, modelValues): Observable<string[]> {
    const path: string = `${this.URLS.filteredSubDomain}/applicationdomaincodes?subDomainCodes=${modelValues}`;
    return this.httpClient.get(path).pipe(
      map((body: any) => {
        return body.filter(domain => domain.toLowerCase().indexOf(event.query.toLowerCase()) > -1);
      })
    );
  }

  initialDomain(searchValue): Observable<string[]> {
    const path: string = this.URLS.domainFilter;
    return this.httpClient.get(path).pipe(
      map((body: any) => {
        return body._embedded.applicationDomains.map(value => {
          return value.applicationDomainCode;
        }).filter(domain => domain.toLowerCase().indexOf(searchValue.query.toLowerCase()) > -1);
      })
    );
  }

  filterSubdomain(searchValue, modelValues): Observable<string[]> {
    const path: string = `${this.URLS.domainFilter}/search/applicationsubdomaincodes?domainCodes=${modelValues}`;
    return this.httpClient.get(path).pipe(
      map((body: any) => {
        const applicationSubDomainCodeArr = this.parseSubDomainFilter(body);
        return this.subDomainArray(searchValue, applicationSubDomainCodeArr);
      })
    );
  }

  initialSubdomain(searchValue): Observable<string[]> {
    const path: string = this.URLS.domainFilter;
    return this.httpClient.get(path).pipe(
      map((body: any) => {
        const applicationSubDomainCodeArr = this.parseSubDomainFilter(body);
        return this.subDomainArray(searchValue, applicationSubDomainCodeArr);
      })
    );
  }

  parseSubDomainFilter(subDomainValues): Array<string> {
    return  subDomainValues._embedded.applicationDomains.map(value => {
      return value.applicationSubDomains.map(subdomain => {
        return subdomain.applicationSubDomainCode;
      });
    });
  }

  subDomainArray(searchValue, subDomainCode): Array<string> {
    const applicationSubDomainCode = [];
    subDomainCode.forEach(appSubDC => {
      applicationSubDomainCode.push(...appSubDC);
    });
    return applicationSubDomainCode.filter(domain => domain.toLowerCase().indexOf(searchValue.query.toLowerCase()) > -1);
  }

  getQueryForTaskIds(userId: string) {
    const queryDTO = {
      query: {
        bool: {
          should: [
            {
              multi_match: {
                fields: [
                  'userID'
                ],
                query: `${userId}`,
                type: 'phrase_prefix'
              }
            }
          ]
        }
      }
    };
    return queryDTO;
  }

  getTableParam(taskIds: Number[]) {
    return {
      taskAssignmentIds: taskIds,
      status: ['New'],
      domain: [],
      subDomain: [],
      originQueue: [],
      exceptionType: [],
      headerDetails: '',
      pageNumber: 0,
      recordCount: 25,
      sortBy: '',
      sortDirection: '',
      startDate: null,
      endDate: null
    };
  }

}
