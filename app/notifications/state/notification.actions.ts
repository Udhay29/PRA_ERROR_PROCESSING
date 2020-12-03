import { Action } from '@ngrx/store';
import { NotificationSubscription } from '../notifications.model';

export enum ActionTypes {
  LoadSelectedNotificaiton = '[Notification] Load Notification',
  ClearSelectedNotification = '[Notification] Clear Notification',
  LoadSuccess = '[Notificaiton] Load Success',
  LoadFail = '[Notification] Load Fail'
}

export class LoadSelectedNotificaiton implements Action {
  readonly type = ActionTypes.LoadSelectedNotificaiton;

  constructor(public payload: number) {}
}

export class ClearSelectedNotification implements Action {
  readonly type = ActionTypes.ClearSelectedNotification;
}

export class LoadSuccess implements Action {
  readonly type = ActionTypes.LoadSuccess;

  constructor(public payload: NotificationSubscription) {}
}

export class LoadFail implements Action {
  readonly type = ActionTypes.LoadFail;

  constructor(public payload: string) {}
}

export type NotificationActions =
  | LoadSelectedNotificaiton
  | ClearSelectedNotification
  | LoadSuccess
  | LoadFail;
