import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeaheadComponent } from './typeahead.component';
import { AutoCompleteModule } from 'primeng/autocomplete';

describe('TypeaheadComponent', () => {
  let component: TypeaheadComponent;
  let fixture: ComponentFixture<TypeaheadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeaheadComponent ],
      imports: [ AutoCompleteModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
