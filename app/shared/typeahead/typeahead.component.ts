import { Component, OnInit, Input, EventEmitter, Output, ViewChild, forwardRef } from '@angular/core';
import { AutoComplete } from 'primeng/autocomplete';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'admin-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TypeaheadComponent),
    multi: true
  }]
})
export class TypeaheadComponent implements ControlValueAccessor {

  @Input()
  label: string;

  @Input()
  field: any = null;

  @Input()
  scrollHeight: string = '200px';

  @Input()
  dropdown: boolean = true;

  @Input()
  multiple: boolean = false;

  @Input()
  minLength: number = 1;

  @Input()
  delay: number = 300;

  @Input()
  style: any = {width: '100%'};

  @Input()
  styleClass: string = null;

  @Input()
  inputStyle: any = {width: '100%'};

  @Input()
  inputStyleClass: string = null;

  @Input()
  inputId: string = null;

  @Input()
  placeholder: string = null;

  @Input()
  readonly: boolean = false;

  @Input()
  disabled: boolean = false;

  @Input()
  maxlength: number = null;

  @Input()
  size: number = null;

  @Input()
  appendTo: any = null;

  @Input()
  tabindex: number = null;

  @Input()
  dataKey: string = null;

  @Input()
  autoHighlight: boolean = false;

  @Input()
  type: string = 'text';

  @Input()
  emptyMessage: string = null;

  @Input()
  immutable: boolean = true;

  @Input()
  required: boolean = false;

  @Input()
  forceSelection: boolean = true;

  @Input()
  dropdownMode: string = 'blank';

  @Input()
  isInvalid: boolean;

  @Output()
  completeMethod: EventEmitter<{originalEvent: Event, query: any}> = new EventEmitter<{originalEvent: Event, query: any}>();

  @Output()
  onFocus: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onBlur: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onKeyUp: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onSelect: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onUnselect: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onDropdownClick: EventEmitter<{originalEvent: Event, query: any}> = new EventEmitter<{originalEvent: Event, query: any}>();

  @Output()
  onClick: EventEmitter<any> = new EventEmitter<any>();

  _suggestions: any[] = null;

  @Input()
  set suggestions(sugs: any[]) {
    this._suggestions = [].concat(sugs); // because Prime can suck it.
  }
  get suggestions(): any[] {
    return this._suggestions;
  }

  @ViewChild(AutoComplete)
  autoComplete: AutoComplete;

  writeValue(value: any): void {
    return this.autoComplete.writeValue(value);
  }

  registerOnChange(fn: Function): void {
    return this.autoComplete.registerOnChange(fn);
  }

  registerOnTouched(fn: Function): void {
    return this.autoComplete.registerOnTouched(fn);
  }

  setDisabledState(val: boolean): void {
    return this.autoComplete.setDisabledState(val);
  }
}