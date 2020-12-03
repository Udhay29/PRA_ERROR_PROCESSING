import { TestBed } from '@angular/core/testing';

import { ErrorMessageReprocessingPayloadService } from './error-message-reprocessing-payload.service';
import { HttpClient } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { APP_BASE_HREF } from '@angular/common';

describe('ErrorMessageReprocessingPayloadService', () => {
  let http: HttpClient;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }, HttpClient]
    });
    http = TestBed.get(HttpClient);
  });

  it('should be created', () => {
    const service: ErrorMessageReprocessingPayloadService = TestBed.get(ErrorMessageReprocessingPayloadService);
    expect(service).toBeTruthy();
  });
});
