import { Injectable } from '@angular/core';
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ErrorMessageReprocessingPayloadService {
  readonly URLS: any = environment.urls.errorReprocessing;

  constructor(private readonly httpClient: HttpClient) { }
  errorReprocess(param): Observable<any> {
    return this.httpClient.post<HttpResponseBase>(this.URLS.reprocess, param, {observe: 'response'});
  }
}
