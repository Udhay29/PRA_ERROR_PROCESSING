import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { CertificationsService } from './certifications.service';

describe('CertificationsService', () => {
  let service: CertificationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [CertificationsService]
    });
    service = TestBed.get(CertificationsService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getCertifications', () => {
    const mockCert = {
      PersonCertification: [
        {
          EmplId: '248377',
          UserId: 'VILD5',
          Certifications: [
            {
              CertificateName: 'EFA - Emerge',
              Issuer: 'Emerge',
              CertificateNumber: '65652',
              Country: '',
              IssueDate: '2019-03-13'
            }
          ]
        }
      ]
    };

    service.getCertifications('COXB7').subscribe(res => {
      expect(res['PersonCertification'][0].Certifications[0].CertificateName).toEqual('EFA - Emerge');
    });
    const req = httpMock.expectOne('eoi/person/certifications/userid/COXB7');
    expect(req.request.method).toEqual('GET');
    req.flush(mockCert);
  });
});
