import { DataPanelColumn, CheckboxConfig } from '../shared/data-panel/data-panel.component';

export interface ErrDetails {
    dateTime: string;
    errorId: string;
    errorMessage: string;
    errorMessageComment: string;
    errorProcessId: number;
    exceptionDomain: string;
    exceptionSubdomain: string;
    exceptionType: string;
    headerDetails: string;
    jsonPayload: any;
    occurrance: string;
    originQueue: string;
    status: string;
}

export interface DeleteResponse {
code: string;
codeDescription: string;
}
