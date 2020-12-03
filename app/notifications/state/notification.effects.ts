import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store, select } from '@ngrx/store';

import * as notificationActions from './notification.actions';
import * as fromNotification from './';
import { Observable, of } from 'rxjs';
import {
  mergeMap,
  map,
  catchError,
  withLatestFrom,
  switchMap
} from 'rxjs/operators';
import { NotificationsService } from '../notifications.service';
import { NotificationSubscription } from '../notifications.model';

@Injectable()
export class NotificationEffects {
  constructor(
    private notificationsService: NotificationsService,
    private actions$: Actions,
    private store$: Store<any>
  ) {}

  @Effect()
  loadSelectedNotification$: Observable<Action> = this.actions$.pipe(
    ofType(notificationActions.ActionTypes.LoadSelectedNotificaiton),
    map(
      (action: notificationActions.LoadSelectedNotificaiton) => action.payload
    ),
    withLatestFrom(
      this.store$.select(fromNotification.getSelectedNotification)
    ),
    mergeMap(value => {
      const selectedId: number = value[0];
      const selectedNotification: NotificationSubscription = value[1];
      if (selectedNotification && selectedNotification.id === selectedId) {
        return of(new notificationActions.LoadSuccess(selectedNotification));
      } else {
        return this.notificationsService.getNotificationDetails(selectedId).pipe(
          map(
            notificationDetails =>
              new notificationActions.LoadSuccess(notificationDetails)
          ),
          catchError(err => of(new notificationActions.LoadFail(err)))
        );
      }
    })
  );
}
