import { createSelector, createFeatureSelector } from '@ngrx/store';
import { State } from './notification.reducer';

const getNotificationFeatureState = createFeatureSelector<State>('notificationState');

export const getSelectedNotification = createSelector(
  getNotificationFeatureState,
  state => state.selectedNotification
);

export const getError = createSelector(
  getNotificationFeatureState,
  state => state.error
);

export const getLoading = createSelector(
  getNotificationFeatureState,
  state => state.loading
);