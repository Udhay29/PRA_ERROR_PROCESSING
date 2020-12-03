import { Component, OnInit } from '@angular/core';
import { NotificationsService } from './notifications.service';
import { RightPanelHelper } from '../shared/data-panel/RightPanelHelper';
import {
  NotificationSubscription,
  SubscriptionCriteria,
  NotificationPerson
} from './notifications.model';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DataPanelColumn, CheckboxConfig, PanelButton } from '../shared/data-panel/data-panel.component';
import { AppService } from '../app.service';
import { MenuItem } from 'primeng/api';
import { UserService, User } from 'lib-platform-services';
import { Router, ActivatedRoute } from '@angular/router';
import { Filter, ElasticFilter } from '../shared/filter-panel/filter/filter.model';
import * as moment from 'moment-timezone';

@Component({
  selector: 'admin-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  onSearch$: Subject<any>;
  notifications: NotificationSubscription[] = [];
  filters: Filter[];
  activeFilters: Filter[];
  count: number;
  tableSize: number = 25;
  firstRecord: number = 0;
  rightPanelHelper: RightPanelHelper;
  mostRecentSearch: Event;
  values: DataTableNotification[];
  columns: DataPanelColumn[] = [
    { field: 'category', header: 'Category' },
    { field: 'subcategory', header: 'Sub Category' },
    { field: 'types', header: 'Types', isList: true },
    { field: 'criteria', header: 'Criteria', isList: true },
    { field: 'createdBy', header: 'Created By', wrapText: true },
    { field: 'lastUpdatedBy', header: 'Last Updated By', wrapText: true },
    { field: 'lastUpdated', header: 'Last Updated', wrapText: true },
    { field: 'subscriberCount', header: 'Subscribers' },
    { field: 'status', header: 'Status' }
  ];
  user: User;
  checkboxConfig: CheckboxConfig;
  selectedNotifications: NotificationSubscription[];
  buttons: PanelButton[] = [];

  constructor(private appService: AppService,
              private notificationsService: NotificationsService,
              private route: ActivatedRoute,
              private router: Router,
              private userService: UserService) {
    this.rightPanelHelper = new RightPanelHelper();
    this.userService.load().subscribe(user => {
      this.user = new User(user);
      this.checkboxConfig = {
        checkboxCallback: (values) => { this.selectedNotifications = values; },
        hasAccess: true
      };
      this.buttons.push({
        label: 'Add Notification',
        style: 'ui-button-primary',
        click: this.addNewNotification
      });
    });
  }

  ngOnInit() {
    this.setBreadcrumbs();
    this.buildSearchSubject();
    this.filters = this.notificationsService.buildFilters();
    this.activeFilters = [this.filters.find(filter => filter.name === 'Status')];
    this.onSearch$.next('');
  }

  setBreadcrumbs() {
    const breadcrumbs: MenuItem[] = [
      { label: 'Notification Management', routerLink: '/notifications' }
    ];
    this.appService.breadcrumbs = breadcrumbs;
  }

  buildSearchSubject() {
    this.onSearch$ = new Subject<any>();
    this.onSearch$
      .pipe(
        switchMap(query =>
          this.notificationsService.searchForNotifications(
            query,
            this.firstRecord,
            this.tableSize,
            this.activeFilters
          )
        )
      )
      .subscribe(result => {
        this.values = this.mapNotificationsForColumns(result.notifications);
        this.count = result.count;
      });
  }

  mapNotificationsForColumns(
    notifications: NotificationSubscription[]
  ): DataTableNotification[] {
    if (!notifications) {
      return [];
    }
    const returnList: DataTableNotification[] = [];
    for (const notification of notifications) {
      returnList.push({
        id: notification.id,
        category: notification.category,
        subcategory: notification.subcategory,
        types: notification.types,
        criteria: this.convertCriteriaToString(notification.criteria),
        createdBy: this.convertNameToString(notification.creator),
        lastUpdatedBy: this.convertNameToString(notification.lastUpdater),
        lastUpdated: moment(notification.lastUpdateDateTime).tz('America/Chicago').format('MM/DD/YYYY HH:mm z'),
        subscriberCount: notification.subscribers.length,
        status: notification.status
      });
    }
    return returnList;
  }

  convertNameToString(person: NotificationPerson): string {
    let retString: string;
    retString = person.preferredName || person.firstName;
    retString += ` ${person.lastName} (${person.id})`;
    return retString;
  }

  convertCriteriaToString(criterias: SubscriptionCriteria[]): string[] {
    const retStrings: string[] = [];
    for (const criteria of criterias) {
      let constructedString: string;
      for (const value of criteria.values) {
        constructedString = criteria.code;
        if (value.details) {
          constructedString += ' - ';
          constructedString +=
            value.details[criteria.code] || value.details.name;
        }
        retStrings.push(constructedString);
      }
    }
    return retStrings;
  }

  onPageChange(event: any) {
    this.tableSize = event.rows;
    this.firstRecord = event.first;
    this.onSearch$.next(this.mostRecentSearch);
  }

  onSearch(event: any) {
    this.firstRecord = 0;
    this.mostRecentSearch = event;
    this.onSearch$.next(event);
  }

  addNewNotification = () => {
    this.router.navigate(['add/'], { relativeTo: this.route });
  }

  rowSelected(event: any) {
    this.router.navigate([event.id], { relativeTo: this.route });
  }

  onFilter(filters: Filter[]) {
    this.activeFilters = (filters as ElasticFilter[]);
    this.onSearch$.next(this.mostRecentSearch);
  }
}

class DataTableNotification {
  id: number;
  category: string;
  subcategory: string;
  types: string[];
  criteria: string[];
  createdBy: string;
  lastUpdatedBy: string;
  lastUpdated: Date;
  subscriberCount: number;
  status: string;
}
