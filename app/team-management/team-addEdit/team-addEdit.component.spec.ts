import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { ConfirmationService } from 'primeng/api';
import { AutoCompleteModule, AutoComplete } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/components/common/messageservice';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';

import { TeamDetail, TeamMemberSaveDTO } from '../team-management.model';
import { TeamManagementService } from '../team-management.service';
import { TeamAddEditComponent } from './team-addEdit.component';
import { TeamEmployee, Employee } from 'src/app/employees/employees.model';
import * as teamActions from '../state/team-management.actions';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

class Mocks {
  static makeMockMember(
    id: string,
    firstName: string,
    lastName: string,
    userName: string
  ): TeamEmployee {
    const member = new TeamEmployee();
    member.emplid = +id;
    member.firstName = firstName;
    member.lastName = lastName;
    member.personEmployeeID = id;
    member.preferredName = firstName;
    member.taskCount = 0;
    member.teamAssignmentEffectiveTimestamp = '2019-05-03T00:23:46.127';
    member.teamAssignmentExpirationTimestamp = '2099-12-31T23:59:59.5959';
    member.teamMemberPersonID = +id;
    member.title = 'Swiss Army Knife';
    member.userName = userName;
    return member;
  }
}
describe('TeamManagementAddEditTeamComponent', () => {
  let component: TeamAddEditComponent;
  let fixture: ComponentFixture<TeamAddEditComponent>;
  let teamManagementService: TeamManagementService;
  let confirmationService: ConfirmationService;
  let messageService: MessageService;
  let store: MockStore<{
    teamManagementState: {
      panelOpen: boolean;
      loading: boolean;
      selectedTeam: TeamDetail;
    };
  }>;
  let router: Router;
  let route: ActivatedRoute;
  const mockTeamDetail: TeamDetail = {
    teamName: 'SomeTeam',
    teamLeader: 'Tyler Durden',
    teamLeaderTitle: 'Manager',
    teamLeaderPersonID: '1234',
    teamLeaderUserID: '123abc',
    teamID: '1',
    teamStatus: 'Active',
    createdBy: '123abc',
    createdOn: '2018-08-24T07:23:07.923',
    updatedBy: '123abc',
    updatedOn: '2018-08-24T07:23:07.923',
    teamMembers: [
      Mocks.makeMockMember('1234', 'Tyler', 'Durden', '123abc'),
      Mocks.makeMockMember('5678', 'Robert', 'Paulson', '456def')
    ],
    taskList: [],
    taskCount: 0,
    taskAssignments: [],
    teamEffectiveTimestamp: '2018-08-24T07:23:07.923',
    teamExpirationTimestamp: '2099-12-31T23:59:00'
  };
  const initialState = {
    teamManagementState: { panelOpen: true, loading: false, selectedTeam: null }
  };
  const MINIMUM_MEMBERS = 2;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AutoCompleteModule,
        ButtonModule,
        CalendarModule,
        OverlayPanelModule,
        ProgressSpinnerModule,
        PanelModule,
        TableModule,
        InputTextModule,
        DropdownModule,
        ConfirmDialogModule,
        MessageModule,
        ReactiveFormsModule,
        AutoCompleteModule,
        FormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      declarations: [TeamAddEditComponent],
      providers: [
        ConfirmationService,
        HttpTestingController,
        MessageService,
        ConfirmationService,
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            url: of('/'),
            params: of({})
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamAddEditComponent);
    component = fixture.componentInstance;
    component.teamForm.reset();
    store = TestBed.get(Store);
    router = TestBed.get(Router);
    route = TestBed.get(ActivatedRoute);
    store.setState(initialState);
    component.loading = false;
    teamManagementService = fixture.debugElement.injector.get(
      TeamManagementService
    );
    confirmationService = fixture.debugElement.injector.get(
      ConfirmationService
    );
    messageService = fixture.debugElement.injector.get(MessageService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a member to the list of members', () => {
    const initialCount = component.teamMemberListToArray.length;
    component.addMember();
    expect(component.teamMemberListToArray.length).toBe(initialCount + 1);
  });

  it('should remove a member at a given index in the list of members', () => {
    for (let i = 0; i < 3; i++) {
      component.addMember();
      component.teamMemberListToArray.at(i).value.memberInfo = i;
    }
    component.removeMember(1);
    expect(component.teamMemberListToArray.at(1).value).toEqual({
      memberInfo: 2
    });
  });

  it('should clear the team leader input when the leader is removed from the list', () => {
    store.setState({
      teamManagementState: {
        panelOpen: true,
        loading: false,
        selectedTeam: mockTeamDetail
      }
    });
    route.params = of({ id: '1' });
    component.ngOnInit();
    component.removeMember(0);
    expect(component.teamForm.get('teamLeader').value).toEqual(null);
  });

  it('should add a blank member and team leader to an empty list of members', () => {
    const mockLeader = { emplId: 1234 };
    component.teamForm.get('teamLeader').patchValue(mockLeader);
    component.changeLeader();
    expect(component.teamMemberListToArray.length).toBe(MINIMUM_MEMBERS);
    expect(component.teamMemberListToArray.at(0).value.memberInfo.emplId).toBe(
      mockLeader.emplId
    );
  });

  it('should not duplicate a leader in the list of members', () => {
    const mockLeader = { emplId: 1234 };
    component.teamForm.get('teamLeader').patchValue(mockLeader);
    component.changeLeader();
    component.changeLeader();
    expect(component.teamMemberListToArray.length).toBe(MINIMUM_MEMBERS);
    expect(component.teamMemberListToArray.at(0).value.memberInfo.emplId).toBe(
      mockLeader.emplId
    );
  });

  it('should require a team name', () => {
    expect(component.teamForm.get('teamName').valid).toBe(false);
  });

  it('should require a team leader', () => {
    expect(component.teamForm.get('teamLeader').valid).toBe(false);
  });

  it('should require at least two team members', () => {
    component.addMember();
    expect(component.teamMemberListToArray.errors.minlength).toEqual({
      requiredLength: 2,
      actualLength: 1
    });
  });

  it('should close the right panel on if the form is clean', () => {
    spyOn(component, 'onClose');
    expect(component.canDeactivate()).toBe(true);
  });

  it('should indicate matches on leader in form', () => {
    const mockLeader = { emplId: '1234' };
    const mockMember = { emplId: '5678' };
    component.teamForm.get('teamLeader').patchValue(mockLeader);
    expect(component.isLeader(mockLeader.emplId)).toBe(true);
    expect(component.isLeader(mockMember.emplId)).toBe(false);
  });

  it('should map members in form to add dto', () => {
    component.mode = 'add';
    const expectedResult: TeamMemberSaveDTO = new TeamMemberSaveDTO();
    expectedResult.personEmployeeID = '1234';
    expectedResult.teamMemberName = 'John Doe';
    expectedResult.addedAsLeader = false;
    const mockMember = {
      memberInfo: {
        emplId: '1234',
        nameAndUsername: 'John Doe'
      }
    };
    expect(component.mapToTeamMemberSaveDTO(mockMember)).toEqual(
      expectedResult
    );
  });

  it('should populate the team form from data panel selection', () => {
    store.setState({
      teamManagementState: {
        panelOpen: true,
        loading: false,
        selectedTeam: mockTeamDetail
      }
    });
    route.params = of({ id: '1' });
    component.ngOnInit();
    expect(component.mode).toEqual('edit');
    expect(component.teamForm.get('teamName').value).toBe('SomeTeam');
    expect(component.teamForm.get('teamLeader').value.emplId).toEqual(
      mockTeamDetail.teamLeaderPersonID
    );
    expect(component.teamMemberListToArray.length).toBe(
      mockTeamDetail.teamMembers.length
    );
  });

  it('should populate the team form from direct navigation', () => {
    route.params = of({ id: '1' });
    const setState = spyOn(store, 'dispatch')
      .withArgs(new teamActions.OpenRightPanel())
      .and.callThrough()
      .withArgs(new teamActions.LoadSelectedTeam('1'))
      .and.callFake(() => {
        store.setState({
          teamManagementState: {
            panelOpen: true,
            loading: false,
            selectedTeam: mockTeamDetail
          }
        });
      });
    component.ngOnInit();
    expect(setState).toHaveBeenCalled();
  });

  it('should save a valid team form', () => {
    const saveTeamSpy = spyOn(
      teamManagementService,
      'saveTeam'
    ).and.returnValue(of({}));
    store.setState({
      teamManagementState: {
        panelOpen: true,
        loading: false,
        selectedTeam: mockTeamDetail
      }
    });
    const routerSpy = spyOn(router, 'navigate');
    const messageSpy = spyOn(messageService, 'add');
    route.params = of({ id: '1' });
    component.ngOnInit();
    component.teamForm.markAsTouched();
    component.onSave();
    expect(saveTeamSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['../../'], { relativeTo: route });
    expect(component.teamForm.pristine).toBeTruthy();
    expect(messageSpy).toHaveBeenCalled();
  });

  it('should indicate when team form is perstine onSave', () => {
    store.setState({
      teamManagementState: {
        panelOpen: true,
        loading: false,
        selectedTeam: mockTeamDetail
      }
    });
    const messageSpy = spyOn(messageService, 'add');
    route.params = of({ id: '1' });
    component.ngOnInit();
    component.onSave();
    expect(messageSpy).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'No Changes',
      detail: 'Nothing has been changed that needs saving.'
    });
  });

  it('should show error when team form is invalid', () => {
    const messageSpy = spyOn(messageService, 'add');
    component.teamForm.markAsDirty();
    component.onSave();
    expect(messageSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Invalid Form',
      detail: 'Team name is invalid, Team leader is invalid'
    });
  });

  it('should call the service to inactivate team', () => {
    spyOn(confirmationService, 'confirm').and.callFake((params: any) =>
      params.accept()
    );
    spyOn(teamManagementService, 'inactivateTeam').and.returnValue(
      of(new HttpResponse({}))
    );
    const routerSpy = spyOn(router, 'navigate');
    const resetTableSpy = spyOn(teamManagementService, 'resetTable');
    component.mode = 'edit';
    component.team = mockTeamDetail;
    component.teamForm.markAsDirty();
    component.teamForm.get('teamName').setValue('test');
    component.onInactivate();
    expect(resetTableSpy).toHaveBeenCalledWith(true);
    expect(component.teamForm.get('teamName').value).toEqual(null);
    expect(routerSpy).toHaveBeenCalledWith(['../../'], { relativeTo: route });
  });

  it('should prompt user to confirm closing add window with unsaved changes', () => {
    spyOn(confirmationService, 'confirm').and.callFake((params: any) =>
      params.accept()
    );
    const routerSpy = spyOn(router, 'navigate');
    component.teamForm.markAsDirty();
    component.teamForm.get('teamName').setValue('test');
    component.canDeactivate();
    expect(component.teamForm.get('teamName').value).toEqual(null);
    expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: route });
  });

  it('should navigate to the profile page from edit', () => {
    const routerSpy = spyOn(router, 'navigate');
    component.onViewProfile();
    expect(routerSpy).toHaveBeenCalledWith(['../', 'profile'], {
      relativeTo: route
    });
  });

  it('should handle generic http error responses', () => {
    const messageSpy = spyOn(messageService, 'add');
    spyOn(confirmationService, 'confirm').and.callFake((params: any) =>
      params.accept()
    );
    spyOn(teamManagementService, 'inactivateTeam').and.returnValue(
      throwError(new HttpErrorResponse({}))
    );
    spyOn(router, 'navigate');
    component.team = mockTeamDetail;
    component.onInactivate();
    expect(messageSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error Saving Team',
      detail: jasmine.any(String)
    });
  });

  it('should handle multiple http error responses', () => {
    const messageSpy = spyOn(messageService, 'add');
    const errors = [
      { errorMessage: ['SQL'] },
      { errorMessage: ['someMessage'] }
    ];
    spyOn(confirmationService, 'confirm').and.callFake((params: any) =>
      params.accept()
    );
    spyOn(teamManagementService, 'inactivateTeam').and.returnValue(
      throwError(
        new HttpErrorResponse({
          error: { errors: errors },
          statusText: 'someStatus'
        })
      )
    );
    spyOn(router, 'navigate');
    component.team = mockTeamDetail;
    component.onInactivate();
    expect(messageSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error Saving Team',
      detail: jasmine.any(String)
    });
  });

  it('should add an employee id to the list of selected employee ids', () => {
    const mockEvent = { emplId: 1234 };
    component.teamMemberSelected(mockEvent);
    expect(component.currentEmplIds).toContain(mockEvent.emplId);
  });

  it('should convert an array of Employee to an array of TeamMemberEntry', () => {
    const employees: Employee[] = [
      Mocks.makeMockMember('1234', 'Marla', 'Singer', 'abc123'),
      Mocks.makeMockMember('5678', 'Angel', 'Face', 'def456')
    ];
    const teamMemberEntries = component.makeSuggestions(employees);
    expect(teamMemberEntries[0].fullMemberInfo).toBe(
      'Marla Singer (abc123), Swiss Army Knife'
    );
    expect(teamMemberEntries[1].fullMemberInfo).toBe(
      'Angel Face (def456), Swiss Army Knife'
    );
  });
});
