import { environment } from '../../../../environments/environment';
import { Contact, HireData, People, State } from './driver-overview-interface';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/mergeMap';

@Injectable({
  providedIn: 'root'
})
export class DriverOverviewService {
  readonly defaultHeaders: HttpHeaders = new HttpHeaders({
    'JBH-EOI-VER': '2.0'
  });
  readonly phoneHeaders: HttpHeaders = new HttpHeaders({
    'JBH-EOI-VER': '1.0'
  });
  readonly URLS: any = environment.urls.driverManagement;
  orgainzationID: number;

  constructor(private readonly http: HttpClient) {}

  public getCellNumber(id: string): Observable<Contact> {
    const headers = this.phoneHeaders;
    return this.http
      .get<Contact>(`${this.URLS.cellNumberURL}${id}`, {
        headers
      })
      .pipe(
        map(res => {
          res.contacts = res.contacts.filter(
            (thing, index, self) =>
              index ===
              self.findIndex(t => t.contactSubType === thing.contactSubType)
          );
          return res;
        })
      );
  }
  getHireDate(userId: string): Observable<HireData> {
    const headers = this.defaultHeaders;
    return this.http.get<HireData>(`${this.URLS.hireDataUrl}${userId}`, {
      headers
    });
  }

  getDateOfBirth(id: string): Observable<People> {
    const headers = this.defaultHeaders;
    const params = new HttpParams()
      .set(
        'select',
        'person.firstname, person.lastname, person.userid, person.dateofbirth'
      )
      .set(
        'criteria',
        `person.userid in ('${id}') and person.isactive eq true`
      );
    return this.http
      .get<People>(this.URLS.dateOfBirthUrl, { headers, params })

      .pipe(map(res => res['people']));
  }
}
