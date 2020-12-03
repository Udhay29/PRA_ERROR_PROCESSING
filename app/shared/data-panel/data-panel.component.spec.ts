import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { DataPanelComponent } from './data-panel.component';
import { FilterPanelComponent } from '../filter-panel/filter-panel.component';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { FilterComponent } from '../filter-panel/filter/filter.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { RightPanelHelper } from './RightPanelHelper';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CheckboxFilter } from '../filter-panel/filter/filter.model';
import { By } from '@angular/platform-browser';
import { PanelModule } from 'primeng/panel';

describe('DataPanelComponent', () => {
  let component: DataPanelComponent;
  let fixture: ComponentFixture<DataPanelComponent>;
  let rightPanelHelper: RightPanelHelper;
  let setOpenSpy: jasmine.Spy;
  let setClosedSpy: jasmine.Spy;

  beforeEach(async(() => {
    rightPanelHelper = new RightPanelHelper();
    setOpenSpy = spyOn(rightPanelHelper, 'setOpen');
    setClosedSpy = spyOn(rightPanelHelper, 'setClosed');
    TestBed.configureTestingModule({
      declarations: [DataPanelComponent, FilterComponent, FilterPanelComponent],
      imports: [
        AccordionModule,
        AutoCompleteModule,
        ButtonModule,
        CheckboxModule,
        FormsModule,
        MenuModule,
        NoopAnimationsModule,
        PaginatorModule,
        TableModule,
        PanelModule
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataPanelComponent);
    component = fixture.componentInstance;
    component.values = [{}, {}];
    component.rightPanelHelper = rightPanelHelper;
    component.overflowMenu = [
      { label: 'Export to Excel' },
      { label: 'Manage Columns' }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not init without values or columns', () => {
    component.values = null;
    component.columns = null;
    let errorCaught: boolean = false;
    try {
      component.ngOnInit();
    } catch (error) {
      expect(error.message).toContain(
        'Attribute values is required. If values.length is zero then attribute columns must set.'
      );
      errorCaught = true;
    } finally {
      expect(errorCaught).toBeTruthy();
    }
  });

  it('should not init without rightPanelHelper', () => {
    component.rightPanelHelper = null;
    let errorCaught: boolean = false;
    try {
      component.ngOnInit();
    } catch (error) {
      expect(error.message).toContain(
        'RightPanelHelper not set. Without it, the right panel can\'t close.'
      );
      errorCaught = true;
    } finally {
      expect(errorCaught).toBeTruthy();
    }
  });

  it('should init with columns and no values', () => {
    component.values = null;
    component.columns = [
      {
        field: 'lorem',
        header: 'Lorem'
      },
      {
        field: 'ipsum',
        header: 'Ipsum'
      }
    ];
    let errorCaught: boolean = false;
    try {
      component.ngOnInit();
    } catch (error) {
      expect(true).toBeFalsy();
      errorCaught = true;
    } finally {
      expect(errorCaught).toBeFalsy();
    }
  });

  it('should show loading when no values', () => {
    component.values = null;
    component.ngOnChanges();
    expect(component.loading).toBeTruthy();
  });

  it('should set defaults and stop showing loading when values present', () => {
    component.values = [
      { loremIpsum: 'bleh', fooBar: 'blah' },
      { loremIpsum: 'meh', fooBar: 'mah' }
    ];
    component.checkboxConfig = { hasAccess: true, checkboxCallback: () => {} };
    component.overflowMenu = [
      { label: 'Export to Excel' },
      { label: 'Manage Columns' }
    ];
    component.ngOnChanges();
    expect(component.loading).toBeFalsy();
    expect(component.hasCheckboxes).toBeTruthy();
    expect(component.columns.length).toBe(2);
    expect(component.columns).toContain({
      field: 'loremIpsum',
      header: 'Lorem Ipsum'
    });
    expect(component.columns).toContain({ field: 'fooBar', header: 'Foo Bar' });
    expect(component.totalRecords).toBe(2);
    expect(component.filters).toContain(
      new CheckboxFilter('Lorem Ipsum', 'loremIpsum', undefined, null, [
        { label: 'bleh', value: 'bleh' },
        { label: 'meh', value: 'meh' }
      ])
    );
    expect(component.filters).toContain(
      new CheckboxFilter('Foo Bar', 'fooBar', undefined, null, [
        { label: 'blah', value: 'blah' },
        { label: 'mah', value: 'mah' }
      ])
    );
  });

  it('should update page emit an event on page change', () => {
    const event = { first: 11, rows: 10 };
    component.pageChangeHandler.subscribe(emitted => {
      expect(emitted).toBe(event);
    });
    component.onPageChange(event);
    expect(component.firstRow).toBe(11);
    expect(component.rowsPerPage).toBe(10);
  });

  it('should open the right panel on row selection', () => {
    const event = { data: 'fubar' };
    component.rowSelectedHandler.subscribe(emitted => {
      expect(emitted).toContain('fubar');
    });
    component.onRowSelect(event);
  });

  it('should update page and emit an event on column select', () => {
    component.firstRow = 10;
    component.rowsPerPage = 30;
    component.columnSelectedHandler.subscribe(emitted => {
      expect(emitted).toEqual({
        columnName: 'fubar',
        rowsPerPage: 30
      });
    });
    component.onColumnSelect('fubar');
    expect(component.firstRow).toBe(0);
    expect(component.selectedColumn).toEqual({
      columnName: 'fubar',
      direction: 'asc'
    });
  });
  it('should close dialogue on onDialogCloseDisplayColumns', () => {
    component.displayColumns = true;
    const columns = [
      { columnId: 1, field: 'fullName', header: 'Name', visible: true },
      { columnId: 2, field: 'status', header: 'Status', visible: false }
    ];
    component.onDialogCloseDisplayColumns(columns);
    expect(component.tableColumns.length).toBe(2);
    expect(component.displayColumns).toBeFalsy();
  });

  it('should add a filter to active filters and emit the active filters list on filter change', () => {
    const filter: CheckboxFilter = new CheckboxFilter(
      'Foobar',
      'foobar',
      undefined,
      new Set(['flea', 'fly', 'floo'])
    );
    filter.model = ['fly'];
    component.filterChangeHandler.subscribe(emitted => {
      expect(emitted).toContain(filter);
    });
    component.onFilterChange(filter);
    expect(component.activeFilters.length).toBe(1);
  });

  it('should replace a filter on the active filter list when it is modified', () => {
    const filter: CheckboxFilter = new CheckboxFilter(
      'Foobar',
      'foobar',
      undefined,
      new Set(['flea', 'fly', 'floo'])
    );
    filter.model = ['fly'];
    component.filterChangeHandler.subscribe(emitted => {
      expect(emitted).toContain(filter);
    });
    component.onFilterChange(filter);
    filter.model = ['flea', 'floo'];
    component.onFilterChange(filter);
    expect(component.activeFilters.length).toBe(1);
  });

  it('should remove the filter from the list when it\'s made inactive', () => {
    const filter: CheckboxFilter = new CheckboxFilter(
      'Foobar',
      'foobar',
      undefined,
      new Set(['flea', 'fly', 'floo'])
    );
    filter.model = ['fly'];
    component.onFilterChange(filter);
    expect(component.activeFilters.length).toBe(1);
    filter.model = [];
    component.filterChangeHandler.subscribe(emitted => {
      expect(emitted).not.toContain(filter);
    });
    component.onFilterChange(filter);
    expect(component.activeFilters.length).toBe(0);
  });

  it('should toggle the filter panel on button push', () => {
    component.displayFilterPanel = false;
    component.onFilterButtonClick();
    expect(component.displayFilterPanel).toBeTruthy();
    component.onFilterButtonClick();
    expect(component.displayFilterPanel).toBeFalsy();
  });

  it('should build a title for a table cell', () => {
    const stringTitle: string = 'value';
    let output = component.buildTitleForTd(stringTitle);
    expect(output).toEqual(stringTitle);
    const arrayTitle: string[] = ['oneValue', 'twoValue'];
    output = component.buildTitleForTd(arrayTitle);
    expect(output).toEqual('oneValue\ntwoValue');
  });

  it('should note that the head chechbox has been checked', () => {
    component.headCheckbox.checked = false;
    component.headCheckboxChanged({ target: { checked: true } });
    expect(component.headCheckbox.checked).toBeTruthy();
  });

  it('should toggle the head checkbox and all checkboxes when it\'s clicked', () => {
    const event = { stopPropagation: () => {} };
    const callbackSpy = jasmine.createSpy('callback');
    component.checkboxConfig = {
      hasAccess: true,
      checkboxCallback: callbackSpy
    };
    const focusSpy = jasmine.createSpy('focus');
    component.headCheckbox.checked = false;
    component.headCheckboxClicked(event, { focus: focusSpy });
    expect(component.headCheckbox.checked).toBeTruthy();
    component.values.forEach(val => {
      expect(val).toEqual({ checked: true });
    });
    expect(callbackSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should set headCheckbox to focused when focused', () => {
    component.headCheckbox.focused = false;
    component.headCheckboxFocused();
    expect(component.headCheckbox.focused).toBeTruthy();
  });

  it('should set headCheckbox to focused when focused', () => {
    component.headCheckbox.focused = true;
    component.headCheckboxBlurred();
    expect(component.headCheckbox.focused).toBeFalsy();
  });

  it('should note that the head chechbox has been checked', () => {
    const row = component.values[0];
    row.checked = false;
    component.checkBoxChanged({ target: { checked: true } }, row);
    expect(row.checked).toBeTruthy();
  });

  it('should toggle the head checkbox and all checkboxes when it\'s clicked', () => {
    const event = { stopPropagation: () => {} };
    const callbackSpy = jasmine.createSpy('callback');
    component.checkboxConfig = {
      hasAccess: true,
      checkboxCallback: callbackSpy
    };
    const focusSpy = jasmine.createSpy('focus');
    const row = component.values[0];
    row.checked = false;
    component.checkBoxClicked(event, row, { focus: focusSpy });
    expect(row.checked).toBeTruthy();
    expect(callbackSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should set headCheckbox to focused when focused', () => {
    const row = component.values[0];
    row.focused = false;
    component.checkBoxFocused(row);
    expect(row.focused).toBeTruthy();
  });

  it('should set headCheckbox to focused when focused', () => {
    const row = component.values[0];
    row.focused = true;
    component.checkBoxBlurred(row);
    expect(row.focused).toBeFalsy();
  });

  it('should filter values to match the search term when no other method is subscribed to search', fakeAsync(() => {
    const values = [
      { name: 'Tony Stark', rank: 'Avenger', id: 1 },
      { name: 'Steve Rogers', rank: 'Avenger', id: 2 },
      { name: 'Bruce Banner', rank: 'Avenger', id: 3 },
      { name: 'Maria Hill', rank: 'Deputy Director', id: 4 },
      { name: 'Nick Fury', rank: 'Director', id: 5 }
    ];
    component.values = values;
    component.searchChangeHandler.emit('Avenger');
    tick();
    expect(component.originalValues).toBe(values);
    expect(component.values.length).toBe(3);
    expect(component.values).toContain({
      name: 'Tony Stark',
      rank: 'Avenger',
      id: 1
    });
    expect(component.values).toContain({
      name: 'Steve Rogers',
      rank: 'Avenger',
      id: 2
    });
    expect(component.values).toContain({
      name: 'Bruce Banner',
      rank: 'Avenger',
      id: 3
    });
  }));
  it('should set displaycolumns to true when manageColumns is called', () => {
    component.manageColumns();
    expect(component.displayColumns).toBe(true);
  });
});
