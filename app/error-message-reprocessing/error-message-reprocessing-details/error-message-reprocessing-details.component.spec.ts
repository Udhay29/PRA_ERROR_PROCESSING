import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageReprocessingDetailsComponent } from './error-message-reprocessing-details.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule } from '@ngrx/store';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { ErrorMessageReprocessingDetailsService } from './error-message-reprocessing-details.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('ErrorMessageReprocessingDetailsComponent', () => {
  let component: ErrorMessageReprocessingDetailsComponent;
  let fixture: ComponentFixture<ErrorMessageReprocessingDetailsComponent>;
  const data = {
    exceptionType: '',
    errorMessage: '',
    dateTime: '',
    errorId: '12',
    errorMessageComment: 'test',
    errorProcessId: 12,
    exceptionDomain: 'test',
    exceptionSubdomain: 'test',
    headerDetails: 'test',
    jsonPayload: {},
    occurrance: 'test',
    originQueue: 'test',
    status: 'test'
  };
  let service: ErrorMessageReprocessingDetailsService;
  let confirmationService: ConfirmationService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorMessageReprocessingDetailsComponent
      ],
      imports: [
        StoreModule.forRoot({}),
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule,
      ],
      providers: [ ConfirmationService, MessageService, ErrorMessageReprocessingDetailsService ]
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorMessageReprocessingDetailsComponent);
    component = fixture.componentInstance;
    service = TestBed.get(ErrorMessageReprocessingDetailsService);
    confirmationService = TestBed.get(ConfirmationService);
    router = TestBed.get(Router);
    component.data = data;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setBreadcrumbs', () => {
    component.setBreadcrumbs(1);
    expect(component.setBreadcrumbs).toBeTruthy();
  });

  it('should call getErrorDetails', () => {
    const detailsDataModel = {
      exceptionType: '',
      errorMessage: '',
      dateTime: '',
      errorId: '12',
      errorMessageComment: 'test',
      errorProcessId: 12,
      exceptionDomain: 'test',
      exceptionSubdomain: 'test',
      headerDetails: 'test',
      jsonPayload: {},
      occurrance: 'test',
      originQueue: 'test',
      status: 'test'
    };
    spyOn(service, 'errorProcessDetails').and.returnValue(of(detailsDataModel));
    component.getErrorDetails(1);
    expect(component.data).toEqual(detailsDataModel);
  });

  it('should call onClickHome', () => {
    spyOn(router, 'navigate');
    component.onClickHome();
    expect(router.navigate).toHaveBeenCalledWith(['/messagereprocessing']);
  });

  it('should call onClickNext', () => {
    spyOn(router, 'navigate');
    component.errorId = 1;
    component.onClickNext();
    expect(router.navigate).toHaveBeenCalledWith(['/messagereprocessing/payload', 1]);
  });

  it('should call onClickDelete', () => {
    component.detailsId = [1, 2];
    component.data = {
      exceptionType: '',
      errorMessage: '',
      dateTime: '',
      errorId: '12',
      errorMessageComment: 'test',
      errorProcessId: 12,
      exceptionDomain: 'test',
      exceptionSubdomain: 'test',
      headerDetails: 'test',
      jsonPayload: {},
      occurrance: 'test',
      originQueue: 'test',
      status: 'test'
    };
    const param = {
      action: 'CANCELLED',
      actionPlace: '',
      errorMessageComment: '',
      isEdited: false,
      errorProcessIds: component.detailsId,
      jsonPayload: component.data['jsonPayload']
    };
    service.onDelete(component.detailsId, param);
    spyOn(confirmationService, 'confirm');
    component.onClickDelete();
    expect(confirmationService.confirm).toHaveBeenCalled();
  });
});
