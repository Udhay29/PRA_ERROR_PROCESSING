export const queries = {
  corporateAccount: {
    size: 0,
    _source: ['OrganizationName', 'Level'],
    query: {
      bool: {
        should: {
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
            query: '*',
            default_operator: 'AND'
          }
        }
      }
    },
    aggs: {
      unique: {
        terms: {
          field: 'OrganizationName.keyword',
          size: 7
        },
        aggs: {
          Level: {
            top_hits: {
              _source: {
                includes: ['OrganizationName', 'Level', 'OrganizationID']
              },
              size: 1
            }
          }
        }
      }
    }
  },
  lineOfBusiness: {
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
              query: '*',
              default_operator: 'AND',
              analyze_wildcard: true
            }
          }
        ]
      }
    },
    aggs: {
      unique: {
        terms: {
          field: 'OrganizationName.keyword',
          size: 5
        },
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
  },
  user: {
    query: {
      bool: {
        must: [
          {
            query_string: {
              query: '<this will be replaced>',
              analyze_wildcard: true,
              fields: [
                'firstName^2',
                'lastName^2',
                'personDTO.prefName^2',
                'emplid',
                'userID',
                'personDTO.jobTitle',
                'roles.roleTypeName',
                'teams.teamName'
              ]
            }
          }
        ]
      }
    },
    from: 0,
    size: 25,
    _source: [
      'firstName',
      'lastName',
      'personDTO.prefName',
      'emplid',
      'userID',
      'personDTO.jobTitle',
      'roles.roleTypeName',
      'teams.teamName'
    ]
  },
  billTo: {
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
              query: '<Insert Value here>*',
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
                _source: {
                  includes: ['partyroles.PartyRoleTypeDescription']
                }
              }
            }
          }
        ]
      }
    }
  },
  solicitor: {
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
              query: '<Insert Value here>*',
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
                _source: {
                  includes: ['partyroles.PartyRoleTypeDescription']
                }
              }
            }
          }
        ]
      }
    }
  },
  destination: {
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
              query: '<Insert value here>*',
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
              query: '<Insert value here>*',
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
                  query: '(Shipper)(Receiver)',
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
  },
  intermediateStop: {
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
              query: '<Insert value here>*',
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
              query: '<Insert value here>*',
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
                  query: '(Shipper)(Receiver)',
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
  },
  origin: {
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
              query: '<Insert value here>*',
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
              query: '<Insert value here>*',
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
                  query: '(Shipper)(Receiver)',
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
  },
  billingParty: {
    size: 0,
    _source: ['OrganizationName', 'Level'],
    query: {
      bool: {
        should: {
          query_string: {
            default_field: 'OrganizationName',
            query: '<Insert value here>*',
            default_operator: 'AND',
            analyze_wildcard: true
          }
        }
      }
    },
    aggs: {
      unique: {
        terms: {
          field: 'OrganizationName.keyword',
          size: 7
        },
        aggs: {
          Level: {
            top_hits: {
              _source: {
                includes: ['OrganizationName', 'Level', 'OrganizationID']
              },
              size: 1
            }
          }
        }
      }
    }
  },
  destinationSite: {
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
              query: '<!insert value here!>*',
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
              query: '<!insert value here!>*',
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
  },
  originSite: {
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
              query: '<!insert value here!>*',
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
              query: '<!insert value here!>*',
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
  },
  destinationRamp: {
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
              query: '<!insert value here!>*',
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
                  fields: ['locationtypes.LocationSubTypeDescription.keyword'],
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
  },
  originRamp: {
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
              query: '<!insert value here!>*',
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
                  fields: ['locationtypes.LocationSubTypeDescription.keyword'],
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
  },
  pickupLocation: {
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
              query: '<!insert value here!>*',
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
              query: '<!insert value here!>*',
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
                  query: '(Shipper)(Receiver)',
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
  },
  deliveryLocation: {
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
              query: '<!insert value here!>*',
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
              query: '<!insert value here!>*',
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
                  query: '(Shipper)(Receiver)',
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
  },
  pickupCityAndState: {
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
              query: '<!insert value here!>*',
              default_operator: 'and'
            }
          },
          {
            query_string: {
              fields: ['Address.CityName^15', 'Address.StateName^12'],
              query: '<!insert value here!>*',
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
                  query: '(Shipper)(Receiver)',
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
  },
  deliveryCityAndState: {
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
              query: '<!insert value here!>*',
              default_operator: 'and'
            }
          },
          {
            query_string: {
              fields: [
                'Address.CityName^15',
                'Address.StateName^12',
                'LocationID'
              ],
              query: '<!insert value here!>*',
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
                  query: '(Shipper)(Receiver)',
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
  },
  operationalGroupFleet: {
    query: {
      bool: {
        must: [
          {
            match: {
              OperationalGroupTypeCode: 'Fleet'
            }
          },
          {
            match: {
              Status: 'Active'
            }
          },
          {
            query_string: {
              query: '<Insert query here*>',
              fields: ['OperationalGroupCode', 'OperationalGroupDescription'],
              analyze_wildcard: true
            }
          }
        ]
      }
    },
    _source: ['OperationalGroupCode', 'OperationalGroupDescription']
  },
  operationalGroupBoard: {
    query: {
      bool: {
        must: [
          {
            match: {
              OperationalGroupTypeCode: 'Board'
            }
          },
          {
            match: {
              Status: 'Active'
            }
          },
          {
            query_string: {
              query: '<Insert query here*>',
              fields: ['OperationalGroupCode', 'OperationalGroupDescription'],
              analyze_wildcard: true
            }
          }
        ]
      }
    },
    _source: ['OperationalGroupCode', 'OperationalGroupDescription']
  },
  dispatcher: {
    query: {
      bool: {
        filter: [
          {
            query_string: {
              fields: ['Dispatcher'],
              query: '*',
              default_operator: 'AND'
            }
          }
        ],
        must: [
          {
            query_string: {
              fields: [
                'taskAssignmentName',
                'taskGroupName',
                'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskAssignmentResponsibilityDetailValueDesc',
                'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskResponsibilityTypeDescription',
                'teamMemberTaskAssignmentRoleAssociationDTOs.teamName'
              ],
              query: 'Dispatcher',
              analyzer: 'whitespace_lowercase',
              analyze_wildcard: true
            }
          }
        ]
      }
    },
    from: 0,
    size: 25,
    _source: [
      'taskAssignmentName',
      'expirationTimestamp',
      'taskGroupName',
      'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskAssignmentResponsibilityDetailValueDesc',
      'taskAssignmentResponsibilityGroupDTOs.taskAssignmentResponsibilityDetailDTOs.taskResponsibilityTypeDescription',
      'teamMemberTaskAssignmentRoleAssociationDTOs.teamName',
      'taskAssignmentID'
    ]
  },
  loadNumber: {
    size: 6,
    query: {
      query_string: {
        default_field: 'OperationalPlanNumber',
        query: '<Insert Value Here>*'
      }
    },
    _source: ['OperationalPlanNumber'],
    sort: [
      {
        'OperationalPlanNumber.keyword': {
          order: 'asc'
        }
      }
    ]
  },
  carrier: {
    size: 6,
    query: {
      bool: {
        should: [
          {
            query_string: {
              default_field: 'CarrierName',
              query: '<Insert Value Here>*',
              default_operator: 'AND'
            }
          }
        ]
      }
    },
    _source: ['CarrierName']
  },
  operationalPlanType: {
    size: 6,
    query: {
      bool: {
        should: [
          {
            query_string: {
              fields: [
                'OperationalPlanTypeCode',
                'OperationalPlanTypeDescription',
                'OperationalPlanFinanceBusinessUnitCode'
              ],
              query: '*',
              default_operator: 'AND'
            }
          }
        ]
      }
    },
    _source: [
      'OperationalPlanTypeCode',
      'OperationalPlanTypeDescription',
      'OperationalPlanFinanceBusinessUnitCode'
    ]
  },
  operationalPlanSubType: {
    query: {
      bool: {
        should: [
          {
            query_string: {
              fields: [
                'OperationalPlanSubTypeCode',
                'OperationalPlanSubTypeDescription',
                'OperationalPlanFinanceBusinessUnitCode'
              ],
              query: '<Insert Value Here>*',
              default_operator: 'AND'
            }
          }
        ]
      }
    },
    _source: [
      'OperationalPlanSubTypeCode',
      'OperationalPlanSubTypeDescription',
      'OperationalPlanFinanceBusinessUnitCode'
    ]
  }
};
