import { Action } from '@ngrx/store';
import { ErrDetails } from '../error-reprocessing.model';



export enum ErrorReprocessingActionTypes {
    LoadErrorDetails = '[Error Reprocessing] Error Details'
}


export class LoadErrorDetails implements Action {
    readonly type = ErrorReprocessingActionTypes.LoadErrorDetails;

    constructor(public payload: ErrDetails) {}
}

export type ErrorReprocessingActions = LoadErrorDetails;