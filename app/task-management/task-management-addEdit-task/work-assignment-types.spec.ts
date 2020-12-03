import {
  WorkAssignmentType,
  workAssignmentTypes
} from './work-assignment-types';

describe('WorkAssignmentTypes', () => {
  it('should handle A&L Responsibility Type', () => {
    const mockResponse = {
      _embedded: {
        taskCategories: [
          {
            taskCategoryDescription: 'Mock Task Cat Desc',
            taskCategoryCode: 'Mock Task Cat Code'
          }
        ]
      }
    };
    const type = getCriterion('A&L Responsibility Type');
    expect(type.code).toBe('CCIRespTyp');
    expect(type.dropdown).toBeTruthy();
    expect(
      type.mapLabelValue(mockResponse._embedded.taskCategories[0])
    ).toEqual({
      label: 'Mock Task Cat Desc',
      value: 'Mock Task Cat Code'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        taskCategoryDescription: 'Mock Task Cat Desc',
        taskCategoryCode: 'Mock Task Cat Code'
      }
    ]);
    expect(type.service.method).toBe('get');
    expect(type.service.destination).toBe(
      '/admin/infrastructuretaskassignmentservices/taskCategories/search/findByTaskModuleTaskModuleCodeIn?taskModuleCode=CusLocProf'
    );
  });

  it('should handle Agreement Owner', () => {
    const mockResponse = 'Mock Agreement Owner';
    const type = getCriterion('Agreement Owner');
    expect(type.code).toBe('AgmntOwner');
    expect(type.mapLabelValue(mockResponse)).toEqual({
      label: 'Mock Agreement Owner',
      value: 'Mock Agreement Owner'
    });
    expect(type.dropdown).toBeFalsy();
  });

  it('should handle Application Support Area', () => {
    const mockResponse = {
      _embedded: {
        applicationDomains: [
          {
            applicationDomainDescription: 'Mock Domain Desc',
            applicationDomainCode: 'Mock Domain Code'
          }
        ]
      }
    };
    const type = getCriterion('Application Support Area');
    expect(type.code).toBe('AppSupArea');
    expect(type.dropdown).toBeTruthy();
    expect(
      type.mapLabelValue(mockResponse._embedded.applicationDomains[0])
    ).toEqual({
      label: 'Mock Domain Desc',
      value: 'Mock Domain Code'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        applicationDomainDescription: 'Mock Domain Desc',
        applicationDomainCode: 'Mock Domain Code'
      }
    ]);
    expect(type.service.method).toBe('get');
    expect(type.service.destination).toBe(
      '/admin/referencedataservices/applicationDomains'
    );
  });

  it('should handle Appointment Requirements', () => {
    const mockResponse = {
      label: 'Mock Label',
      value: 'Mock Value'
    };
    const type = getCriterion('Appointment Requirements');
    expect(type.code).toBe('ApptRqmts');
    expect(type.dropdown).toBeTruthy();
    expect(type.mapLabelValue(mockResponse)).toEqual({
      label: 'Mock Label',
      value: 'Mock Value'
    });
    expect(type.service.response_map('')).toEqual([
      {
        label: 'Order Owner Sets Appointments',
        value: 'Contact Order Owner for Appointments'
      },
      {
        label: '3rd Party Sets Appointments',
        value: 'Contact 3rd Party for Appointments'
      },
      { label: 'No Requirement Set', value: '' }
    ]);
    expect(type.service.method).toBe('none');
    expect(type.service.destination).toBe(
      'elastic/masterdata-location-details/doc/_search'
    );
  });

  it('should handle Bill To', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _id: 1,
            _source: {
              OrganizationName: 'Expert Warehouse Llc',
              Address: {
                AddressLine2: '',
                AddressLine1: '350 Starke Rd Ste 400',
                CountryName: 'USA',
                StateName: 'New Jersey',
                PostalCode: '070722113',
                CityName: 'Carlstadt'
              },
              PartyID: 35526,
              ExpirationTimestamp: '2100-01-01T00:00:00.000Z',
              CustomerCode: 'EXCA62',
              OrganizationStatusTypeCode: 'Approved'
            }
          }
        ]
      }
    };
    const type = getCriterion('Bill To');
    expect(type.code).toBe('BillParty');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse.hits.hits[0])).toEqual({
      label:
        'Expert Warehouse Llc (EXCA62), 350 Starke Rd Ste 400, Carlstadt, New Jersey, USA, 070722113',
      value: 1
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        _id: 1,
        _source: {
          OrganizationName: 'Expert Warehouse Llc',
          Address: {
            AddressLine2: '',
            AddressLine1: '350 Starke Rd Ste 400',
            CountryName: 'USA',
            StateName: 'New Jersey',
            PostalCode: '070722113',
            CityName: 'Carlstadt'
          },
          PartyID: 35526,
          ExpirationTimestamp: '2100-01-01T00:00:00.000Z',
          CustomerCode: 'EXCA62',
          OrganizationStatusTypeCode: 'Approved'
        }
      }
    ]);
    expect(type.service.method).toBe('post');
    expect(type.service.destination).toBe(
      'elastic/masterdata-account-details/doc/_search'
    );
    expect(type.service.request_body('search')).toEqual({
      size: 5,
      _source: [
        'OrganizationName',
        'PartyID',
        'CustomerCode',
        'Address.AddressLine1',
        'Address.AddressLine2',
        'Address.CityName',
        'Address.StateName',
        'Address.CountryName',
        'Address.PostalCode',
        'ExpirationTimestamp',
        'OrganizationStatusTypeCode'
      ],
      query: {
        bool: {
          should: [
            {
              query_string: {
                fields: [
                  'OrganizationName^6',
                  'CustomerCode^3',
                  'Address.AddressLine1^18',
                  'Address.AddressLine2^18',
                  'Address.CityName^15',
                  'Address.StateName^12',
                  'Address.PostalCode^9',
                  'Address.CountryName',
                  'OrganizationName'
                ],
                query: 'search*',
                default_operator: 'and'
              }
            }
          ],
          minimum_should_match: 1,
          must: [
            {
              query_string: {
                default_field: 'OrganizationStatusTypeCode.keyword',
                query: 'Approved'
              }
            },
            {
              nested: {
                path: 'partyroles',
                query: {
                  match: {
                    'partyroles.PartyRoleTypeDescription.keyword': 'Bill To'
                  }
                },
                inner_hits: {
                  size: 1,
                  _source: { includes: ['partyroles.PartyRoleTypeDescription'] }
                }
              }
            }
          ]
        }
      }
    });
  });

  it('should handle Business Unit', () => {
    const mockResponse = {
      _embedded: {
        serviceOfferingBusinessUnitTransitModeAssociations: [
          {
            financeBusinessUnitServiceOfferingAssociation: {
              financeBusinessUnitCode: 'Mock Business Unit Code'
            }
          }
        ]
      }
    };
    const type = getCriterion('Business Unit');
    expect(type.code).toBe('BusUnit');
    expect(type.dropdown).toBeTruthy();
    expect(
      type.mapLabelValue(
        mockResponse._embedded
          .serviceOfferingBusinessUnitTransitModeAssociations[0]
      )
    ).toEqual({
      label: 'Mock Business Unit Code',
      value: 'Mock Business Unit Code'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        financeBusinessUnitServiceOfferingAssociation: {
          financeBusinessUnitCode: 'Mock Business Unit Code'
        }
      }
    ]);
    expect(type.service.method).toBe('get');
    expect(type.service.destination).toBe(
      '/admin/referencedataservices/serviceOfferingBusinessUnitTransitModeAssociations/search/fetchBusinessUnitCode'
    );
  });

  it('should handle Corporate Account', () => {
    const mockResponse = {
      aggregations: {
        unique: {
          buckets: [
            {
              key: 'Schnitzer Southeast',
              Level: {
                hits: {
                  hits: [
                    {
                      _source: {
                        OrganizationName: 'Schnitzer Southeast',
                        Level: 'Ultimate Parent',
                        OrganizationID: 138835
                      }
                    }
                  ]
                }
              }
            }
          ]
        }
      }
    };
    const type = getCriterion('Corporate Account');
    expect(type.code).toBe('CorprtAcct');
    expect(type.dropdown).toBeFalsy();
    expect(
      type.mapLabelValue(mockResponse.aggregations.unique.buckets[0])
    ).toEqual({ label: 'Schnitzer Southeast', value: 138835 });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        key: 'Schnitzer Southeast',
        Level: {
          hits: {
            hits: [
              {
                _source: {
                  OrganizationName: 'Schnitzer Southeast',
                  Level: 'Ultimate Parent',
                  OrganizationID: 138835
                }
              }
            ]
          }
        }
      }
    ]);
    expect(type.service.method).toBe('post');
    expect(type.service.destination).toBe(
      'elastic/masterdata-account-hierarchy/_search'
    );
  });

  it('should handle Delivery Service Type', () => {
    const mockResponse = {
      _embedded: {
        serviceTypes: [
          {
            serviceTypeDescription: 'Mock Service Type Description',
            serviceTypeCode: 'Mock Type Code'
          }
        ]
      }
    };
    const type = getCriterion('Delivery Service Type');
    expect(type.code).toBe('DelServTyp');
    expect(type.dropdown).toBeTruthy();
    expect(type.mapLabelValue(mockResponse._embedded.serviceTypes[0])).toEqual({
      label: 'Mock Service Type Description',
      value: 'Mock Type Code'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        serviceTypeDescription: 'Mock Service Type Description',
        serviceTypeCode: 'Mock Type Code'
      }
    ]);
    expect(type.service.method).toBe('get');
    expect(type.service.destination).toBe(
      '/admin/ordermanagementreferencedataservices/serviceTypes'
    );
  });

  it('should handle Destination Capacity Area', () => {
    const mockResponse = {
      _embedded: {
        areas: [
          {
            marketingArea: 'Mock Marketing Area',
            buisnessUnit: 'Mock Business Unit',
            id: 'Mock Id'
          }
        ]
      }
    };
    const type = getCriterion('Destination Capacity Area');
    expect(type.code).toBe('DestCapcAr');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse._embedded.areas[0])).toEqual({
      label: 'Mock Marketing Area - Mock Business Unit',
      value: 'Mock Id'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        marketingArea: 'Mock Marketing Area',
        buisnessUnit: 'Mock Business Unit',
        id: 'Mock Id'
      }
    ]);
    expect(type.service.method).toBe('get');
    expect(type.service.destination).toBe(
      '/admin/masterdatageographyservices/areas/search/findbyareatype'
    );
    expect(type.service.query_string('search')).toBe(
      '?areaName=search&areaType=capacity&projection=area'
    );
  });

  it('should handle Destination Marketing Area', () => {
    const mockResponse = {
      _embedded: {
        areas: [
          {
            marketingArea: 'Mock Marketing Area',
            buisnessUnit: 'Mock Business Unit',
            id: 'Mock Id'
          }
        ]
      }
    };
    const type = getCriterion('Destination Marketing Area');
    expect(type.code).toBe('DestMarkAr');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse._embedded.areas[0])).toEqual({
      label: 'Mock Marketing Area, Mock Business Unit',
      value: 'Mock Id'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        marketingArea: 'Mock Marketing Area',
        buisnessUnit: 'Mock Business Unit',
        id: 'Mock Id'
      }
    ]);
    expect(type.service.method).toBe('get');
    expect(type.service.destination).toBe(
      '/admin/masterdatageographyservices/areas/search/findbymarketingarea'
    );
    expect(type.service.query_string('search')).toBe('?areaName=search');
  });

  it('should handle Destination Ramp', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              Address: {
                AddressLine2: null,
                AddressLine1: '7600 S Western Ave',
                CountryName: 'USA',
                StateName: 'Illinois',
                PostalCode: '606205818',
                CityName: 'Chicago',
                AddressID: 351568
              },
              LocationID: 93957,
              LocationCode: 'C!',
              locationroles: [
                {
                  LocationRoleTypeDescription: 'Receiver'
                },
                {
                  LocationRoleTypeDescription: 'Shipper'
                }
              ],
              LocationName: 'Norfolk Southern Landers Ramp'
            }
          }
        ]
      }
    };
    const type = getCriterion('Destination Ramp');
    expect(type.code).toBe('DestRamp');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse.hits.hits[0])).toEqual({
      label:
        'Norfolk Southern Landers Ramp (C!), 7600 S Western Ave, Chicago, Illinois, USA, 606205818',
      value: 93957
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        _source: {
          Address: {
            AddressLine2: null,
            AddressLine1: '7600 S Western Ave',
            CountryName: 'USA',
            StateName: 'Illinois',
            PostalCode: '606205818',
            CityName: 'Chicago',
            AddressID: 351568
          },
          LocationID: 93957,
          LocationCode: 'C!',
          locationroles: [
            {
              LocationRoleTypeDescription: 'Receiver'
            },
            {
              LocationRoleTypeDescription: 'Shipper'
            }
          ],
          LocationName: 'Norfolk Southern Landers Ramp'
        }
      }
    ]);
    expect(type.service.method).toBe('post');
    expect(type.service.destination).toBe(
      'elastic/masterdata-location-details/doc/_search'
    );
    expect(type.service.request_body('search')).toEqual({
      size: 5,
      _source: [
        'LocationName',
        'LocationCode',
        'LocationID',
        'Address.AddressLine1',
        'Address.AddressLine2',
        'Address.CityName',
        'Address.StateName',
        'Address.CountryName',
        'Address.PostalCode',
        'locationroles.LocationRoleTypeDescription',
        'Address.AddressID'
      ],
      query: {
        bool: {
          must: [
            {
              query_string: {
                fields: [
                  'LocationName',
                  'LocationCode',
                  'Address.CityName',
                  'Address.StateName'
                ],
                query: 'search*',
                default_operator: 'AND',
                analyze_wildcard: true
              }
            },
            {
              nested: {
                path: 'locationroles',
                query: {
                  query_string: {
                    fields: ['locationroles.LocationRoleTypeDescription'],
                    query: '*',
                    split_on_whitespace: false
                  }
                },
                inner_hits: {
                  size: 2,
                  _source: {
                    includes: ['locationroles.LocationRoleTypeDescription']
                  }
                }
              }
            },
            {
              nested: {
                path: 'locationtypes',
                query: {
                  query_string: {
                    fields: [
                      'locationtypes.LocationSubTypeDescription.keyword'
                    ],
                    query: 'Ramp',
                    split_on_whitespace: false
                  }
                },
                inner_hits: {
                  size: 2,
                  _source: {
                    includes: ['locationtypes.LocationTypeDescription']
                  }
                }
              }
            }
          ]
        }
      }
    });
  });

  it('should handle Destination Site', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _id: 1,
            _source: {
              Address: {
                AddressLine2: null,
                AddressLine1: '5175 Chicken City Rd',
                CountryName: 'USA',
                StateName: 'Virginia',
                PostalCode: '233362205',
                CityName: 'Chincoteague',
                AddressID: 283235
              },
              LocationID: 234847,
              LocationCode: 'CHCHDO',
              locationroles: [
                {
                  LocationRoleTypeDescription: 'Receiver'
                },
                {
                  LocationRoleTypeDescription: 'Shipper'
                }
              ],
              LocationName: 'Chincoteague Fire House'
            }
          }
        ]
      }
    };
    const type = getCriterion('Destination Site');
    expect(type.code).toBe('DestSite');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse.hits.hits[0])).toEqual({
      label:
        'Chincoteague Fire House (CHCHDO), 5175 Chicken City Rd, Chincoteague, Virginia, USA, 233362205',
      value: 1
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        _id: 1,
        _source: {
          Address: {
            AddressLine2: null,
            AddressLine1: '5175 Chicken City Rd',
            CountryName: 'USA',
            StateName: 'Virginia',
            PostalCode: '233362205',
            CityName: 'Chincoteague',
            AddressID: 283235
          },
          LocationID: 234847,
          LocationCode: 'CHCHDO',
          locationroles: [
            {
              LocationRoleTypeDescription: 'Receiver'
            },
            {
              LocationRoleTypeDescription: 'Shipper'
            }
          ],
          LocationName: 'Chincoteague Fire House'
        }
      }
    ]);
    expect(type.service.method).toBe('post');
    expect(type.service.destination).toBe(
      'elastic/masterdata-location-details/doc/_search'
    );
    expect(type.service.request_body('search')).toEqual({
      size: 5,
      _source: [
        'LocationName',
        'LocationCode',
        'LocationID',
        'Address.AddressLine1',
        'Address.AddressLine2',
        'Address.CityName',
        'Address.StateName',
        'Address.CountryName',
        'Address.PostalCode',
        'locationroles.LocationRoleTypeDescription',
        'Address.AddressID'
      ],
      query: {
        bool: {
          should: [
            {
              query_string: {
                fields: ['LocationName^6', 'LocationCode^3'],
                query: 'search*',
                default_operator: 'and'
              }
            },
            {
              query_string: {
                fields: [
                  'Address.AddressLine1^18',
                  'Address.AddressLine2^18',
                  'Address.CityName^15',
                  'Address.StateName^12',
                  'Address.PostalCode^9',
                  'Address.CountryName'
                ],
                query: 'search*',
                default_operator: 'and'
              }
            }
          ],
          minimum_should_match: 1,
          must: [
            {
              nested: {
                path: 'locationroles',
                query: {
                  query_string: {
                    fields: ['locationroles.LocationRoleTypeDescription'],
                    query: '(Receiver)',
                    split_on_whitespace: false
                  }
                },
                inner_hits: {
                  size: 1,
                  _source: {
                    includes: ['locationroles.LocationRoleTypeDescription']
                  }
                }
              }
            }
          ]
        }
      }
    });
  });

  it('should handle Destination State or Province', () => {
    const mockResponse = {
      _embedded: {
        states: [
          {
            stateName: 'Mock Name',
            stateCode: 'Mock Code'
          }
        ]
      }
    };
    const type = getCriterion('Destination State or Province');
    expect(type.code).toBe('DestState');
    expect(type.dropdown).toBeTruthy();
    expect(type.mapLabelValue(mockResponse._embedded.states[0])).toEqual({
      label: 'Mock Name - Mock Code',
      value: 'Mock Code'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        stateName: 'Mock Name',
        stateCode: 'Mock Code'
      }
    ]);
    expect(type.service.method).toBe('get');
    expect(type.service.destination).toBe(
      'masterdatageographyservices/states/'
    );
  });

  it('should handle Dispatch', () => {
    const mockResponse = 'Mock Value';
    const type = getCriterion('Dispatch');
    expect(type.code).toBe('Dispatch');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse)).toEqual({
      label: 'Mock Value',
      value: 'Mock Value'
    });
  });

  it('should handle LDC Location', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _id: 1,
            _source: {
              Address: {
                AddressLine2: 'Ste 1200',
                AddressLine1: '333 N Michigan Ave',
                CountryName: 'USA',
                StateName: 'Illinois',
                PostalCode: '60601',
                CityName: 'Chicago',
                AddressID: 1621918
              },
              LocationID: 327981,
              LocationCode: 'EDCH1',
              locationroles: [
                {
                  LocationRoleTypeDescription: 'Receiver'
                },
                {
                  LocationRoleTypeDescription: 'Shipper'
                }
              ],
              LocationName: 'Edge Logistics Llc'
            }
          }
        ]
      }
    };
    const type = getCriterion('LDC Location');
    expect(type.code).toBe('LDCLocatn');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse.hits.hits[0])).toEqual({
      label:
        'Edge Logistics Llc (EDCH1), 333 N Michigan Ave, Ste 1200, Chicago, Illinois, USA, 60601',
      value: 1
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        _id: 1,
        _source: {
          Address: {
            AddressLine2: 'Ste 1200',
            AddressLine1: '333 N Michigan Ave',
            CountryName: 'USA',
            StateName: 'Illinois',
            PostalCode: '60601',
            CityName: 'Chicago',
            AddressID: 1621918
          },
          LocationID: 327981,
          LocationCode: 'EDCH1',
          locationroles: [
            {
              LocationRoleTypeDescription: 'Receiver'
            },
            {
              LocationRoleTypeDescription: 'Shipper'
            }
          ],
          LocationName: 'Edge Logistics Llc'
        }
      }
    ]);
    expect(type.service.method).toBe('post');
    expect(type.service.destination).toBe(
      'elastic/masterdata-location-details/doc/_search'
    );
    expect(type.service.request_body('search')).toEqual({
      _source: [
        'LocationName',
        'LocationCode',
        'LocationID',
        'Address.AddressLine1',
        'Address.AddressLine2',
        'Address.CityName',
        'Address.StateName',
        'Address.CountryName',
        'Address.PostalCode',
        'locationroles.LocationRoleTypeDescription',
        'Address.AddressID'
      ],
      size: 6,
      from: 0,
      query: {
        bool: {
          must: [
            {
              query_string: {
                fields: [
                  'LocationName',
                  'LocationCode',
                  'Address.CityName',
                  'Address.StateName'
                ],
                query: 'search*',
                default_operator: 'AND',
                analyze_wildcard: true
              }
            },
            {
              nested: {
                path: 'locationtypes',
                query: {
                  query_string: {
                    default_field: 'locationtypes.LocationSubTypeCode',
                    query: 'LDC'
                  }
                }
              }
            }
          ]
        }
      }
    });
  });

  it('should handle Line of Business', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              OrganizationName: 'LCS Communcation',
              Level: 'Business Line',
              OrganizationID: 385,
              OrganizationAliasName: 'Lsc Communications, Inc.'
            }
          }
        ]
      }
    };
    const type = getCriterion('Line Of Business');
    expect(type.code).toBe('LOB');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse.hits.hits[0])).toEqual({
      label: 'LCS Communcation',
      value: 385
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        _source: {
          OrganizationName: 'LCS Communcation',
          Level: 'Business Line',
          OrganizationID: 385,
          OrganizationAliasName: 'Lsc Communications, Inc.'
        }
      }
    ]);
    expect(type.service.method).toBe('post');
    expect(type.service.destination).toBe(
      'elastic/masterdata-account-hierarchy/_search'
    );
    expect(type.service.request_body('search')).toEqual({
      size: 10,
      _source: [
        'OrganizationName',
        'Level',
        'OrganizationID',
        'OrganizationAliasName'
      ],
      query: {
        bool: {
          must: [
            {
              query_string: {
                default_field: 'Level.keyword',
                query: 'Business Line',
                split_on_whitespace: false
              }
            },
            {
              query_string: {
                fields: ['OrganizationName', 'OrganizationAliasName'],
                query: 'search*',
                default_operator: 'AND',
                analyze_wildcard: true
              }
            }
          ]
        }
      },
      aggs: {
        unique: {
          terms: { field: 'OrganizationName.keyword', size: 5 },
          aggs: {
            Level: {
              top_hits: {
                _source: {
                  includes: [
                    'OrganizationAliasName',
                    'OrganizationName',
                    'Level',
                    'OrganizationID'
                  ]
                },
                size: 1
              }
            }
          }
        }
      }
    });
  });

  it('should handle Operational Group - Fleet', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              OperationalGroupCode: 'mock operational group code'
            }
          }
        ]
      }
    };
    const type = getCriterion('Operational Group - Fleet');
    expect(type.code).toBe('OpGrpFleet');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse.hits.hits[0])).toEqual({
      label: 'mock operational group code',
      value: 'mock operational group code'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        _source: {
          OperationalGroupCode: 'mock operational group code'
        }
      }
    ]);
    expect(type.service.method).toBe('post');
    expect(type.service.destination).toBe(
      'operationsexecution-admin-operationalgroup/_search'
    );
    expect(type.service.request_body(' <3?> ')).toEqual({
      query: {
        bool: {
          must: [
            { match: { OperationalGroupTypeCode: 'Fleet' } },
            { match: { Status: 'Active' } },
            {
              query_string: {
                fields: ['OperationalGroupCode'],
                query: '3\\?*'
              }
            }
          ]
        }
      },
      _source: ['OperationalGroupCode', 'OperationalGroupDescription']
    });
  });

  it('should handle Operational Group - Board', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _source: {
              OperationalGroupCode: 'mock operational group code'
            }
          }
        ]
      }
    };
    const type = getCriterion('Operational Group - Board');
    expect(type.code).toBe('OpGrpBoard');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse.hits.hits[0])).toEqual({
      label: 'mock operational group code',
      value: 'mock operational group code'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        _source: {
          OperationalGroupCode: 'mock operational group code'
        }
      }
    ]);
    expect(type.service.method).toBe('post');
    expect(type.service.destination).toBe(
      'operationsexecution-admin-operationalgroup/_search'
    );
    expect(type.service.request_body(' <3?> ')).toEqual({
      query: {
        bool: {
          must: [
            { match: { OperationalGroupTypeCode: 'Board' } },
            { match: { Status: 'Active' } },
            {
              query_string: {
                fields: ['OperationalGroupCode'],
                query: '3\\?*'
              }
            }
          ]
        }
      },
      _source: ['OperationalGroupCode', 'OperationalGroupDescription']
    });
    expect(type.service.request_body('3/e')).toEqual({
      query: {
        bool: {
          must: [
            { match: { OperationalGroupTypeCode: 'Board' } },
            { match: { Status: 'Active' } },
            {
              query_string: {
                fields: ['OperationalGroupCode'],
                query: '3\\/e*'
              }
            }
          ]
        }
      },
      _source: ['OperationalGroupCode', 'OperationalGroupDescription']
    });
  });

  it('should handle Operational Group', () => {
    const mockResponse = [
      {
        id: 'mock id'
      }
    ];
    const type = getCriterion('Operational Group');
    expect(type.code).toBe('OpratnlGrp');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse[0])).toEqual({
      label: 'mock id',
      value: 'mock id'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        id: 'mock id'
      }
    ]);
    expect(type.service.method).toBe('get');
    expect(type.service.destination).toBe(
      'ordermanagementintegrationservices/fleetCodes/findAllFleetCodes'
    );
    expect(type.service.query_string('search')).toEqual(
      '?fleetcode=search&rowCount=25&start=0&end=20'
    );
  });

  it('should handle Origin Capacity Area', () => {
    const mockResponse = {
      _embedded: {
        areas: [
          {
            marketingArea: 'mock area',
            buisnessUnit: 'mock business unit',
            id: 10
          }
        ]
      }
    };
    const type = getCriterion('Origin Capacity Area');
    expect(type.code).toBe('OrgnCapcAr');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse._embedded.areas[0])).toEqual({
      label: 'mock area,mock business unit',
      value: 10
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        marketingArea: 'mock area',
        buisnessUnit: 'mock business unit',
        id: 10
      }
    ]);
    expect(type.service.method).toBe('get');
    expect(type.service.destination).toBe(
      '/admin/masterdatageographyservices/areas/search/findbyareatype'
    );
    expect(type.service.query_string('search')).toBe(
      '?areaName=search&areaType=capacity&projection=area'
    );
  });

  it('should handle Origin Marketing Area', () => {
    const mockResponse = {
      _embedded: {
        areas: [
          {
            marketingArea: 'mock area',
            buisnessUnit: 'mock business unit',
            id: 10
          }
        ]
      }
    };
    const type = getCriterion('Origin Marketing Area');
    expect(type.code).toBe('OrgnMarkAr');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse._embedded.areas[0])).toEqual({
      label: 'mock area, mock business unit',
      value: 10
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        marketingArea: 'mock area',
        buisnessUnit: 'mock business unit',
        id: 10
      }
    ]);
    expect(type.service.method).toBe('get');
    expect(type.service.destination).toBe(
      '/admin/masterdatageographyservices/areas/search/findbymarketingarea'
    );
    expect(type.service.query_string('search')).toBe('?areaName=search');
  });

  it('should handle Origin Ramp', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _id: '93957',
            _source: {
              Address: {
                AddressLine2: null,
                AddressLine1: '7600 S Western Ave',
                CountryName: 'USA',
                StateName: 'Illinois',
                PostalCode: '606205818',
                CityName: 'Chicago',
                AddressID: 351568
              },
              LocationID: 93957,
              LocationCode: 'C!',
              locationroles: [
                {
                  LocationRoleTypeDescription: 'Receiver'
                },
                {
                  LocationRoleTypeDescription: 'Shipper'
                }
              ],
              LocationName: 'Norfolk Southern Landers Ramp'
            }
          }
        ]
      }
    };
    const type = getCriterion('Origin Ramp');
    expect(type.code).toBe('OrgnRamp');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse.hits.hits[0])).toEqual({
      label:
        'Norfolk Southern Landers Ramp (C!), 7600 S Western Ave, Chicago, Illinois, USA, 606205818',
      value: '93957'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        _id: '93957',
        _source: {
          Address: {
            AddressLine2: null,
            AddressLine1: '7600 S Western Ave',
            CountryName: 'USA',
            StateName: 'Illinois',
            PostalCode: '606205818',
            CityName: 'Chicago',
            AddressID: 351568
          },
          LocationID: 93957,
          LocationCode: 'C!',
          locationroles: [
            {
              LocationRoleTypeDescription: 'Receiver'
            },
            {
              LocationRoleTypeDescription: 'Shipper'
            }
          ],
          LocationName: 'Norfolk Southern Landers Ramp'
        }
      }
    ]);
    expect(type.service.method).toBe('post');
    expect(type.service.destination).toBe(
      'elastic/masterdata-location-details/doc/_search'
    );
    expect(type.service.request_body('search')).toEqual({
      size: 5,
      _source: [
        'LocationName',
        'LocationCode',
        'LocationID',
        'Address.AddressLine1',
        'Address.AddressLine2',
        'Address.CityName',
        'Address.StateName',
        'Address.CountryName',
        'Address.PostalCode',
        'locationroles.LocationRoleTypeDescription',
        'Address.AddressID'
      ],
      query: {
        bool: {
          must: [
            {
              query_string: {
                fields: [
                  'LocationName',
                  'LocationCode',
                  'Address.CityName',
                  'Address.StateName'
                ],
                query: 'search*',
                default_operator: 'AND',
                analyze_wildcard: true
              }
            },
            {
              nested: {
                path: 'locationroles',
                query: {
                  query_string: {
                    fields: ['locationroles.LocationRoleTypeDescription'],
                    query: '*',
                    split_on_whitespace: false
                  }
                },
                inner_hits: {
                  size: 2,
                  _source: {
                    includes: ['locationroles.LocationRoleTypeDescription']
                  }
                }
              }
            },
            {
              nested: {
                path: 'locationtypes',
                query: {
                  query_string: {
                    fields: [
                      'locationtypes.LocationSubTypeDescription.keyword'
                    ],
                    query: 'Ramp',
                    split_on_whitespace: false
                  }
                },
                inner_hits: {
                  size: 2,
                  _source: {
                    includes: ['locationtypes.LocationTypeDescription']
                  }
                }
              }
            }
          ]
        }
      }
    });
  });

  it('should handle Origin Site', () => {
    const mockResponse = {
      hits: {
        hits: [
          {
            _id: '93957',
            _source: {
              Address: {
                AddressLine2: null,
                AddressLine1: '7600 S Western Ave',
                CountryName: 'USA',
                StateName: 'Illinois',
                PostalCode: '606205818',
                CityName: 'Chicago',
                AddressID: 351568
              },
              LocationID: 93957,
              LocationCode: 'C!',
              locationroles: [
                {
                  LocationRoleTypeDescription: 'Receiver'
                },
                {
                  LocationRoleTypeDescription: 'Shipper'
                }
              ],
              LocationName: 'Norfolk Southern Landers Ramp'
            }
          }
        ]
      }
    };
    const type = getCriterion('Origin Site');
    expect(type.code).toBe('OrgnSite');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse.hits.hits[0])).toEqual({
      label:
        'Norfolk Southern Landers Ramp (C!), 7600 S Western Ave, Chicago, Illinois, USA, 606205818',
      value: '93957'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        _id: '93957',
        _source: {
          Address: {
            AddressLine2: null,
            AddressLine1: '7600 S Western Ave',
            CountryName: 'USA',
            StateName: 'Illinois',
            PostalCode: '606205818',
            CityName: 'Chicago',
            AddressID: 351568
          },
          LocationID: 93957,
          LocationCode: 'C!',
          locationroles: [
            {
              LocationRoleTypeDescription: 'Receiver'
            },
            {
              LocationRoleTypeDescription: 'Shipper'
            }
          ],
          LocationName: 'Norfolk Southern Landers Ramp'
        }
      }
    ]);
    expect(type.service.method).toBe('post');
    expect(type.service.destination).toBe(
      'elastic/masterdata-location-details/doc/_search'
    );
    expect(type.service.request_body('search')).toEqual({
      size: 5,
      _source: [
        'LocationName',
        'LocationCode',
        'LocationID',
        'Address.AddressLine1',
        'Address.AddressLine2',
        'Address.CityName',
        'Address.StateName',
        'Address.CountryName',
        'Address.PostalCode',
        'locationroles.LocationRoleTypeDescription',
        'Address.AddressID'
      ],
      query: {
        bool: {
          should: [
            {
              query_string: {
                fields: ['LocationName^6', 'LocationCode^3'],
                query: 'search*',
                default_operator: 'and'
              }
            },
            {
              query_string: {
                fields: [
                  'Address.AddressLine1^18',
                  'Address.AddressLine2^18',
                  'Address.CityName^15',
                  'Address.StateName^12',
                  'Address.PostalCode^9',
                  'Address.CountryName'
                ],
                query: 'search*',
                default_operator: 'and'
              }
            }
          ],
          minimum_should_match: 1,
          must: [
            {
              nested: {
                path: 'locationroles',
                query: {
                  query_string: {
                    fields: ['locationroles.LocationRoleTypeDescription'],
                    query: '(Shipper)',
                    split_on_whitespace: false
                  }
                },
                inner_hits: {
                  size: 1,
                  _source: {
                    includes: ['locationroles.LocationRoleTypeDescription']
                  }
                }
              }
            }
          ]
        }
      }
    });
  });

  it('should handle Origin State or Province', () => {
    const mockResponse = {
      _embedded: {
        states: [
          {
            stateName: 'mock state',
            stateCode: 'mock state code'
          }
        ]
      }
    };
    const type = getCriterion('Origin State or Province');
    expect(type.code).toBe('OrgnState');
    expect(type.dropdown).toBeTruthy();
    expect(type.mapLabelValue(mockResponse._embedded.states[0])).toEqual({
      label: 'mock state - mock state code',
      value: 'mock state code'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        stateName: 'mock state',
        stateCode: 'mock state code'
      }
    ]);
    expect(type.service.method).toBe('get');
    expect(type.service.destination).toBe(
      'masterdatageographyservices/states/'
    );
  });

  it('should handle Rail Carrier', () => {
    const mockResponse = 'Mock Value';
    const type = getCriterion('Rail Carrier');
    expect(type.code).toBe('RailCarr');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse)).toEqual({
      label: 'Mock Value',
      value: 'Mock Value'
    });
  });

  it('should handle Ramp Group', () => {
    const mockResponse = 'Mock Value';
    const type = getCriterion('Ramp Group');
    expect(type.code).toBe('RampGroup');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse)).toEqual({
      label: 'Mock Value',
      value: 'Mock Value'
    });
  });

  it('should handle Regional Distribution Center', () => {
    const mockResponse = 'Mock Value';
    const type = getCriterion('Regional Distribution Center');
    expect(type.code).toBe('RgnlDstCtr');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse)).toEqual({
      label: 'Mock Value',
      value: 'Mock Value'
    });
  });

  it('should handle Routing Group ID', () => {
    const mockResponse = 'Mock Value';
    const type = getCriterion('Routing Group ID');
    expect(type.code).toBe('RoutGrpID');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse)).toEqual({
      label: 'Mock Value',
      value: 'Mock Value'
    });
  });

  it('should handle Service Offering', () => {
    const mockResponse = {
      _embedded: {
        serviceOfferings: [
          {
            serviceOfferingDescription: 'mock service offering',
            serviceOfferingCode: 'mock code'
          }
        ]
      }
    };
    const type = getCriterion('Service Offering');
    expect(type.code).toBe('ServOffrng');
    expect(type.dropdown).toBeTruthy();
    expect(
      type.mapLabelValue(mockResponse._embedded.serviceOfferings[0])
    ).toEqual({
      label: 'mock service offering',
      value: 'mock code'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        serviceOfferingDescription: 'mock service offering',
        serviceOfferingCode: 'mock code'
      }
    ]);
    expect(type.service.destination).toBe(
      '/admin/referencedataservices/serviceOfferings'
    );
    expect(type.service.method).toBe('get');
  });

  it('should handle SCAC Code', () => {
    const mockResponse = 'Mock Value';
    const type = getCriterion('SCAC Code');
    expect(type.code).toBe('SCACCode');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse)).toEqual({
      label: 'Mock Value',
      value: 'Mock Value'
    });
  });

  it('should handle Tractor', () => {
    const mockResponse = 'Mock Value';
    const type = getCriterion('Tractor');
    expect(type.code).toBe('Tractor');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse)).toEqual({
      label: 'Mock Value',
      value: 'Mock Value'
    });
  });

  it('should handle Trading Partner', () => {
    const mockResponse = [
      {
        tradingPartnerDescription: 'mock desc',
        tradingPartnerCode: 'mock code'
      }
    ];
    const type = getCriterion('Trading Partner');
    expect(type.code).toBe('TrdngPrtnr');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse[0])).toEqual({
      label: 'mock desc (mock code)',
      value: 'mock code'
    });
    expect(type.service.response_map(mockResponse)).toEqual([
      {
        tradingPartnerDescription: 'mock desc',
        tradingPartnerCode: 'mock code'
      }
    ]);
    expect(type.service.destination).toBe(
      'ws_edi_findTradingPartners/tradingpartner/codeId?docType=214,990'
    );
    expect(type.service.method).toBe('get');
    expect(type.service.query_string('search')).toBe('&partnerCode=search');
  });

  it('should handle Truck Carrier', () => {
    const mockResponse = 'Mock Value';
    const type = getCriterion('Truck Carrier');
    expect(type.code).toBe('TrukCarier');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse)).toEqual({
      label: 'Mock Value',
      value: 'Mock Value'
    });
  });

  it('should handle Utilization Status', () => {
    const mockResponse = 'Mock Value';
    const type = getCriterion('Utilization Status');
    expect(type.code).toBe('UtilztnSts');
    expect(type.dropdown).toBeFalsy();
    expect(type.mapLabelValue(mockResponse)).toEqual({
      label: 'Mock Value',
      value: 'Mock Value'
    });
  });

  function getCriterion(typeName: string): WorkAssignmentType {
    return workAssignmentTypes.find(type => type.name === typeName);
  }
});
