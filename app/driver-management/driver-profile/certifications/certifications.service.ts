import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Certifications } from './certifications-interface';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CertificationsService {
    readonly defaultHeaders: HttpHeaders = new HttpHeaders({'JBH-EOI-VER': '2.0'});
    readonly phoneHeaders: HttpHeaders = new HttpHeaders({'JBH-EOI-VER': '1.0'});
    size: number;
    orgainzationID: number;
    readonly URLS: any = environment.urls.driverManagement;

    constructor(private readonly http: HttpClient) {
    }

    public getCertifications(userId: string): Observable<any> {
        const headers = this.phoneHeaders;
        return this.http
            .get<Certifications[]>(`${this.URLS.certificationUrl}${userId}`, {
                headers
            });
    }
}

