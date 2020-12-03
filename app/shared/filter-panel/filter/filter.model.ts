import { EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { NestedField } from '../../elastic.service';
import * as moment from 'moment';

export interface Filter {
  name: string;
  field: string | Array<string | NestedField>;
  type: FilterType;
  model: string[];
  queryStrings?: string[];
  constantTerm: string;
  splitTerms: boolean;
  optionChecked?: Function;
  isActive(): boolean;
  reset(): void;
}

export enum FilterType {
  CHECKBOX = 'CHECKBOX',
  ELASTIC = 'ELASTIC',
  DATERANGE = 'DATERANGE'
}

export interface FilterOptions {
  indexOf?: any;
  label: string;
  value: string;
}

export class CheckboxFilter implements Filter {
  name: string;
  field: string | Array<string | NestedField>;
  type: FilterType;
  options: Array<{ label: string; value: string }>;
  defaultOptionLabelName: string;
  showSearchOverride: boolean = false;
  splitTerms: boolean = false;
  model: string[] = [];
  searchText: string;
  selectedSearches: string[];
  suggestions: string[] = [];
  constantTerm: string = '';

  constructor(
    name: string,
    field: string | NestedField[],
    defaultOptionLabel?: string,
    options?: Set<string>,
    optionWithKeyAndValue?: Array<FilterOptions>,
    defaultModel?: string[]
  ) {
    this.name = name;
    this.field = field;
    this.defaultOptionLabelName = defaultOptionLabel;
    if (options && options.size > 0) {
      const filterOptions = Array.from(options).map(option => {
        return { label: option, value: option };
      });
      this.options = filterOptions;
    } else {
      this.options = [];
    }
    if (optionWithKeyAndValue && optionWithKeyAndValue.length > 0) {
      this.options = optionWithKeyAndValue;
    }
    if (defaultModel && defaultModel.length > 0) {
      this.model = defaultModel;
    }
    this.type = FilterType.CHECKBOX;
    return this;
  }

  isActive(): boolean {
    return this.model.length > 0;
  }

  reset(): void {
    if (this.defaultOptionLabelName) {
      const defaultOption = this.options.find(
        option => option.label === this.defaultOptionLabelName
      );
      this.model = [defaultOption.value];
    } else {
      this.model = [];
    }
    this.searchText = '';
  }

  filterValues(values: any[]): any[] {
    return values.filter(value =>
      this.model.includes(value[this.field as string])
    );
  }

  search(event: any): void {
    this.suggestions = [];
    this.options.forEach((option: { label: string; value: string }) => {
      if (option.value.indexOf(event.query) > -1) {
        this.suggestions.push(option.value);
      }
    });
  }

  searchSelected(value: any, filterChangeEmitter: EventEmitter<Filter>) {
    if (!this.selectedSearches) {
      this.selectedSearches = [];
    }
    this.selectedSearches.push(value);
    this.model.push(value);
    this.searchText = '';
    filterChangeEmitter.emit(this);
  }
}

export class ElasticFilter implements Filter {
  name: string;
  field: string | Array<string | NestedField>;
  type: FilterType;
  model: string[] = [];
  searchText: string;
  selectedSearches: string[] = [];
  searchMethod: SearchServiceMethod;
  splitTerms: boolean = false;
  search$: Subject<string> = new Subject();
  constantTerm: string = '';
  queryStrings: string[];

  constructor(
    name: string,
    field: string | Array<string | NestedField>,
    searchMethod: SearchServiceMethod,
    splitTerms?: boolean,
    constantTerm?: string
  ) {
    this.name = name;
    this.field = field;
    this.searchMethod = searchMethod;
    this.type = FilterType.ELASTIC;
    this.constantTerm = constantTerm;
    this.splitTerms = splitTerms;
    return this;
  }

  get suggestionSubject(): Observable<string[]> {
    return this.search$.pipe(
      switchMap(query => this.searchMethod(query)),
      map(results => results.filter((v, i, a) => a.indexOf(v) === i))
    );
  }

  isActive(): boolean {
    return this.model.length > 0;
  }

  reset(): void {
    this.model = [];
    this.selectedSearches = [];
    this.searchText = null;
  }

  search(query: any): void {
    this.search$.next(query);
  }

  parsedParenthesis(term: string): string {
    term = term.replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    return term;
  }

  searchSelected(
    value: any,
    filterChangeEmitter: EventEmitter<Filter>,
    searchBox: any
  ) {
    let changed: boolean = false;
    if (!this.selectedSearches.includes(value)) {
      this.selectedSearches.push(value);
      changed = true;
    }
    if (!this.model.includes(value)) {
      this.model.push(value);
      changed = true;
    }
    this.searchText = null;
    searchBox.inputEL.nativeElement.value = null;
    searchBox.value = null;
    if (changed) {
      this.model = [].concat(this.model); // Force UI to update boxes checked
      filterChangeEmitter.emit(this);
    }
  }
}
export class DateFilter implements Filter {
  name: string;
  field: string | NestedField[];
  type: FilterType;
  model: string[] = [];
  splitTerms: boolean = false;
  constantTerm: string = '';
  fromDate: string;
  toDate: string;
  selectedfromDate: string;
  selectedToDate: string;
  emitFlag: boolean;
  inValidDate: boolean;

  constructor(
    name: string,
    field: string | NestedField[]
  ) {
    this.name = name;
    this.field = field;
    this.type = FilterType.DATERANGE;
    return this;
  }

  isActive(): boolean {
    if (this.fromDate && this.toDate) {
      return true;
    }
    return false;
  }

  reset(): void {
    this.fromDate = '';
    this.toDate = '';
  }
  onSelect(filterChangeEmitter: EventEmitter<Filter>) {
    const fromDate = moment(this.fromDate).format('YYYY-MM-DD');
    const toDate = moment(this.toDate).format('YYYY-MM-DD');
    if (this.fromDate > this.toDate) {
      this.inValidDate = true;
      return;
    } else {
      this.inValidDate = false;
    }
    if (this.fromDate && this.toDate) {
      this.datecheck(filterChangeEmitter, fromDate, toDate);
    } else {
      if (this.emitFlag) {
        this.emitFlag = false;
        filterChangeEmitter.emit(this);
      }
    }
  }
  datecheck(filterChangeEmitter: EventEmitter<Filter>, fromDate: string, toDate: string) {
    if (this.selectedfromDate && this.selectedToDate) {
      if ((this.selectedfromDate === fromDate) && (this.selectedToDate === toDate)) {
        return;
      } else {
        this.selectedfromDate = fromDate;
        this.selectedToDate = toDate;
        filterChangeEmitter.emit(this);
        this.emitFlag = true;
      }
    } else {
      this.selectedfromDate = fromDate;
      this.selectedToDate = toDate;
      this.emitFlag = true;
      filterChangeEmitter.emit(this);
    }
  }
}

export type SearchServiceMethod = (query: any) => Observable<string[]>;
