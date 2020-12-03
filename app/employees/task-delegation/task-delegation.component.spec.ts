import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDelegationComponent } from './task-delegation.component';
import { TableModule } from 'primeng/table';
import { ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PanelModule } from 'primeng/panel';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TaskDelegationComponent', () => {
  let component: TaskDelegationComponent;
  let fixture: ComponentFixture<TaskDelegationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TaskDelegationComponent],
      imports: [
        TableModule,
        ReactiveFormsModule,
        CalendarModule,
        AutoCompleteModule,
        PanelModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        MessageService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDelegationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
