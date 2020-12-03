import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskmanagementDetailComponent } from './taskmanagement-detail.component';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TaskManagementService } from '../task-management.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

describe('TaskmanagementDetailComponent', () => {
  let component: TaskmanagementDetailComponent;
  let fixture: ComponentFixture<TaskmanagementDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TaskmanagementDetailComponent],
      imports: [
        PanelModule,
        ProgressSpinnerModule,
        ButtonModule,
        TableModule,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [TaskManagementService, ConfirmationService, MessageService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskmanagementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
