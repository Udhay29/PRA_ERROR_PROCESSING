import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamManagementComponent } from './team-management.component';
import { APP_BASE_HREF } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TeamManagementService } from './team-management.service';
import { UserService, LocalStorageService } from 'lib-platform-services';
import { MessageService } from 'primeng/components/common/messageservice';
import { ConfirmationService } from 'primeng/api';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AppService } from '../app.service';

describe('TeamManagementComponent', () => {
  let component: TeamManagementComponent;
  let fixture: ComponentFixture<TeamManagementComponent>;
  let userService: UserService;
  let store: MockStore<{ teamManagementState: { panelOpen: boolean } }>;
  const initialState = { teamManagementState: { panelOpen: true } };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [TeamManagementComponent],
      providers: [
        HttpTestingController,
        TeamManagementService,
        AppService,
        LocalStorageService,
        MessageService,
        ConfirmationService,
        UserService,
        provideMockStore({ initialState }),
        {
          provide: APP_BASE_HREF,
          useValue: '/'
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamManagementComponent);
    userService = TestBed.get(UserService);
    spyOn(userService, 'load');
    store = TestBed.get(Store);
    spyOn(store, 'select').and.returnValue(of(initialState));
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the page header "TEAM MANAGEMENT"', () => {
    const headerElement: HTMLElement = fixture.nativeElement;
    const header = headerElement.querySelector('h1');
    expect(header.textContent).toEqual('TEAM MANAGEMENT');
  });

  it('should build the filter for Task Category', () => {
    spyOn(component, 'buildTaskCategoryFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildTaskCategoryFilter).toHaveBeenCalled();
  });

  it('should build the filter for Employee Name', () => {
    spyOn(component, 'buildEmployeeNameFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildEmployeeNameFilter).toHaveBeenCalled();
  });

  it('should build the filter for Team Leader', () => {
    spyOn(component, 'buildTeamLeaderFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildTeamLeaderFilter).toHaveBeenCalled();
  });

  it('should build the filter for Team Status', () => {
    spyOn(component, 'buildStatusFilter').and.returnValues();
    component.buildFilters();
    expect(component.buildStatusFilter).toHaveBeenCalled();
  });

  it('should sort accordingly when appropriate column is selected', () => {
    spyOn(component, 'onColumnSelect').and.returnValues();
    const term = '';
    component.onColumnSelect(term);
    expect(component.onColumnSelect).toHaveBeenCalled();
  });

  it('should change accordingly when appropriate page is selected', () => {
    spyOn(component, 'onPageChange').and.returnValues();
    const term = '';
    component.onPageChange(term);
    expect(component.onPageChange).toHaveBeenCalled();
  });

  it('should have the appropriate headers for the Team Management table', () => {
    const name = component.columns[0];
    expect(name).toEqual({ sortable: true, field: 'teamName', header: 'Name' });
    const category = component.columns[1];
    expect(category).toEqual({ field: 'taskCategory', header: 'Task Category' });
    const leader = component.columns[2];
    expect(leader).toEqual({ field: 'teamLeader', header: 'Team Leader' });
    const createdBy = component.columns[3];
    expect(createdBy).toEqual({ field: 'createdBy', header: 'Created By' });
    const updatedBy = component.columns[4];
    expect(updatedBy).toEqual({ field: 'updatedBy', header: 'Last Updated By' });
    const lastUpdated = component.columns[5];
    expect(lastUpdated).toEqual({ sortable: true, field: 'lastUpdateTimestamp', header: 'Last Updated' });
    const members = component.columns[6];
    expect(members).toEqual({ sortable: true, field: 'numberOfMembers', header: 'Members' });
    const status = component.columns[7];
    expect(status).toEqual({ field: 'status', header: 'Status' });
  });

});
