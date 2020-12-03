import { Injectable } from '@angular/core';
import { Filter } from './filter-panel/filter/filter.model';
import { Observable } from 'rxjs';
import {
  RequestBodySearch,
  BoolQuery,
  QueryStringQuery,
  NestedQuery, Sort
} from 'elastic-builder';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ElasticService {
  constructor(private httpClient: HttpClient) {}

  search(
    term: string,
    fields: string[],
    elasticUrl: string,
    filters?: Filter[],
    nestedFields?: NestedField[],
    source?: boolean,
    sort?: Sort,
    from: number = 0,
    size: number = 25
  ): Observable<any> {
    const payload: RequestBodySearch = this.buildTokenizedQuery(
      term,
      fields,
      filters,
      nestedFields,
      source,
      sort,
      from,
      size
    );
    return this.httpClient.post(elasticUrl, payload.toJSON());
  }

  searchCustomQuery(
    query: RequestBodySearch,
    elasticUrl: string
  ): Observable<any> {
    return this.httpClient.post(elasticUrl, query.toJSON());
  }

  buildTokenizedQuery(
    term: string = '',
    fields: string[],
    filters?: Filter[],
    nestedFields?: NestedField[],
    source?: boolean,
    sort?: Sort,
    from: number = 0,
    size: number = 25
  ): RequestBodySearch {
    term = this.extractTerms(term);
    const query: BoolQuery = new BoolQuery();
    const request: RequestBodySearch = new RequestBodySearch();

    query.should(
      new QueryStringQuery(term).analyzeWildcard(true).fields(fields)
    );

    if (nestedFields) {
      nestedFields.forEach((field: NestedField) => {
        query.should(
          new NestedQuery(
            new QueryStringQuery(term)
              .analyzeWildcard(true)
              .fields(field.fields),
            field.name
          )
        );
      });
    }

    if (filters) {
      filters.forEach(filter => {
        if (
          filter.field instanceof Array &&
          filter.field.every(entry => this.isNestedField(entry))
        ) {
          const nestedQueries: NestedQuery[] = filter.field.map(
            (field: NestedField) => {
              return new NestedQuery(
                new QueryStringQuery(
                  `${
                    filter.splitTerms
                      ? this.extractFilterTerms(filter.model)
                      : this.sanitizeFilterTerms(filter.model)
                  }${
                    filter.constantTerm
                      ? ' AND (' + filter.constantTerm + ')'
                      : ''
                  }`
                )
                  .fields(field.fields)
                  .defaultOperator('AND'),
                field.name
              );
            }
          );
          query.filter(new BoolQuery().should(nestedQueries));
        } else if (typeof filter.field === 'string') {
          query.filter(
            new QueryStringQuery(
              `${
                filter.splitTerms
                  ? this.extractFilterTerms(filter.model)
                  : this.sanitizeFilterTerms(filter.model)
              }${
                filter.constantTerm ? ' AND (' + filter.constantTerm + ')' : ''
              }`
            )
              .field(filter.field)
              .defaultOperator('AND')
          );
        }
      });
      query.minimumShouldMatch(1);
    }

    request
      .query(query)
      .from(from)
      .size(size);

    if (sort) {
      request.sort(sort);
    }

    if (source && nestedFields) {
      request.source(
        this.sanitizeFields(fields).concat(
          this.sanitizeFields(nestedFields.map(field => field.name))
        )
      );
    } else if (source) {
      request.source(this.sanitizeFields(fields));
    }
    return request;
  }

  sanitizeFields(fields: string[]): string[] {
    return fields.map((s: string) =>
      s.lastIndexOf('^') > -1 ? s.slice(0, s.lastIndexOf('^')) : s
    );
  }

  extractTerms(searchString: string) {
    return (
      this.removeSpecialCharactors(searchString)
        .replace(/ +/g, ' ')
        .split(' ')
        .join('* AND ') + '*'
    );
  }

  extractFilterTerms(searchString: string[]) {
    const splitSearchString = [].concat(
      ...searchString.map(string => string.split(' '))
    );
    return this.sanitizeFilterTerms(splitSearchString);
  }

  sanitizeFilterTerms(terms: string[]): string {
    return (
      '(' +
      terms.map(term => this.removeSpecialCharactors(term)).join(') OR (') +
      ')'
    );
  }

  removeSpecialCharactors(string: string): string {
    return string
      .trim()
      .replace(/[\+=\&\|!\(\){}\[\]\^"~\*\?:\\\/]/g, '')
      .replace(/[ ][\-][ ]/g, ' ');
  }

  isNestedField(thing: string | NestedField): thing is NestedField {
    return (
      (thing as NestedField).fields !== undefined &&
      (thing as NestedField).name !== undefined
    );
  }

}

export interface NestedField {
  fields: string[];
  name: string;
}
