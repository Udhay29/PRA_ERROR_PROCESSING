import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificationsComponent } from './notifications.component';
import { NotificationAddEditComponent } from './notification-add-edit/notification-add-edit.component';
import { NotificationDetailComponent } from './notification-detail/notification-detail.component';
import { CanDeactivateGuard } from './can-deactivate.guard';

const routes: Routes = [{
  path: '',
  component: NotificationsComponent,
}, {
  path: 'add',
  component: NotificationAddEditComponent,
  canDeactivate: [CanDeactivateGuard]
}, {
  path: ':id/edit',
  component: NotificationAddEditComponent,
  canDeactivate: [CanDeactivateGuard]
}, {
  path: ':id',
  component: NotificationDetailComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationsRoutingModule { }
