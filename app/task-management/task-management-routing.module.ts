import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskManagementComponent } from './task-management.component';


const routes: Routes = [
  {
    path: '',
    component: TaskManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskmanagementRoutingModule { }
