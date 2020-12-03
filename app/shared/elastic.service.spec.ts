import { TestBed } from '@angular/core/testing';
import { ElasticService, NestedField } from './elastic.service';
import { ElasticFilter } from './filter-panel/filter/filter.model';
import { of } from 'rxjs';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { RequestBodySearch, Sort } from 'elastic-builder';

describe('ElasticService', () => {
  let service: ElasticService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.get(ElasticService);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a query_string query when a term is passed in', () => {
    const actualQuery = service.buildTokenizedQuery(
      'mockSearch',
      ['field1', 'field2^2', 'field3'],
      null,
      null,
      true
    );
    expect(actualQuery.toJSON()).toEqual({
      query: {
        bool: {
          should: {
            query_string: {
              query: 'mockSearch*',
              analyze_wildcard: true,
              fields: ['field1', 'field2^2', 'field3']
            }
          }
        }
      },
      from: 0,
      size: 25,
      _source: ['field1', 'field2', 'field3']
    });
  });

  it('should create a query with filters', () => {
    const filters = [
      new ElasticFilter('Roles', 'roles.roleTypeName', () => of(['mock']))
    ];
    const actualQuery: any = service.buildTokenizedQuery(
      'mockSearch',
      ['field1', 'field2^2', 'field3'],
      filters,
      null,
      null,
      null,
      25,
      100
    );
    expect(actualQuery.toJSON()).toEqual({
      from: 25,
      size: 100,
      query: {
        bool: {
          minimum_should_match: 1,
          filter: {
            query_string: {
              query: '()',
              fields: ['roles.roleTypeName'],
              default_operator: 'AND'
            }
          },
          should: {
            query_string: {
              query: 'mockSearch*',
              analyze_wildcard: true,
              fields: ['field1', 'field2^2', 'field3']
            }
          }
        }
      }
    });
  });

  it('should create a query with filters and a sort', () => {
    const filters = [
      new ElasticFilter('Roles', 'roles.roleTypeName', () => of(['mock']))
    ];
    const actualQuery: any = service.buildTokenizedQuery(
      'mockSearch',
      ['field1', 'field2^2', 'field3'],
      filters,
      null,
      null,
      new Sort('lastUpdatedTimestamp', 'desc'),
      25,
      100
    );
    expect(actualQuery.toJSON()).toEqual({
      sort: [{ lastUpdatedTimestamp: 'desc' }],
      from: 25,
      size: 100,
      query: {
        bool: {
          minimum_should_match: 1,
          filter: {
            query_string: {
              query: '()',
              fields: ['roles.roleTypeName'],
              default_operator: 'AND'
            }
          },
          should: {
            query_string: {
              query: 'mockSearch*',
              analyze_wildcard: true,
              fields: ['field1', 'field2^2', 'field3']
            }
          }
        }
      }
    });
  });

  it('should create a query_string with nested fields for single term query', () => {
    const actualQuery: any = service.buildTokenizedQuery(
      'mockSearch',
      ['field1', 'field2^2'],
      null,
      [{ name: 'nestedField', fields: ['field4'] }],
      true
    );
    expect(actualQuery.toJSON().from).toEqual(0);
    expect(actualQuery.toJSON().size).toEqual(25);
    expect(actualQuery.toJSON().query.bool.should).toEqual([
      {
        query_string: {
          query: 'mockSearch*',
          analyze_wildcard: true,
          fields: ['field1', 'field2^2']
        }
      },
      {
        nested: {
          path: 'nestedField',
          query: {
            query_string: {
              query: 'mockSearch*',
              analyze_wildcard: true,
              fields: ['field4']
            }
          }
        }
      }
    ]);
    expect(actualQuery.toJSON()._source).toEqual([
      'field1',
      'field2',
      'nestedField'
    ]);
  });

  it('should create a query and make an http request to provided url', () => {
    service.search('', [''], 'http://test.com').subscribe(response => {
      expect(response).toEqual('hello');
    });

    const req = httpTestingController.expectOne('http://test.com');

    expect(req.request.method).toEqual('POST');

    req.flush('hello');
  });

  it('should take a custome query and make an http request to provided url', () => {
    service
      .searchCustomQuery(new RequestBodySearch(), 'http://test.com')
      .subscribe(response => {
        expect(response).toEqual('hello');
      });

    const req = httpTestingController.expectOne('http://test.com');

    expect(req.request.method).toEqual('POST');

    req.flush('hello');
  });

  it('should create a query and make an http request to the provided url with from and size provided', () => {
    service
      .search('', [''], 'http://test.com', null, null, null, null, 25, 100)
      .subscribe(response => {
        expect(response).toEqual('hello');
      });

    const req = httpTestingController.expectOne('http://test.com');
    expect(req.request.method).toEqual('POST');

    req.flush('hello');
    expect(req.request.body.from).toEqual(25);
    expect(req.request.body.size).toEqual(100);
  });

  it('should create a query with filter that have nested fields and not split the terms', () => {
    const mockNestedFields: NestedField[] = [
      {
        name: 'path',
        fields: ['path.field1', 'path.field2']
      },
      {
        name: 'path2',
        fields: ['path2.field1', 'path2.field2']
      }
    ];
    const mockFilter = new ElasticFilter('Roles', mockNestedFields, () =>
      of(['mock'])
    );
    mockFilter.model = ['test string', 'search'];
    const filters = [mockFilter];
    const actualQuery: any = service.buildTokenizedQuery(
      undefined,
      ['field1', 'field2^2', 'field3'],
      filters
    );
    expect(actualQuery.toJSON()).toEqual({
      query: {
        bool: {
          minimum_should_match: 1,
          filter: {
            bool: {
              should: [
                {
                  nested: {
                    query: {
                      query_string: {
                        query: '(test string) OR (search)',
                        fields: ['path.field1', 'path.field2'],
                        default_operator: 'AND'
                      }
                    },
                    path: 'path'
                  }
                },
                {
                  nested: {
                    query: {
                      query_string: {
                        query: '(test string) OR (search)',
                        fields: ['path2.field1', 'path2.field2'],
                        default_operator: 'AND'
                      }
                    },
                    path: 'path2'
                  }
                }
              ]
            }
          },
          should: {
            query_string: {
              query: '*',
              analyze_wildcard: true,
              fields: ['field1', 'field2^2', 'field3']
            }
          }
        }
      },
      from: 0,
      size: 25
    });
  });

  it('should create a query with filter that have nested fields and split the terms', () => {
    const mockNestedFields: NestedField[] = [
      {
        name: 'path',
        fields: ['path.field1', 'path.field2']
      },
      {
        name: 'path2',
        fields: ['path2.field1', 'path2.field2']
      }
    ];
    const mockFilter = new ElasticFilter(
      'Roles',
      mockNestedFields,
      () => of(['mock']),
      true
    );
    mockFilter.model = ['test string', 'search'];
    const filters = [mockFilter];
    const actualQuery: any = service.buildTokenizedQuery(
      undefined,
      ['field1', 'field2^2', 'field3'],
      filters
    );
    expect(actualQuery.toJSON()).toEqual({
      query: {
        bool: {
          minimum_should_match: 1,
          filter: {
            bool: {
              should: [
                {
                  nested: {
                    query: {
                      query_string: {
                        query: '(test) OR (string) OR (search)',
                        fields: ['path.field1', 'path.field2'],
                        default_operator: 'AND'
                      }
                    },
                    path: 'path'
                  }
                },
                {
                  nested: {
                    query: {
                      query_string: {
                        query: '(test) OR (string) OR (search)',
                        fields: ['path2.field1', 'path2.field2'],
                        default_operator: 'AND'
                      }
                    },
                    path: 'path2'
                  }
                }
              ]
            }
          },
          should: {
            query_string: {
              query: '*',
              analyze_wildcard: true,
              fields: ['field1', 'field2^2', 'field3']
            }
          }
        }
      },
      from: 0,
      size: 25
    });
  });

  it('should not include a sort property in the query object', () => {
    const actualQuery: any = service.buildTokenizedQuery(
      undefined,
      ['these', 'do', 'not', 'matter']
    );
    expect(actualQuery.toJSON()).toEqual({
      query: {
        bool: {
          should: {
            query_string: {
              query: '*',
              analyze_wildcard: true,
              fields: ['these', 'do', 'not', 'matter']
            }
          }
        }
      },
      from: 0,
      size: 25
    });
  });

  it('should include a sort property in the query object', () => {
    const actualQuery: any = service.buildTokenizedQuery(
      undefined,
      ['these', 'do', 'not', 'matter'],
      undefined,
      undefined,
      undefined,
      new Sort('aField', 'desc')
    );
    expect(actualQuery.toJSON()).toEqual({
      query: {
        bool: {
          should: {
            query_string: {
              query: '*',
              analyze_wildcard: true,
              fields: ['these', 'do', 'not', 'matter']
            }
          }
        }
      },
      from: 0,
      size: 25,
      sort: [{ aField: 'desc' }]
    });
  });
});
