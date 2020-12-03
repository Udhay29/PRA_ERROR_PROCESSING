import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamManagementService } from './team-management.service';
import { HttpClientModule } from '@angular/common/http';
import { TeamManagementComponent } from '../team-management/team-management.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SharedModule } from '../shared/shared.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TeammanagementRoutingModule } from './team-management-routing.module';
import { TeamAddEditComponent } from './team-addEdit/team-addEdit.component';
import { TeamManagementDetailComponent } from './team-management-detail/team-management-detail.component';
import { StoreModule } from '@ngrx/store';
import { teamManagementReducer } from './state/team-management.reducer';
import { CanDeactivateGuard } from './can-deactivate.guard';
import { EffectsModule } from '@ngrx/effects';
import { TeamEffects } from './state/team-management.effects';

@NgModule({
  declarations: [TeamManagementComponent, TeamManagementDetailComponent, TeamAddEditComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    AutoCompleteModule,
    ButtonModule,
    CalendarModule,
    OverlayPanelModule,
    TeammanagementRoutingModule,
    SharedModule,
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
    StoreModule.forFeature('teamManagementState', teamManagementReducer),
    EffectsModule.forFeature(
      [TeamEffects]
    ),
  ],
  providers: [
    TeamManagementService,
    CanDeactivateGuard
  ]
})
export class TeamManagementModule { }
