import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageReprocessingPayloadComponent } from './error-message-reprocessing-payload.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'primeng/shared';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ErrorMessageReprocessingModule } from '../error-message-reprocessing.module';
import { MessageService } from 'primeng/components/common/messageservice';
import { StoreModule } from '@ngrx/store';
import { AppService } from '../../app.service';
import { ConfirmationService } from 'primeng/api';
import { ErrorMessageReprocessingPayloadService } from './error-message-reprocessing-payload.service';
import { throwError, of } from 'rxjs';
import { Router } from '@angular/router';

describe('ErrorMessageReprocessingPayloadComponent', () => {
  let component: ErrorMessageReprocessingPayloadComponent;
  let fixture: ComponentFixture<ErrorMessageReprocessingPayloadComponent>;
  let messageService: MessageService;
  let errorPayloadService: ErrorMessageReprocessingPayloadService;
  let router: Router;
  let confirmationService: ConfirmationService;

  const fb = new FormBuilder();
  const setting: FormGroup = fb.group({
    header: ['', [Validators.required]],
    payload: ['', Validators.required],
    comment: ['']
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        StoreModule.forRoot({}),
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule,
        ErrorMessageReprocessingModule],
      providers: [MessageService, AppService, ConfirmationService]
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorMessageReprocessingPayloadComponent);
    component = fixture.componentInstance;
    component.payloadForm = setting;
    component.payloadData = {
      errorProcessId: 1,
      jsonPayload: {
        headers: {
          id: 1
        }
      }
    };
    spyOn(component, 'getMsgDetails');
    messageService = TestBed.get(MessageService);
    errorPayloadService = TestBed.get(ErrorMessageReprocessingPayloadService);
    router = TestBed.get(Router);
    confirmationService = TestBed.get(ConfirmationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call onClickChecked when true', () => {
    component.isCheckedFlag = true;
    component.onClickChecked();
    expect(component.isCheckedFlag).toBeFalsy();
    expect(component.isDisabled).toBeFalsy();
  });

  it('should call onClickChecked when false', () => {
    component.isCheckedFlag = false;
    component.onClickChecked();
    expect(component.isCheckedFlag).toBeTruthy();
    expect(component.isDisabled).toBeTruthy();
  });

  it('should call createParam', () => {
    component.createParam('REPROCESS', true);
    expect(component.reprocessParam.errorProcessIds).toEqual([1]);
  });

  it('should call createParam when form not initialised', () => {
    component.payloadForm = undefined;
    component.createParam('REPROCESS', true);
    expect(component.reprocessParam.errorMessageComment).toEqual('');
  });

  it('should call changeCheck', () => {
    expect(component.changeCheck()).toBeTruthy();
  });

  it('should call patchValues', () => {
    component.payloadData.jsonPayload.body = 'test';
    component.patchValues();
    expect(component.payloadForm.get('payload').value).toEqual('test');
  });

  it('should call patchValues when no body', () => {
    component.patchValues();
    expect(component.payloadForm.get('payload').value).toBeUndefined();
  });

  it('should call getIsJsonChanged', () => {
    expect(component.getIsJsonChanged()).toBeTruthy();
  });

  it('should call getIsJsonChanged when no payload', () => {
    component.payloadData.jsonPayload = undefined;
    expect(component.getIsJsonChanged()).toBeFalsy();
  });

  it('should call callErrorReprocess when data', () => {
    spyOn(errorPayloadService, 'errorReprocess').and.returnValue(of({data: 'test'}));
    spyOn(messageService, 'add');
    spyOn(router, 'navigateByUrl');
    component.callErrorReprocess();
    expect(messageService.add).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalled();
  });

  it('should call callErrorReprocess when no data', () => {
    spyOn(errorPayloadService, 'errorReprocess').and.returnValue(of({}));
    spyOn(messageService, 'add');
    spyOn(router, 'navigateByUrl');
    component.callErrorReprocess();
    expect(messageService.add).toHaveBeenCalledTimes(0);
    expect(router.navigateByUrl).toHaveBeenCalledTimes(0);
  });

  it('should call onClickCancel', () => {
    spyOn(confirmationService, 'confirm');
    component.onClickCancel();
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('should call onClickCancel when no payload', () => {
    component.payloadData.jsonPayload = undefined;
    component.payloadForm.controls.comment.patchValue('test');
    spyOn(confirmationService, 'confirm');
    component.onClickCancel();
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('should call onClickCancel when no payload && invalid form', () => {
    component.payloadData.jsonPayload = undefined;
    spyOn(router, 'navigateByUrl');
    component.onClickCancel();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/messagereprocessing');
  });

  it('should call onClickDelete', () => {
    component.onClickDelete();
    expect(component.payloadForm.get('comment').hasError('required')).toBeTruthy();
  });

  it('should call onClickDelete when valid form', () => {
    component.payloadForm.controls.header.patchValue('test');
    component.payloadForm.controls.payload.patchValue('test');
    component.payloadForm.controls.comment.patchValue('test');
    spyOn(confirmationService, 'confirm');
    component.onClickDelete();
    expect(component.payloadForm.get('comment').hasError('required')).toBeFalsy();
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('should call onClickReprocess', () => {
    spyOn(component, 'callErrorReprocess');
    component.onClickReprocess();
    expect(component.callErrorReprocess).toHaveBeenCalledTimes(0);
  });

});
