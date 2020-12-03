import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskManagementComponent } from './task-management.component';
import { APP_BASE_HREF } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TaskManagementService } from './task-management.service';
import { UserService, LocalStorageService } from 'lib-platform-services';
import { AppService } from 'src/app/app.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { of } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { RouterTestingModule } from '@angular/router/testing';

describe('TaskManagementComponent', () => {
  let component: TaskManagementComponent;
  let fixture: ComponentFixture<TaskManagementComponent>;

  let userService, taskManagementService;

  beforeEach(async(() => {
    userService = {
      load: () => of({
        urlAccessList: []
      })
    };

    TestBed.configureTestingModule({
      imports: [HttpClientModule, RouterTestingModule],
      declarations: [TaskManagementComponent],
      providers: [
        MessageService,
        ConfirmationService,
        HttpClient,
        TaskManagementService,
        AppService,
        { provide: UserService, useValue: userService },
        LocalStorageService,
        { provide: APP_BASE_HREF, useValue: '/' },
        ConfirmationService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(TaskManagementComponent);
    taskManagementService = TestBed.get(TaskManagementService);
    spyOn(taskManagementService, 'searchForTasks').and.returnValue(of({
      tasks: [],
      hitCount: 0
    }));
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the page header "Task Management"', () => {
    const headerElement: HTMLElement = fixture.nativeElement;
    const header = headerElement.querySelector('h1');
    expect(header.textContent).toEqual('Task Management');
  });

  it('should have the appropriate headers for the Task Management table', () => {
    let columnIndex = 0;
    const title = component.columns[columnIndex++];
    expect(title).toEqual({ field: 'assignmentTitle', header: 'Assignment Title', sortable: true });
    const category = component.columns[columnIndex++];
    expect(category).toEqual({ field: 'taskCategory', header: 'Task Category', sortable: true });
    const type = component.columns[columnIndex++];
    expect(type).toEqual({ field: 'workTypes', header: 'Work Type', isList: true });
    const value = component.columns[columnIndex++];
    expect(value).toEqual({ field: 'workValues', header: 'Work Value', isList: true });
    const team = component.columns[columnIndex++];
    expect(team).toEqual({ field: 'responsibleTeams', header: 'Responsible Team', isList: true });
    const status = component.columns[columnIndex++];
    expect(status).toEqual({ field: 'status', header: 'Status' });
  });

  it('should build the filter for Assignment Title', () => {
    spyOn(component, 'buildAssignmentTitleFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildAssignmentTitleFilter).toHaveBeenCalled();
  });

  it('should build the filter for Task Category', () => {
    spyOn(component, 'buildTaskCategoryFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildTaskCategoryFilter).toHaveBeenCalled();
  });

  it('should build the Work Type filter', () => {
    spyOn(component, 'buildWorkTypeFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildWorkTypeFilter).toHaveBeenCalled();
  });

  it('should build the filter for Work Value', () => {
    spyOn(component, 'buildWorkValueFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildWorkValueFilter).toHaveBeenCalled();
  });

  it('should build the Responsible Team filter', () => {
    spyOn(component, 'buildResponsibleTeamFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildResponsibleTeamFilter).toHaveBeenCalled();
  });

  it('should build the Task Status filter', () => {
    spyOn(component, 'buildStatusFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildStatusFilter).toHaveBeenCalled();
  });

  it('should build the Role filter', () => {
    const roleFilter = component.buildRoleFilter();
    const serviceMock = spyOn(
      taskManagementService,
      'searchForRoles'
    ).and.returnValue(of(['a suggestion']));
    const eventMock = { query: 'a term' };
    expect(roleFilter.field).toEqual(
      'teamMemberTaskAssignmentRoleAssociationDTOs.roleTypeName'
    );
    expect(roleFilter.name).toEqual('Role');
    roleFilter
      .searchMethod(eventMock)
      .subscribe(result => expect(serviceMock).toHaveBeenCalledWith('a term'));
  });
});
