import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageReprocessingDetailsService {

  readonly URLS: any = environment.urls.errorReprocessing;
  constructor(private readonly httpClient: HttpClient) { }

  onDelete(detailsId: number[], data): Observable<any> {
    const params = {
      action: 'CANCELLED',
      actionPlace: '',
      errorMessageComment: '',
      isEdited: false,
      errorProcessIds: detailsId,
      jsonPayload: data.jsonPayload
    };
    const path: string = `${this.URLS.errorProcessDetails}/reprocess`;
    return this.httpClient.post(path, params);
  }
  errorProcessDetails(errorID: number): Observable<any> {
    const path: string = `${this.URLS.errorProcessDetails}/headersandpayloads?errorProcessId=${errorID}`;
    return this.httpClient.get<any>(path);
  }

}
