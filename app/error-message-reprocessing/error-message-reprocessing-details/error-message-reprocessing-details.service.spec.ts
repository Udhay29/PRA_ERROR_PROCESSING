import { TestBed } from '@angular/core/testing';

import { ErrorMessageReprocessingDetailsService } from './error-message-reprocessing-details.service';
import { HttpClient } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ErrorMessageReprocessingDetailsService', () => {
  let http: HttpClient;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppModule, HttpClientTestingModule],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }, HttpClient]
    });
    http = TestBed.get(HttpClient);
  });

  it('should be created', () => {
    const service: ErrorMessageReprocessingDetailsService = TestBed.get(ErrorMessageReprocessingDetailsService);
    expect(service).toBeTruthy();
  });
});
