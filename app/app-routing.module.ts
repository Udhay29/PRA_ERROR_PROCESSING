import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorComponent } from './error/error.component';

const titleTail = ' \u2014 Administration \u2014 J.B. Hunt 360';

const titles = {
  User: 'User Management' + titleTail,
  Driver: 'Driver Management' + titleTail,
  Task: 'Task Management' + titleTail,
  Team: 'Team Management' + titleTail,
  Notification: 'Notification Management' + titleTail,
  MessageReprocessing: 'Error Reprocessing' + titleTail
};

const routes: Routes = [
  {
    path: 'employees/:id',
    loadChildren: './employees/employees.module#EmployeesModule',
    data: {
      allowRouteReuse: ['employees'],
      title: titles['User']
    }
  },
  {
    path: 'employees',
    loadChildren: './employees/employees.module#EmployeesModule',
    data: {
      allowRouteReuse: ['employees/:id'],
      title: titles['User']
    }
  },
  {
     path: 'driver-management',
     loadChildren: './driver-management/driver-management.module#DriverManagementModule',
     data: {
         allowRouteReuse: ['driver-management/user/:userid'],
         title: titles['Driver']
        }
  },
  {
     path: 'driver-management/user/:userid',
     loadChildren: './driver-management/driver-management.module#DriverManagementModule',
     data: {
         allowRouteReuse: ['driver-management'],
         title: titles['Driver']
        }
  },
  {
    path: 'taskmanagement',
    loadChildren:
      './task-management/task-management.module#TaskmanagementModule',
    data: {
      allowRouteReuse: ['taskmanagement/:id'],
      title: titles['Task']
    }
  },
  {
    path: 'taskmanagement/:id',
    loadChildren:
      './task-management/task-management.module#TaskmanagementModule',
    data: {
      allowRouteReuse: ['taskmanagement'],
      title: titles['Task']
    }
  },
  {
    path: 'team-management',
    loadChildren:
      './team-management/team-management.module#TeamManagementModule',
    data: {
      allowRouteReuse: ['team-management/profile/:id/Profile'],
      title: titles['Team']
    }
  },
  {
    path: 'team-management/profile/:id/Profile',
    pathMatch: 'full',
    loadChildren:
      './team-management/team-management.module#TeamManagementModule',
    data: {
      allowRouteReuse: ['team-management'],
      title: titles['Team']
    }
  },
  {
    path: 'notifications',
    loadChildren: './notifications/notifications.module#NotificationsModule',
    data: {
      title: titles['Notification']
    }
  },
  {
    path: 'messagereprocessing',
    loadChildren: './error-message-reprocessing/error-message-reprocessing.module#ErrorMessageReprocessingModule',
    data: {
      title: titles['MessageReprocessing']
    }
  },
  {
    path: 'error/:code',
    component: ErrorComponent
  },
  {
    path: '',
    redirectTo: 'employees',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'error/404'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
