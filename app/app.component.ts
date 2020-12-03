import { Component } from '@angular/core';
import { NavigationMenuItem } from 'lib-platform-components';
import { MenuItem } from 'primeng/api';
import { AppService } from './app.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'admin-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  sidebarPinned: boolean = true;
  msgs: any;

  menuItems: NavigationMenuItem[] = [
    new NavigationMenuItem('User Management', 'icon-User_Profile_Solid', {
      routerPath: '/employees'
    }),
    new NavigationMenuItem('Driver Management', 'icon-Circle_Wheel', {
      routerPath: '/driver-management'}),
    new NavigationMenuItem('Team Management', 'icon-User_Group_Solid', {
      routerPath: '/team-management'
    }),
    new NavigationMenuItem('Task Management', 'icon-Document_List', {
      routerPath: '/taskmanagement'
    }),
    new NavigationMenuItem('Notification Management', 'icon-Notification', {
      routerPath: '/notifications'
    }),
    new NavigationMenuItem('EDI Notification Management', 'icon-Contact_Mail', {
      url: 'old/notificationsetup/edi/list'
    }),
    new NavigationMenuItem('Role Management', 'icon-Clipboard_Check', {
      url: 'old/roleassignment'
    }),
    new NavigationMenuItem('Task Category Management', 'icon-List', {
      url: 'old/taskgroup'
    }),
    new NavigationMenuItem(
      'Developer Error Reprocessing',
      'icon-Circle_Warning',
      { routerPath: '/messagereprocessing' }
    )
  ];

  breadcrumbItems: MenuItem[];

  constructor(
    private appService: AppService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title
  ) {
    this.appService
      .getBreadcrumbObservable()
      .subscribe(breadcrumbs => (this.breadcrumbItems = breadcrumbs));

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          const appTitle = this.titleService.getTitle();
          const child = this.route.firstChild;
          if (child.snapshot.data['title']) {
            return child.snapshot.data['title'];
          }
          return appTitle;
        })
      )
      .subscribe(title => this.titleService.setTitle(title));
  }

  onMenuError($error: any) {
    console.error($error);
  }

  onMenuPin($event: boolean): void {
    this.sidebarPinned = $event;
  }
}
