import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import {
  NotificationCriteriaType,
  notificationCriteriaTypes
} from '../notification-add-edit/notification-criteria-types';
import { NotificationSubscription } from '../notifications.model';
import * as fromNotifications from '../state';
import * as notificationActions from '../state/notification.actions';
import { NotificationsService } from '../notifications.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'admin-notification-detail',
  templateUrl: './notification-detail.component.html',
  styleUrls: ['./notification-detail.component.scss']
})
export class NotificationDetailComponent implements OnInit, OnDestroy {
  notification: NotificationSubscription;
  selectedNotification$: Subscription;
  criteria: any[];
  loading: boolean;
  loading$: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private appService: AppService,
    private store: Store<any>,
    private notificationService: NotificationsService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.setBreadcrumbs();
    this.loading$ = this.store
      .pipe(select(fromNotifications.getLoading))
      .subscribe((value: boolean) => {
        this.loading = value;
      });

    this.route.params.subscribe(params => {
      this.store.dispatch(
        new notificationActions.LoadSelectedNotificaiton(+params['id'])
      );
    });

    this.selectedNotification$ = this.store
      .pipe(select(fromNotifications.getSelectedNotification))
      .subscribe(notificationDetail => {
        this.notification = notificationDetail;
        if (this.notification) {
          this.mapCriteria();
        }
      });
  }

  ngOnDestroy() {
    this.selectedNotification$.unsubscribe();
    this.loading$.unsubscribe();
  }

  setBreadcrumbs() {
    const breadcrumbs: MenuItem[] = [
      { label: 'Notification Management', routerLink: '/notifications' },
      { label: 'Detail' }
    ];
    this.appService.breadcrumbs = breadcrumbs;
  }

  isInApp(deliveryMethods: string[]): boolean {
    return deliveryMethods.includes('In-App');
  }

  isEmail(deliveryMethods: string[]): boolean {
    return deliveryMethods.includes('Email');
  }

  isMobile(deliveryMethods: string[]): boolean {
    return deliveryMethods.includes('Mobile');
  }

  mapCriteria(): void {
    this.criteria = this.notification.criteria.map(criterion => {
      const criterionType: NotificationCriteriaType = notificationCriteriaTypes.find(
        type => type.name === criterion.code
      );
      let criteriaValue;
      if (criterionType.multivalue) {
        criteriaValue = criterion.values
          .map(value => {
            const returnValue = criterionType.mapFormValue(value);
            if (typeof returnValue === 'object') {
              return returnValue.label;
            } else {
              return returnValue;
            }
          })
          .join(', ');
      } else {
        criteriaValue = criterionType.mapFormValue(criterion.values);
      }
      return {
        title: criterion.code,
        value: criteriaValue
      };
    });
  }

  onEditClick() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  onInactivateClick() {
    this.confirmationService.confirm({
      message:
        'This will inactivate the notification for all subscribed users, do you wish to continue?',
      accept: () => {
        this.loading = true;
        this.notificationService
          .inactivateSubscription(this.notification.id)
          .subscribe(
            () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Inactivate Successful',
                detail: `Successfully inactivated notification subscription ${
                  this.notification.id
                }`
              });
              this.loading = false;
              this.store.dispatch(new notificationActions.ClearSelectedNotification());
              this.router.navigate(['../'], { relativeTo: this.route });
            },
            (err: HttpErrorResponse) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Inactivate Failed',
                detail: err.error
              });
              this.loading = false;
            }
          );
      }
    });
  }

  onActivateClick() {
    this.confirmationService.confirm({
      message:
        'The will activate the notification for all subscribed users, do you wish to continue?',
      accept: () => {
        this.loading = true;
        this.notificationService
          .activateSubscription(this.notification.id)
          .subscribe(
            () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Activate Successful',
                detail: `Successfully activated notification subscription ${
                  this.notification.id
                }`
              });
              this.loading = false;
              this.store.dispatch(new notificationActions.ClearSelectedNotification());
              this.router.navigate(['../'], { relativeTo: this.route });
            },
            (err: HttpErrorResponse) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Activate Failed',
                detail: err.error
              });
              this.loading = false;
            }
          );
      }
    });
  }
}
