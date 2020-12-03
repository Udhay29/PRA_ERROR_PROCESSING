import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageColumnsComponent } from './manage-columns.component';
import { MessageService } from 'primeng/components/common/messageservice';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {LocalStorageService} from 'lib-platform-services';


export class TranslateServiceStub {
  get(key: any): any {
    of(key);
  }
}

describe('ManageColumnsComponent', () => {
  let component: ManageColumnsComponent;
  let fixture: ComponentFixture<ManageColumnsComponent>;
  const column1 = {
    columnId: 123,
    field: 'field1',
    header: 'header1',
    visible: true
  };
  const column2 = {
    columnId: 234,
    field: 'field2',
    header: 'header2',
    visible: false
  };
  const column3 = {
    columnId: 345,
    field: 'field2',
    header: 'header2',
    visible: true
  };
  const column4 = {
    columnId: 456,
    field: 'field2',
    header: 'header2',
    visible: true
  };
  const column5 = {
    columnId: 567,
    field: 'field2',
    header: 'header2',
    visible: true
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageColumnsComponent],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [MessageService, LocalStorageService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageColumnsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render order list in a p-orderList tag', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll('p-orderList').length).toBe(1);
  });

  it('should do the right calculation when call onVisibleToggle', () => {
    const column1after = {
      columnId: 123,
      field: 'field1',
      header: 'header1',
      visible: false
    };
    const column2after = {
      columnId: 234,
      field: 'field2',
      header: 'header2',
      visible: true
    };
    const mockCol1 = {...column1};
    const mockCol2 = {...column2};
    const mockCol3 = {...column3};
    const mockCol4 = {...column4};
    const mockCol5 = {...column5};
    component.manageColumnsList = [mockCol1, mockCol2, mockCol3, mockCol4, mockCol5];
    component.onVisibleToggle(mockCol1);
    expect(component.manageColumnsList).toEqual([column1after, mockCol2, mockCol3, mockCol4, mockCol5]);
    component.onVisibleToggle(mockCol2);
    expect(component.manageColumnsList).toEqual([column1after, column2after, mockCol3, mockCol4, mockCol5]);
  });

  it('should do the right calculation when call onVisibleToggle when there are less than 3 visible columns', () => {
    const mockCol1 = {...column1};
    const mockCol2 = {...column2};
    const mockCol3 = {...column3};
    component.manageColumnsList = [mockCol1, mockCol2, mockCol3];
    component.onVisibleToggle(mockCol1);
    expect(component.manageColumnsList).toEqual([mockCol1, mockCol2, mockCol3]);
  });

  it('should delete the column when call deletecolumn', () => {
    const mockCol1 = {...column1};
    const mockCol2 = {...column2};
    const mockCol3 = {...column3};
    component.manageColumnsList = [mockCol1, mockCol2, mockCol3];
    component.deleteColumn(mockCol1.columnId);
    expect(component.manageColumnsList).toEqual([mockCol2, mockCol3]);
  });
});

