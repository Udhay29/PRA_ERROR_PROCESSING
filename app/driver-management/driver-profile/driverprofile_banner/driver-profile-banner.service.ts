import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Person } from './driver-profile-banner.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DriverProfileBannerService {
  readonly defaultHeaders: HttpHeaders = new HttpHeaders({ 'JBH-EOI-VER': '2.0' });
  readonly URLS: any = environment.urls.driverManagement;
  constructor(private readonly http: HttpClient) {}

  getDriverPersonalData(id: string): Observable<Person> {
    const headers = this.defaultHeaders;
    return this.http.get<Person>(`${this.URLS.personDetailURL}${id}`, {
      headers
    });
  }
}
