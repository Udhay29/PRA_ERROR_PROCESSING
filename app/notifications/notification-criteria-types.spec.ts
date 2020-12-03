import { FormControl } from '@angular/forms';
import {
  createDateString,
  formatAddress,
  formatLocationAddress,
  getTwoDigitValue,
  NotificationCriteriaType,
  notificationCriteriaTypes,
  positiveNumberValidator
} from './notification-add-edit/notification-criteria-types';
import { queries } from './notification-add-edit/notificationCriteriaValueQueries';

describe('NotificationCriteriaTypes', () => {
  it('should make a 2 digit number string', () => {
    expect(getTwoDigitValue(1)).toBe('01');
    expect(getTwoDigitValue(11)).toBe('11');
  });

  it('should be valid with positive value', () => {
    const mockFormControl = new FormControl();
    mockFormControl.setValidators(positiveNumberValidator());
    mockFormControl.setValue(1);
    mockFormControl.updateValueAndValidity();
    expect(mockFormControl.valid).toBeTruthy();
  });

  it('should be invalid with negative value', () => {
    const mockFormControl = new FormControl();
    mockFormControl.setValidators(positiveNumberValidator());
    mockFormControl.setValue(-1);
    mockFormControl.updateValueAndValidity();
    expect(mockFormControl.valid).toBeFalsy();
  });

  it('should be invalid with string', () => {
    const mockFormControl = new FormControl();
    mockFormControl.setValidators(positiveNumberValidator());
    mockFormControl.setValue('a');
    mockFormControl.updateValueAndValidity();
    expect(mockFormControl.valid).toBeFalsy();
  });

  it('should format a location address', () => {
    const addressLocationObj1 = {
      LocationName: 'Location Name',
      LocationCode: 'Location Code',
      CustomerCode: 'Customer Code',
      Address: {
        AddressLine1: 'Address Line 1',
        AddressLine2: 'Address Line 2',
        CityName: 'City',
        StateName: 'State',
        CountryName: 'Country',
        PostalCode: '12345'
      }
    };
    const addressLocationObj2 = {
      locationname: 'location name',
      locationCode: 'location code',
      addressLine1: 'address line 1',
      addressLine2: 'address line 2',
      city: 'city',
      country: 'country',
      zipCode: '67890'
    };
    expect(formatLocationAddress(addressLocationObj1)).toBe(
      'Location Name (Location Code) (Customer Code), Address Line 1, Address Line 2, City, State, Country, 12345'
    );
    expect(formatLocationAddress(addressLocationObj2)).toBe(
      'location name (location code) address line 1, address line 2, city, country, 67890'
    );
  });

  it('should format an address', () => {
    const addressObj = {
      addressLineOne: 'address line one',
      addressLineTwo: 'address line two'
    };
    expect(formatAddress(addressObj)).toBe(
      'address line one, address line two'
    );
  });

  it('should properly format current date string', () => {
    expect(createDateString()).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should Map Label Value for Bill To ', () => {
    const testSourceValue = {
      _source: {
        OrganizationName: 'OrganizationName',
        PartyID: 123,
        CustomerCode: 'CustomerCode',
        Address: {
          AddressLine2: 'AddressLine2',
          AddressLine1: 'AddressLine1',
          CountryName: 'CountryName',
          StateName: 'StateName',
          PostalCode: 'PostalCode',
          CityName: 'CityName'
        }
      }
    };
    const criterion = getCriterion('Bill To');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label:
        'OrganizationName (CustomerCode), AddressLine1, AddressLine2, CityName, StateName, CountryName, PostalCode',
      value: 123
    });
  });

  it('should Map Form Value for Bill To', () => {
    const testParamValues = {
      id: 'id',
      details: {
        zipCode: 'zipCode',
        country: 'country',
        addressLineTwo: 'addressLineTwo',
        code: 'code',
        city: 'city',
        name: 'name',
        addressLineOne: 'addressLineOne',
        id: 'id',
        state: 'state',
        roleType: 'Bill To'
      }
    };
    const criterion = getCriterion('Bill To');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label:
        'name (code) addressLineOne, addressLineTwo, city, state, country, zipCode',
      value: 'id'
    });
    testParamValues.details.name = '';
    testParamValues.details.code = '';
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'addressLineOne, addressLineTwo, city, state, country, zipCode',
      value: 'id'
    });
  });

  it('should Map Response for Bill To', () => {
    const mockResponse = {
      hits: {
        hits: {
          mockProp: 'testResp'
        }
      }
    };
    const criterion = getCriterion('Bill To');
    expect(criterion.service.response_map(mockResponse)).toEqual({
      mockProp: 'testResp'
    });
  });

  it('should return Query Object for Bill To', () => {
    const criterion = getCriterion('Bill To');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.billTo
    );
  });

  it('should Map Lable Value for Corporate Account ', () => {
    const testSourceValue = {
      key: 'Abf Freight Systems Albnmx',
      Level: {
        hits: {
          hits: [
            {
              _id: '16301'
            }
          ]
        }
      }
    };
    const criterion = getCriterion('Corporate Account');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'Abf Freight Systems Albnmx',
      value: '16301'
    });
  });

  it('should Map Lable Form for Corporate Account ', () => {
    const testParamValues = {
      id: '17044',
      details: {
        zipCode: '770063634',
        country: 'USA',
        addressLineTwo: '',
        code: 'HIHOCR',
        city: 'Houston',
        name: 'High Fashion Ldcn - Oc OKX',
        addressLineOne: '3100 Travis St',
        id: '17044',
        state: 'TX',
        roleType: 'Bill To'
      }
    };
    const criterion = getCriterion('Corporate Account');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'High Fashion Ldcn - Oc OKX',
      value: '17044'
    });
  });

  it('should Map Response for Corporate Account', () => {
    const mockResponse = {
      aggregations: {
        unique: {
          buckets: ['testResp']
        }
      }
    };
    const criterion = getCriterion('Corporate Account');
    expect(criterion.service.response_map(mockResponse)).toEqual(['testResp']);
  });

  it('should return query string for Corporate Account', () => {
    const criterion = getCriterion('Corporate Account');
    expect(criterion.service.request_body('test', null)).toEqual({
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
              query: 'test*',
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
    });
  });

  it('should Map Lable Value for Line of Business', () => {
    const testSourceValue = {
      _source: {
        OrganizationName: 'Aaron Rents -Faiga',
        OrganizationID: 1
      }
    };
    const criterion = getCriterion('Line of Business');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'Aaron Rents -Faiga',
      value: 1
    });
  });

  it('should Map Form Value for Line of Business', () => {
    const testParamValues = {
      id: '41',
      details: {
        zipCode: '750382508',
        country: 'USA',
        addressLineTwo: '',
        code: 'MIIR44',
        city: 'Irving',
        name: 'Mission Foods MIIR44',
        addressLineOne: '5601 Executive Dr',
        id: '17534',
        state: 'TX',
        roleType: 'Bill To'
      }
    };
    const criterion = getCriterion('Line of Business');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Mission Foods MIIR44',
      value: '41'
    });
  });

  it('should Map Response for Line of Business', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Line of Business');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should return Query Object for Line of Business', () => {
    const criterion = getCriterion('Line of Business');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.lineOfBusiness
    );
  });

  it('should Map Lable Value for Solicitor', () => {
    const testSourceValue = {
      _source: {
        OrganizationName: 'Chemrite Copac',
        PartyID: 15697,
        Address: {
          AddressLine2: null,
          AddressLine1: '19725 W Edgewood Dr',
          CountryName: 'USA',
          StateName: 'Wisconsin',
          PostalCode: '530469738',
          CityName: 'Lannon'
        },
        CustomerCode: 'CHLAFP'
      }
    };
    const criterion = getCriterion('Solicitor');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label:
        'Chemrite Copac (CHLAFP), 19725 W Edgewood Dr, Lannon, Wisconsin, USA, 530469738',
      value: 15697
    });
  });

  it('should Map Form Value for Solicitor', () => {
    const testParamValues = {
      id: '3899',
      details: {
        firstName: 'Peter',
        lastName: 'Abaird',
        contactId: '93973',
        contactValue: 'PETERABAIRD@GMAIL.COM',
        contactType: 'Alternate',
        contactMethod: 'Email'
      }
    };
    const criterion = getCriterion('Solicitor');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Peter Abaird, 93973 (Alternate Email: PETERABAIRD@GMAIL.COM)',
      value: '3899'
    });
  });

  it('should Map Response for Solicitor', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Solicitor');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should return Query Object for Solicitor', () => {
    const criterion = getCriterion('Solicitor');
    expect(criterion.service.request_body('test', null)).toEqual({
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
                query: 'test*',
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
    });
  });

  it('should Map Lable Value for Business Unit', () => {
    const testSourceValue = {
      financeBusinessUnitServiceOfferingAssociation: {
        financeBusinessUnitCode: 'DCS'
      }
    };
    const criterion = getCriterion('Business Unit');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual('DCS');
  });

  it('should Map Form Value for Business Unit', () => {
    const testParamValues = [
      {
        id: 'DCS',
        details: {
          'Business Unit': 'DCS'
        }
      }
    ];
    const criterion = getCriterion('Business Unit');
    expect(criterion.mapFormValue(testParamValues)).toEqual('DCS');
  });

  it('should Map Response for Business Unit', () => {
    const mockResponse = {
      _embedded: {
        serviceOfferingBusinessUnitTransitModeAssociations: ['mockResp']
      }
    };
    const criterion = getCriterion('Business Unit');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Service Offering', () => {
    const testSourceValue = {
      financeBusinessUnitServiceOfferingAssociation: {
        serviceOfferingCode: 'Dedicated'
      }
    };
    const criterion = getCriterion('Service Offering');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'Dedicated',
      value: 'Dedicated'
    });
  });

  it('should Map Form Value for Service Offering', () => {
    const testParamValues = {
      id: 'FinalMile',
      details: {
        'Service Offering': 'FinalMile'
      }
    };
    const criterion = getCriterion('Service Offering');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'FinalMile',
      value: 'FinalMile'
    });
  });

  it('should Map Response for Service Offering', () => {
    const mockResponse = {
      _embedded: {
        serviceOfferingBusinessUnitTransitModeAssociations: ['mockResp']
      }
    };
    const criterion = getCriterion('Service Offering');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Order Owner', () => {
    const testSourceValue = {
      personId: '339446',
      lastName: 'Steudeman',
      preferredName: 'Cory'
    };
    const criterion = getCriterion('Order Owner');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'Cory Steudeman',
      value: '339446'
    });
  });

  it('should Map Form Value for Order Owner', () => {
    const testParamValues = {
      id: '105879',
      details: {
        'Order Owner': 'Salena Phillips'
      }
    };
    const criterion = getCriterion('Order Owner');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Salena Phillips',
      value: '105879'
    });
  });

  it('should Map Response for Order Owner', () => {
    const mockResponse = {
      content: ['mockResp']
    };
    const criterion = getCriterion('Order Owner');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Order Number', () => {
    const testSourceValue = {
      orderID: '12345'
    };
    const criterion = getCriterion('Order Number');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: '12345',
      value: '12345'
    });
  });

  it('should Map Form Value for Order Number', () => {
    const testParamValues = {
      id: '12345',
      details: null
    };
    const criterion = getCriterion('Order Number');
    expect(criterion.mapFormValue(testParamValues)).toEqual('12345');
  });

  it('should Map Response for Order Number', () => {
    const mockResponse = ['mockResp'];
    const criterion = getCriterion('Order Number');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Task Assignment', () => {
    const testSourceValue = {
      taskAssignmentID: '420',
      taskAssignmentName: 'Inbound Capacity Area 2'
    };
    const criterion = getCriterion('Task Assignment');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'Inbound Capacity Area 2',
      value: '420'
    });
  });

  it('should Map Form Value for Task Assignment', () => {
    const testParamValues = {
      id: '420',
      details: {
        taskAssignmentName: 'test'
      }
    };
    const criterion = getCriterion('Task Assignment');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'test',
      value: '420'
    });
  });

  it('should Map Response for Task Assignment', () => {
    const mockResponse = {
      _embedded: {
        taskAssignments: ['mockResp']
      }
    };
    const criterion = getCriterion('Task Assignment');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Destination', () => {
    const testSourceValue = {
      _source: {
        Address: {
          AddressLine2: null,
          AddressLine1: '1501 F St',
          CountryName: 'USA',
          StateName: 'California',
          PostalCode: '933015016',
          CityName: 'Bakersfield',
          AddressID: 223848
        },
        LocationID: 262413,
        LocationCode: 'VR',
        LocationName: 'Sante Fe/Bakersfield Ramp'
      }
    };
    const criterion = getCriterion('Destination');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label:
        'Sante Fe/Bakersfield Ramp (VR) 1501 F St, Bakersfield, California, USA, 933015016',
      value: 262413
    });
  });

  it('should Map Form Value for Destination', () => {
    const testParamValues = {
      id: '171449',
      details: {
        locationname: 'Affordable Rent To OWN LLC AFDE65',
        city: 'Deridder',
        locationID: '171449',
        addressLine1: '1005 N Pine St Ste B',
        addressLine2: '',
        state: 'LA',
        locationCode: 'AFDE65'
      }
    };
    const criterion = getCriterion('Destination');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label:
        'Affordable Rent To OWN LLC AFDE65 (AFDE65) 1005 N Pine St Ste B, Deridder, LA',
      value: '171449'
    });
  });

  it('should Map Response for Destination', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Destination');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should return Query Object for Destination', () => {
    const criterion = getCriterion('Destination');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.destination
    );
  });

  it('should Map Lable Value for Destination Marketing Area', () => {
    const testSourceValue = {
      id: '1854',
      buisnessUnit: 'ICS',
      marketingArea: '2Tra1 - New Wabash Trailers'
    };
    const criterion = getCriterion('Destination Marketing Area');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: '2Tra1 - New Wabash Trailers ICS',
      value: '1854'
    });
  });

  it('should Map Form Value for Destination Marketing Area', () => {
    const testParamValues = {
      id: 'Bnsf New Orleans, La Ramp',
      details: {
        'Destination Marketing Area': 'Bnsf New Orleans, La Ramp'
      }
    };
    const criterion = getCriterion('Destination Marketing Area');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Bnsf New Orleans, La Ramp',
      value: 'Bnsf New Orleans, La Ramp'
    });
  });

  it('should Map Form Value for Destination Marketing Area when details is null to id', () => {
    const testParamValues = {
      id: 'Bnsf New Orleans, La Ramp',
      details: null
    };
    const criterion = getCriterion('Destination Marketing Area');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Bnsf New Orleans, La Ramp',
      value: 'Bnsf New Orleans, La Ramp'
    });
  });

  it('should Map Response for Destination Marketing Area', () => {
    const mockResponse = {
      _embedded: {
        areas: ['mockResp']
      }
    };
    const criterion = getCriterion('Destination Marketing Area');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Intermediate Stop', () => {
    const testSourceValue = {
      _source: {
        Address: {
          AddressLine2: null,
          AddressLine1: '1501 F St',
          CountryName: 'USA',
          StateName: 'California',
          PostalCode: '933015016',
          CityName: 'Bakersfield',
          AddressID: 223848
        },
        LocationID: 262413,
        LocationCode: 'VR',
        LocationName: 'Sante Fe/Bakersfield Ramp'
      }
    };
    const criterion = getCriterion('Intermediate Stop');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label:
        'Sante Fe/Bakersfield Ramp Sante Fe/Bakersfield Ramp (VR) 1501 F St, Bakersfield, California, USA, 933015016',
      value: 262413
    });
  });

  it('should return Query Object for Intermediate Stop', () => {
    const criterion = getCriterion('Intermediate Stop');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.intermediateStop
    );
  });

  it('should Map Form Value for Intermediate Stop', () => {
    const testParamValues = {
      id: '171449',
      details: {
        locationname: 'Affordable Rent To OWN LLC AFDE65',
        city: 'Deridder',
        locationID: '171449',
        addressLine1: '1005 N Pine St Ste B',
        addressLine2: '',
        state: 'LA',
        locationCode: 'AFDE65'
      }
    };
    const criterion = getCriterion('Intermediate Stop');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: '1005 N Pine St Ste B, Deridder, LA',
      value: '171449'
    });
  });

  it('should Map Response for Intermediate Stop', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Intermediate Stop');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Origin', () => {
    const testSourceValue = {
      _source: {
        Address: {
          AddressLine2: null,
          AddressLine1: '1501 F St',
          CountryName: 'USA',
          StateName: 'California',
          PostalCode: '933015016',
          CityName: 'Bakersfield',
          AddressID: 223848
        },
        LocationID: 262413,
        LocationCode: 'VR',
        LocationName: 'Sante Fe/Bakersfield Ramp'
      }
    };
    const criterion = getCriterion('Origin');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label:
        'Sante Fe/Bakersfield Ramp (VR) 1501 F St, Bakersfield, California, USA, 933015016',
      value: 262413
    });
  });

  it('should return Query Object for Origin', () => {
    const criterion = getCriterion('Origin');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.origin
    );
  });

  it('should Map Form Value for Origin', () => {
    const testParamValues = {
      id: '171449',
      details: {
        locationname: 'Affordable Rent To OWN LLC AFDE65',
        city: 'Deridder',
        locationID: '171449',
        addressLine1: '1005 N Pine St Ste B',
        addressLine2: '',
        state: 'LA',
        locationCode: 'AFDE65'
      }
    };
    const criterion = getCriterion('Origin');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label:
        'Affordable Rent To OWN LLC AFDE65 (AFDE65) 1005 N Pine St Ste B, Deridder, LA',
      value: '171449'
    });
  });

  it('should Map Response for Origin', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Origin');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Origin Marketing Area', () => {
    const testSourceValue = {
      id: '1854',
      buisnessUnit: 'ICS',
      marketingArea: '2Tra1 - New Wabash Trailers'
    };
    const criterion = getCriterion('Origin Marketing Area');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: '2Tra1 - New Wabash Trailers ICS',
      value: '1854'
    });
  });

  it('should Map Form Value for Origin Marketing Area', () => {
    const testParamValues = {
      id: 'Bnsf New Orleans, La Ramp',
      details: {
        'Origin Marketing Area': 'Bnsf New Orleans, La Ramp'
      }
    };
    const criterion = getCriterion('Origin Marketing Area');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Bnsf New Orleans, La Ramp',
      value: 'Bnsf New Orleans, La Ramp'
    });
  });

  it('should Map Response for Origin Marketing Area', () => {
    const mockResponse = {
      _embedded: {
        areas: ['mockResp']
      }
    };
    const criterion = getCriterion('Origin Marketing Area');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Associated User', () => {
    const testSourceValue = {
      _id: '248472',
      _source: {
        personDTO: {
          prefName: 'Todd'
        },
        lastName: 'Geitner',
        userID: 'GEIT2'
      }
    };
    const criterion = getCriterion('Associated User');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'Todd Geitner (GEIT2)',
      value: '248472'
    });
  });

  it('should return Query Object for Associated User', () => {
    const criterion = getCriterion('Associated User');
    expect(criterion.service.request_body('test', null)).toEqual(queries.user);
  });

  it('should Map Form Value for Associated User', () => {
    const testParamValues = {
      id: '100299',
      details: {
        'Associated User': 'Philip Favorito'
      }
    };
    const criterion = getCriterion('Associated User');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Philip Favorito',
      value: '100299'
    });
  });

  it('should Map Response for Associated User', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Associated User');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Form Value for Days Till Expiration', () => {
    const testParamValues = [
      {
        id: '10',
        details: null
      }
    ];
    const criterion = getCriterion('Days Till Expiration');
    expect(criterion.mapFormValue(testParamValues)).toEqual('10');
  });

  it('should Map Form Value for Weeks From Latest Active Effective Date', () => {
    const testParamValues = [
      {
        id: '10',
        details: null
      }
    ];
    const criterion = getCriterion('Weeks From Latest Active Effective Date');
    expect(criterion.mapFormValue(testParamValues)).toEqual('10');
  });

  it('should Map Lable Value for Destination Capacity Area', () => {
    const testSourceValue = {
      id: '2',
      buisnessUnit: 'JBI',
      marketingArea: 'Alabama [North], Usa (Al)'
    };
    const criterion = getCriterion('Destination Capacity Area');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'Alabama [North], Usa (Al) - JBI',
      value: '2'
    });
  });

  it('should Map Form Value for Destination Capacity Area', () => {
    const testParamValues = {
      id: 'Drop Yard/New Britain Ct',
      details: {
        'Destination Capacity Area': 'Drop Yard/New Britain Ct'
      }
    };
    const criterion = getCriterion('Destination Capacity Area');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Drop Yard/New Britain Ct',
      value: 'Drop Yard/New Britain Ct'
    });
  });

  it('should Map Form Value for Destination Capacity Area when details is null it should be id', () => {
    const testParamValues = {
      id: 'Drop Yard/New Britain Ct',
      details: null
    };
    const criterion = getCriterion('Destination Capacity Area');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Drop Yard/New Britain Ct',
      value: 'Drop Yard/New Britain Ct'
    });
  });

  it('should Map Response for Destination Capacity Area', () => {
    const mockResponse = {
      _embedded: {
        areas: ['mockResp']
      }
    };
    const criterion = getCriterion('Destination Capacity Area');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Origin Capacity Area', () => {
    const testSourceValue = {
      id: '2',
      marketingArea: 'Alabama [North], Usa (Al)',
      buisnessUnit: 'JBI'
    };
    const criterion = getCriterion('Origin Capacity Area');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'Alabama [North], Usa (Al) - JBI',
      value: '2'
    });
  });

  it('should Map Form Value for Origin Capacity Area', () => {
    const testParamValues = {
      id: 'Ic New Orleans Ramp',
      details: {
        'Origin Capacity Area': 'Ic New Orleans Ramp'
      }
    };
    const criterion = getCriterion('Origin Capacity Area');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Ic New Orleans Ramp',
      value: 'Ic New Orleans Ramp'
    });
  });

  it('should Map Form Value for Origin Capacity Area when details is null it should be id', () => {
    const testParamValues = {
      id: 'Ic New Orleans Ramp',
      details: null
    };
    const criterion = getCriterion('Origin Capacity Area');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Ic New Orleans Ramp',
      value: 'Ic New Orleans Ramp'
    });
  });

  it('should Map Response for Origin Capacity Area', () => {
    const mockResponse = {
      _embedded: {
        areas: ['mockResp']
      }
    };
    const criterion = getCriterion('Origin Capacity Area');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Trading Partner', () => {
    const testSourceValue = {
      tradingPartnerDescription: 'WALGREENS',
      tradingPartnerCode: 'WALGREENS'
    };
    const criterion = getCriterion('Trading Partner');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'WALGREENS (WALGREENS)',
      value: 'WALGREENS'
    });
  });

  it('should Map Form Value for Trading Partner', () => {
    const testParamValues = {
      id: 'AMAZONICS',
      details: {
        'Trading Partner': 'AMAZONICS(AMAZONICS)'
      }
    };
    const criterion = getCriterion('Trading Partner');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'AMAZONICS(AMAZONICS)',
      value: 'AMAZONICS'
    });
  });

  it('should Map Response for Trading Partner', () => {
    const mockResponse = ['mockResp'];
    const criterion = getCriterion('Trading Partner');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Form Value for SCAC', () => {
    const testParamValues = [
      {
        id: '123 scac1246954',
        details: {
          SCAC: '123 scac1246954'
        }
      }
    ];
    const criterion = getCriterion('SCAC');
    expect(criterion.mapFormValue(testParamValues)).toEqual('123 scac1246954');
  });

  it('should Map Lable Value for Billing Party', () => {
    const testSourceValue = {
      key: 'Abf Freight Systems Albnmx'
    };
    const criterion = getCriterion('Billing Party');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'Abf Freight Systems Albnmx',
      value: 'Abf Freight Systems Albnmx'
    });
  });

  it('should Map Lable Form for Billing Party ', () => {
    const testParamValues = {
      id: 'Abf Freight Systems Albnmx',
      details: 'Abf Freight Systems Albnmx'
    };
    const criterion = getCriterion('Billing Party');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Abf Freight Systems Albnmx',
      value: 'Abf Freight Systems Albnmx'
    });
  });

  it('should Map Response for Billing Party', () => {
    const mockResponse = {
      aggregations: {
        unique: {
          buckets: ['testResp']
        }
      }
    };
    const criterion = getCriterion('Billing Party');
    expect(criterion.service.response_map(mockResponse)).toEqual(['testResp']);
  });

  it('should return query Obj for Billing Party', () => {
    const criterion = getCriterion('Billing Party');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.billingParty
    );
  });

  it('should Map Form Value for Origin Ramp', () => {
    const testParamValues = {
      id: '171449',
      details: {
        locationname: 'Affordable Rent To OWN LLC AFDE65',
        city: 'Deridder',
        locationID: '171449',
        addressLine1: '1005 N Pine St Ste B',
        addressLine2: '',
        state: 'LA',
        locationCode: 'AFDE65'
      }
    };
    const criterion = getCriterion('Origin Ramp');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: '1005 N Pine St Ste B, Deridder, LA',
      value: '171449'
    });
  });

  it('should Map Response for Origin Ramp', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Origin Ramp');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Destination Ramp', () => {
    const testSourceValue = {
      _source: {
        Address: {
          AddressLine2: null,
          AddressLine1: '1501 F St',
          CountryName: 'USA',
          StateName: 'California',
          PostalCode: '933015016',
          CityName: 'Bakersfield',
          AddressID: 223848
        },
        LocationID: 262413,
        LocationCode: 'VR',
        LocationName: 'Sante Fe/Bakersfield Ramp'
      }
    };
    const criterion = getCriterion('Destination Ramp');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label:
        'Sante Fe/Bakersfield Ramp (VR) 1501 F St, Bakersfield, California, USA, 933015016',
      value: 262413
    });
  });

  it('should Map Form Value for Destination Ramp', () => {
    const testParamValues = {
      id: '171449',
      details: {
        locationname: 'Affordable Rent To OWN LLC AFDE65',
        city: 'Deridder',
        locationID: '171449',
        addressLine1: '1005 N Pine St Ste B',
        addressLine2: '',
        state: 'LA',
        locationCode: 'AFDE65'
      }
    };
    const criterion = getCriterion('Destination Ramp');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: '1005 N Pine St Ste B, Deridder, LA',
      value: '171449'
    });
  });

  it('should Map Response for Destination Ramp', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Destination Ramp');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Pickup Location', () => {
    const testSourceValue = {
      _source: {
        Address: {
          AddressLine2: null,
          AddressLine1: '1501 F St',
          CountryName: 'USA',
          StateName: 'California',
          PostalCode: '933015016',
          CityName: 'Bakersfield',
          AddressID: 223848
        },
        LocationID: 262413,
        LocationCode: 'VR',
        LocationName: 'Sante Fe/Bakersfield Ramp'
      }
    };
    const criterion = getCriterion('Pickup Location');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label:
        'Sante Fe/Bakersfield Ramp (VR) 1501 F St, Bakersfield, California, USA, 933015016',
      value: 262413
    });
  });

  it('should Map Form Value for Pickup Location', () => {
    const testParamValues = {
      id: '171449',
      details: {
        locationname: 'Affordable Rent To OWN LLC AFDE65',
        city: 'Deridder',
        locationID: '171449',
        addressLine1: '1005 N Pine St Ste B',
        addressLine2: '',
        state: 'LA',
        locationCode: 'AFDE65'
      }
    };
    const criterion = getCriterion('Pickup Location');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label:
        'Affordable Rent To OWN LLC AFDE65 (AFDE65) 1005 N Pine St Ste B, Deridder, LA',
      value: '171449'
    });
  });

  it('should Map Response for Pickup Location', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Pickup Location');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should return Query Object for Pickup Location', () => {
    const criterion = getCriterion('Pickup Location');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.pickupLocation
    );
  });

  it('should Map Lable Value for Pickup City + State', () => {
    const testSourceValue = {
      _source: {
        Address: {
          AddressLine2: null,
          AddressLine1: '1501 F St',
          CountryName: 'USA',
          StateName: 'California',
          PostalCode: '933015016',
          CityName: 'Bakersfield',
          AddressID: 223848
        },
        LocationID: 262413,
        LocationCode: 'VR',
        LocationName: 'Sante Fe/Bakersfield Ramp'
      }
    };
    const criterion = getCriterion('Pickup City + State');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'Bakersfield, California',
      value: 262413
    });
  });

  it('should Map Form Value for Pickup City + State', () => {
    const testParamValues = {
      id: '171449',
      details: {
        city: 'Deridder',
        state: 'Louisiana'
      }
    };
    const criterion = getCriterion('Pickup City + State');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Deridder, Louisiana',
      value: '171449'
    });
  });

  it('should Map Response for Pickup City + State', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Pickup City + State');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should return Query Object for Pickup City + State', () => {
    const criterion = getCriterion('Pickup City + State');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.pickupCityAndState
    );
  });

  it('should Map Lable Value for Delivery City + State', () => {
    const testSourceValue = {
      _source: {
        Address: {
          AddressLine2: null,
          AddressLine1: '1501 F St',
          CountryName: 'USA',
          StateName: 'California',
          PostalCode: '933015016',
          CityName: 'Bakersfield',
          AddressID: 223848
        },
        LocationID: 262413,
        LocationCode: 'VR',
        LocationName: 'Sante Fe/Bakersfield Ramp'
      }
    };
    const criterion = getCriterion('Delivery City + State');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'Bakersfield, California',
      value: 262413
    });
  });

  it('should Map Form Value for Delivery City + State', () => {
    const testParamValues = {
      id: '171449',
      details: {
        city: 'Deridder',
        state: 'Louisiana'
      }
    };
    const criterion = getCriterion('Delivery City + State');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'Deridder, Louisiana',
      value: '171449'
    });
  });

  it('should Map Response for Delivery City + State', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Delivery City + State');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should return Query Object for Delivery City + State', () => {
    const criterion = getCriterion('Delivery City + State');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.deliveryCityAndState
    );
  });

  it('should Map Lable Value for Carrier', () => {
    const testSourceValue = {
      _source: {
        CarrierName: 'ACCESS AMERICA TRANSPORT'
      }
    };
    const criterion = getCriterion('Carrier');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'ACCESS AMERICA TRANSPORT',
      value: 'ACCESS AMERICA TRANSPORT'
    });
  });

  it('should Map Form Value for Carrier', () => {
    const testParamValues = {
      id: 'ACCESS AMERICA TRANSPORT',
      details: 'ACCESS AMERICA TRANSPORT'
    };
    const criterion = getCriterion('Carrier');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'ACCESS AMERICA TRANSPORT',
      value: 'ACCESS AMERICA TRANSPORT'
    });
  });

  it('should Map Response for Carrier', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Carrier');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should return Query Object for Carrier', () => {
    const criterion = getCriterion('Carrier');
    expect(criterion.service.request_body('test', null)).toEqual({
      size: 6,
      query: {
        bool: {
          should: [
            {
              query_string: {
                default_field: 'CarrierName',
                query: 'test*',
                default_operator: 'AND'
              }
            }
          ]
        }
      },
      _source: ['CarrierName']
    });
  });

  it('should Map Response for Operational Plan Type', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Operational Plan Type');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should return Query Object for Operational Plan Type', () => {
    const criterion = getCriterion('Operational Plan Type');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.operationalPlanType
    );
  });

  it('should Map Response for Operational Plan Sub-Type', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Operational Plan Sub-Type');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should return Query Object for Operational Plan Sub-Type', () => {
    const criterion = getCriterion('Operational Plan Sub-Type');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.operationalPlanSubType
    );
  });

  it('should Map Lable Value for Load Number', () => {
    const testSourceValue = {
      _source: {
        OperationalPlanNumber: 'L12322'
      }
    };
    const criterion = getCriterion('Load Number');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'L12322',
      value: 'L12322'
    });
  });

  it('should Map Form Value for Load Number', () => {
    const testParamValues = {
      id: 'L12322',
      details: 'L12322'
    };
    const criterion = getCriterion('Load Number');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'L12322',
      value: 'L12322'
    });
  });

  it('should Map Response for Load Number', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Load Number');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should return Query Object for Load Number', () => {
    const criterion = getCriterion('Load Number');
    expect(criterion.service.request_body('test', null)).toEqual({
      size: 6,
      query: {
        query_string: {
          default_field: 'OperationalPlanNumber',
          query: 'test*'
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
    });
  });

  it('should Map Lable Value for Delivery Location', () => {
    const testSourceValue = {
      _source: {
        Address: {
          AddressLine2: null,
          AddressLine1: '1501 F St',
          CountryName: 'USA',
          StateName: 'California',
          PostalCode: '933015016',
          CityName: 'Bakersfield',
          AddressID: 223848
        },
        LocationID: 262413,
        LocationCode: 'VR',
        LocationName: 'Sante Fe/Bakersfield Ramp'
      }
    };
    const criterion = getCriterion('Delivery Location');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: '1501 F St, Bakersfield, California, USA, 933015016',
      value: 262413
    });
  });

  it('should Map Response for Delivery Location', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Delivery Location');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should return Query Object for Origin Site', () => {
    const criterion = getCriterion('Origin Site');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.originSite
    );
  });

  it('should return Query Object for Destination Site', () => {
    const criterion = getCriterion('Destination Site');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.destinationSite
    );
  });

  it('should return Query Object for Origin Ramp', () => {
    const criterion = getCriterion('Origin Ramp');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.originRamp
    );
  });

  it('should return Query Object for Destination Ramp', () => {
    const criterion = getCriterion('Destination Ramp');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.destinationRamp
    );
  });

  it('should return Query Object for Delivery Location', () => {
    const criterion = getCriterion('Delivery Location');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.deliveryLocation
    );
  });

  it('should Map Lable Value for Operational Group - Fleet', () => {
    const testSourceValue = {
      _id: 'DCS MIIR56',
      _source: {
        OperationalGroupCode: 'DCS MIIR56'
      }
    };
    const criterion = getCriterion('Operational Group - Fleet');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'DCS MIIR56',
      value: 'DCS MIIR56'
    });
  });

  it('should return Query Object for Operational Group - Fleet', () => {
    const criterion = getCriterion('Operational Group - Fleet');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.operationalGroupFleet
    );
  });

  it('should return santized query string for Operational Group - Fleet', () => {
    const criterion = getCriterion('Operational Group - Fleet');
    const result = criterion.service.request_body(' <3?> ', null);
    expect(result['query'].bool.must[2].query_string.query).toEqual('3\\?*');
  });

  it('should Map Form Value for Operational Group - Fleet', () => {
    const testParamValues = {
      id: 'DCS MIIR56',
      details: {
        'Operational Group - Fleet': 'DCS MIIR56'
      }
    };
    const criterion = getCriterion('Operational Group - Fleet');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'DCS MIIR56',
      value: 'DCS MIIR56'
    });
  });

  it('should Map Response for Operational Group - Fleet', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Operational Group - Fleet');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });

  it('should Map Lable Value for Operational Group - Board', () => {
    const testSourceValue = {
      _id: 'DCS OPT',
      _source: {
        OperationalGroupCode: 'DCS OPT'
      }
    };
    const criterion = getCriterion('Operational Group - Board');
    expect(criterion.mapLabelValue(testSourceValue)).toEqual({
      label: 'DCS OPT',
      value: 'DCS OPT'
    });
  });

  it('should return Query Object for Operational Group - Board', () => {
    const criterion = getCriterion('Operational Group - Board');
    expect(criterion.service.request_body('test', null)).toEqual(
      queries.operationalGroupBoard
    );
  });

  it('should return santized query string for Operational Group - Board', () => {
    const criterion = getCriterion('Operational Group - Board');
    const result = criterion.service.request_body(' <3?> ', null);
    expect(result['query'].bool.must[2].query_string.query).toEqual('3\\?*');
  });

  it('should Map Form Value for Operational Group - Board', () => {
    const testParamValues = {
      id: 'DCS OPT',
      details: {
        'Operational Group - Board': 'DCS OPT'
      }
    };
    const criterion = getCriterion('Operational Group - Board');
    expect(criterion.mapFormValue(testParamValues)).toEqual({
      label: 'DCS OPT',
      value: 'DCS OPT'
    });
  });

  it('should Map Response for Operational Group - Board', () => {
    const mockResponse = {
      hits: {
        hits: ['mockResp']
      }
    };
    const criterion = getCriterion('Operational Group - Board');
    expect(criterion.service.response_map(mockResponse)).toEqual(['mockResp']);
  });
});

function getCriterion(criterionName: string): NotificationCriteriaType {
  return notificationCriteriaTypes.find(
    criterion => criterion.name === criterionName
  );
}
