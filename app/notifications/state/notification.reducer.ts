import { NotificationSubscription } from '../notifications.model';
import { NotificationActions, ActionTypes } from './notification.actions';

export interface State {
  selectedNotification: NotificationSubscription;
  error: string;
  loading: boolean;
}

export const initialState: State = {
  selectedNotification: null,
  error: '',
  loading: false
};

export function notificationReducer(
  state = initialState,
  action: NotificationActions
): State {
  switch (action.type) {
    case ActionTypes.ClearSelectedNotification: {
      return {
        ...state,
        selectedNotification: null
      };
    }

    case ActionTypes.LoadSelectedNotificaiton: {
      return {
        ...state,
        loading: true
      };
    }

    case ActionTypes.LoadSuccess: {
      return {
        ...state,
        selectedNotification: action.payload,
        error: '',
        loading: false
      };
    }

    case ActionTypes.LoadFail: {
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    }

    default: {
      return state;
    }
  }
}
