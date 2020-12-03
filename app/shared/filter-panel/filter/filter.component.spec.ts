import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterComponent } from './filter.component';
import { FilterType, Filter } from './filter.model';
import { Observable, of, from } from 'rxjs';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import {CalendarModule} from 'primeng/calendar';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';

class MockElastic implements Filter {
  name: string = 'test elastic';
  field: string = 'test';
  type: FilterType = FilterType.ELASTIC;
  model: string[] = ['test'];
  constantTerm: string = '';
  splitTerms: false;

  isActive(): boolean {
    return this.model.length > 0;
  }

  reset(): void {
    this.model = [];
  }

  get suggestionSubject(): Observable<string[]> {
    const results = ['test'];
    return of(results);
  }
}

class MockCheckbox implements Filter {
  name: string = 'test elastic';
  field: string = 'test';
  type: FilterType = FilterType.CHECKBOX;
  model: string[] = ['test'];
  constantTerm: string = '';
  splitTerms: false;

  isActive(): boolean {
    return this.model.length > 0;
  }

  reset(): void {
    this.model = [];
  }
}

describe('FilterComponent', () => {
  let component: FilterComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterComponent ],
      imports: [
        FormsModule,
        AutoCompleteModule,
        CheckboxModule,
        CalendarModule,
        MessagesModule,
        MessageModule
      ]
    })
    .compileComponents();
  }));

  it('should create', () => {
    component = new FilterComponent();
    component.filter = new MockCheckbox();
    expect(component).toBeTruthy();
  });

  it('should set up checkbox filter', () => {
    component = new FilterComponent();
    component.filter = new MockCheckbox();
    component.ngOnInit();
    expect(component.suggestions).toBeFalsy();
  });

  it('should set up elastic filter', () => {
    component = new FilterComponent();
    component.filter = new MockElastic();
    component.ngOnInit();
    expect(component.suggestions).toEqual(['test']);
  });
});
