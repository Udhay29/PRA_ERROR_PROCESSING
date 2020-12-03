import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriverManagementComponent } from './driver-management.component';
import { DriverProfileComponent } from './driver-profile/driver-profile.component';

const routes: Routes = [
  {
    path: '',
    component: DriverManagementComponent
  },
  {
    path: 'user/:userId',
    component: DriverProfileComponent
  },
  { path: '**', component: DriverManagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class DriverManagementRoutingModule {}
