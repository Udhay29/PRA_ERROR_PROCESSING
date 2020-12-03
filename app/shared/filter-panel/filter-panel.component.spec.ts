import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterPanelComponent } from './filter-panel.component';
import { AccordionModule } from 'primeng/accordion';
import { FilterComponent } from './filter/filter.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import {CalendarModule} from 'primeng/calendar';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';

describe('FilterPanelComponent', () => {
  let component: FilterPanelComponent;
  let fixture: ComponentFixture<FilterPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FilterPanelComponent, FilterComponent],
      imports: [
        AccordionModule,
        AutoCompleteModule,
        FormsModule,
        CheckboxModule,
        CalendarModule,
        MessagesModule,
        MessageModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
