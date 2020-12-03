import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeamManagementComponent } from './team-management.component';
import { TeamAddEditComponent } from './team-addEdit/team-addEdit.component';
import { TeamManagementDetailComponent } from './team-management-detail/team-management-detail.component';
import { CanDeactivateGuard } from './can-deactivate.guard';
import { AuthGuard } from './auth.guard';


const routes: Routes = [
  {
    path: '',
    component: TeamManagementComponent,
    children: [
      {
        path: 'add',
        component: TeamAddEditComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [AuthGuard]
      },
      {
        path: ':id',
        component: TeamManagementDetailComponent,
      },
      {
        path: ':id/edit',
        component: TeamAddEditComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: ':id/:templateName',
    component: TeamManagementDetailComponent,
    canDeactivate: [CanDeactivateGuard],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeammanagementRoutingModule { }
