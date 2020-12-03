import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskmanagementAddEditTaskComponent } from './taskmanagement-addEdit-task.component';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { TaskManagementService } from '../task-management.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { ConfirmationService } from 'primeng/api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TaskmanagementAddEditTaskComponent', () => {
  let component: TaskmanagementAddEditTaskComponent;
  let fixture: ComponentFixture<TaskmanagementAddEditTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskmanagementAddEditTaskComponent ],
      imports: [
        PanelModule,
        ProgressSpinnerModule,
        ReactiveFormsModule,
        MessageModule,
        AutoCompleteModule,
        TableModule,
        ButtonModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        TaskManagementService,
        MessageService,
        ConfirmationService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskmanagementAddEditTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


