import { ErrorReprocessingActionTypes, ErrorReprocessingActions } from './error-reprocessing.actions';
import { ErrDetails } from '../error-reprocessing.model';

export interface State {
    errorDetails: ErrDetails;
}
const initialState: State = {
    errorDetails: null
};

export function reducer(state = initialState, action: ErrorReprocessingActions) {

    switch (action.type) {
        case ErrorReprocessingActionTypes.LoadErrorDetails:
            return {...state, errorDetails: action.payload};
        default:
            return state;
    }
}