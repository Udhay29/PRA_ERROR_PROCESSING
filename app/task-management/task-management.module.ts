import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { TaskmanagementRoutingModule } from './task-management-routing.module';
import { SharedModule } from '../shared/shared.module';
import { TaskManagementComponent } from './task-management.component';
import { TaskManagementService } from './task-management.service';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { TaskmanagementDetailComponent } from './task-management-detail/taskmanagement-detail.component';
import { TaskmanagementAddEditTaskComponent } from './task-management-addEdit-task/taskmanagement-addEdit-task.component';
import { DropdownModule} from 'primeng/dropdown';
import { InputTextModule} from 'primeng/inputtext';
import { AutoCompleteModule} from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MessageModule } from 'primeng/message';

@NgModule({
  declarations: [
    TaskManagementComponent,
    TaskmanagementDetailComponent,
    TaskmanagementAddEditTaskComponent
  ],
  imports: [
    AutoCompleteModule,
    ButtonModule,
    CalendarModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    MessageModule,
    OverlayPanelModule,
    PanelModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    SharedModule,
    TableModule,
    TaskmanagementRoutingModule,
  ],
  providers: [TaskManagementService]
})
export class TaskmanagementModule { }
