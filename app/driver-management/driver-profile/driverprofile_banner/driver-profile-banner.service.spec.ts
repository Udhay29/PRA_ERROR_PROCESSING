import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { DriverProfileBannerService } from './driver-profile-banner.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

describe('DriverProfileBannerService', () => {
  let service: DriverProfileBannerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, HttpClientModule],
      providers: [DriverProfileBannerService ]
    });
    service = TestBed.get(DriverProfileBannerService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
