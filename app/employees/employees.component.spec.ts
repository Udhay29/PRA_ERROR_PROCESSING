import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesComponent } from './employees.component';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScheduleComponent } from './schedule/schedule.component';
import { TaskDelegationComponent } from './task-delegation/task-delegation.component';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ScheduleFormComponent } from './schedule/schedule-form/schedule-form.component';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Employee } from './employees.model';
import { SourcePersonDTO, RoleDTO, TaskAssignment } from './employees.dto';

describe('EmployeesComponent', () => {
  let component: EmployeesComponent;
  let fixture: ComponentFixture<EmployeesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EmployeesComponent,
        ScheduleComponent,
        TaskDelegationComponent,
        ScheduleFormComponent
      ],
      imports: [
        PanelModule,
        ButtonModule,
        ProgressSpinnerModule,
        TableModule,
        FormsModule,
        SharedModule,
        ReactiveFormsModule,
        CalendarModule,
        AutoCompleteModule,
        DialogModule,
        DropdownModule,
        MessageModule,
        HttpClientTestingModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [ConfirmationService, MessageService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should map employess for table', () => {
    const mockEmployee = Employee.fromElasticSource({
      emplid: '123456',
      firstName: 'Bob',
      lastName: 'Parks',
      personDTO: new SourcePersonDTO(),
      roles: [new RoleDTO()],
      taskAssignments: [new TaskAssignment()],
      teams: [
        {
          teamName: 'Super Team',
          teamLeaderPersonID: '123456',
          teamPersonDTOs: [{ personEmployeeID: '123456', userID: 'BP1234' }]
        }
      ],
      userID: 'BP1234'
    });

    const actual = component.mapEmployeesForTable([mockEmployee]);
    expect(actual).toEqual([
      {
        id: 123456,
        userName: 'BP1234',
        managerid: undefined,
        fullName: 'Bob Parks',
        title: undefined,
        teams: '',
        roles: ''
      }
    ]);
  });
});
