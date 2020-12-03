import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/mergeMap';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {Person, State} from './driver-overview/driver-overview-interface';

@Injectable({
  providedIn: 'root'
})
export class DriverProfileService {
  readonly defaultHeaders: HttpHeaders = new HttpHeaders({
    'JBH-EOI-VER': '2.0'
  });
  readonly URLS: any = environment.urls.driverManagement;

  constructor(private readonly http: HttpClient) {}

  getOperDataCodes(id: string) {
    const headers = this.defaultHeaders;
    return this.http.get<any>(`${this.URLS.operDataUrl}${id}`, {
      headers
    });
  }
  getDriverPersonalData(id: string): Observable<Person> {
    const headers = this.defaultHeaders;
    return this.http.get<Person>(`${this.URLS.personDetailURL}${id}`, {
      headers
    });
  }
  getFleetManagerName(userId: string): Observable<Person> {
    const headers = this.defaultHeaders;
    return this.http
      .get<any>(`${this.URLS.fleetManagerNameUrl}${userId}`, {
        headers
      })
      .mergeMap(person => {
        return this.http
          .get<any>(
            `${this.URLS.fleetManagerAlphaCodeUrl}${person.managerEmplId}`,
            { headers }
          )
          .pipe(
            map(manager => {
              person.employee = manager;
              person.displayFirstName =
                person.firstName.charAt(0) +
                person.firstName.substring(1).toLowerCase();
                person.displayLastName =
                person.lastName.charAt(0) +
                person.lastName.substring(1).toLowerCase();
              return person;
            })
          );
      });
  }
  getStateName(): Observable<State[]> {
    const headers = this.defaultHeaders;
    return this.http
        .get<any>(`${this.URLS.statesUrl}`, {
          headers
        })
        .pipe(
            map(states => {
              states = states._embedded.states;
              return states;
            })
        );
  }
}
