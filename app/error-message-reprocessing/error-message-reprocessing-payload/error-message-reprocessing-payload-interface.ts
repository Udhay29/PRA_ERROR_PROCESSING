export class Response {
    exceptionDomain: string;
    exceptionSubdomain: string;
    originQueue: string;
    exceptionType: string;
    dateTime: string;
    occurrance: string | null;
    status: string;
    errorMessage: string;
    headerDetails: string | null;
    jsonPayload: Payload;
    errorMessageComment: string | null;
    errorId: string | null;
    errorProcessId: number;
}

export class Payload {
    headers: object;
    body: object;
}