import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { FormBuilder, Validators, AbstractControl, FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ErrorMessageReprocessingPayloadService } from './error-message-reprocessing-payload.service';
import { AppService } from '../../app.service';
import { MenuItem } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

import { MessageService } from 'primeng/components/common/messageservice';
import { Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as fromErrorState from '../state';
import { ErrDetails } from '../error-reprocessing.model';

@Component({
  selector: 'admin-error-message-reprocessing-payload',
  templateUrl: './error-message-reprocessing-payload.component.html',
  styleUrls: ['./error-message-reprocessing-payload.component.scss']
})
export class ErrorMessageReprocessingPayloadComponent implements OnInit, OnDestroy {
  payloadData: any;
  isCheckedFlag: boolean;
  payloadForm: FormGroup;
  isDisabled: boolean;
  reprocessParam: any;
  isSubscribeFlag: boolean;
  errorId: number;
  loading$: Subscription;
  errorData: any[];

  constructor(
    private readonly formBuilder: FormBuilder,
    private appService: AppService,
    private store: Store<ErrDetails>,
    private readonly service: ErrorMessageReprocessingPayloadService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private messageService: MessageService,
    private readonly confirmationService: ConfirmationService) {
    this.isSubscribeFlag = true;
    this.isCheckedFlag = false;
    this.isDisabled = false;
    this.route.params.subscribe((params: any) => {
      this.errorId = +params['id'];
    });
    this.setBreadcrumbs(this.errorId);
  }
  ngOnInit() {
    this.payloadForm = this.createPayloadForm();
    this.getMsgDetails();
  }
  ngOnDestroy() {
    this.isSubscribeFlag = false;
  }
  setBreadcrumbs(id?: number): void {
    const breadcrumbs: MenuItem[] = [
      { label: 'Error Reprocessing', routerLink: '/messagereprocessing' },
      { label: 'Exception Detail', routerLink: `/messagereprocessing/details/${id}` },
      { label: 'Header & Payload', routerLink: `/messagereprocessing/payload/${id}` }];
    this.appService.breadcrumbs = breadcrumbs;
  }
  createPayloadForm() {
    return this.formBuilder.group({
      header: new FormControl('', [Validators.required, this.validateEmptyField]),
      payload: new FormControl('', [Validators.required, this.validateEmptyField]),
      comment: new FormControl('', [this.validateEmptyField, Validators.maxLength(500)])
    });
  }

  validateEmptyField(c: FormControl): (object | null) {
    return c.value && !c.value.trim() ? {
      required: {
        valid: false
      }
    } : null;
  }

  handleInput(event) {
    if (event.which === 32) {
      event.preventDefault();
    }
  }
  getMsgDetails() {
    this.loading$ = this.store
      .pipe(select(fromErrorState.getErrorDetails)
      )
      .subscribe((value: ErrDetails) => {
        this.payloadData = value;
      });
    if (this.payloadData && !(Object.entries(this.payloadData).length === 0)) {
      if (this.payloadData.jsonPayload && this.payloadData.jsonPayload.headers
        && this.payloadData.jsonPayload.body) {
        this.patchValues();
      }
    } else {
      this.messageService.add({
        severity: 'info',
        summary: '',
        detail: 'No data available.'
      });
      this.router.navigateByUrl('/messagereprocessing');
    }
  }
  onClickChecked() {
    this.isDisabled = !this.isCheckedFlag;
    this.isCheckedFlag = !this.isCheckedFlag;
  }
  patchValues() {
    this.payloadForm.patchValue({
      header: this.checkAndStringifyJSON(this.payloadData.jsonPayload.headers),
      payload: this.checkAndStringifyJSON(this.payloadData.jsonPayload.body)
    });
  }
  checkAndStringifyJSON(data: string | object): string | object {
    return (this.isJson(data)) ? JSON.stringify(data, undefined, 4) : data;
  }
  isJson(data: string | object): boolean {
    if (data) {
      try {
        const obj = typeof data === 'object' ? data : JSON.parse(data);
        if (obj && typeof obj === 'object') {
          return true;
        }
      } catch (err) {
        return false;
      }
    } else {
      return false;
    }
  }

  createParam(action, isChanged): void {
    this.reprocessParam = {
      action: action,
      actionPlace: '',
      errorMessageComment: this.payloadForm ? this.payloadForm.get('comment').value : '',
      jsonPayload: this.payloadData.jsonPayload,
      isJsonChanged: isChanged,
      errorProcessIds: []
    };
    this.reprocessParam.errorProcessIds.push(this.payloadData.errorProcessId);
  }

  changeCheck(): boolean {
    if (((this.checkAndStringifyJSON(this.payloadData.jsonPayload.headers)
      !== this.payloadForm.get('header').value.trim()) ||
      this.checkAndStringifyJSON(this.payloadData.jsonPayload.body)
      !== this.payloadForm.get('payload').value.trim()) &&
      !this.isCheckedFlag) {
      return true;
    } else {
      return false;
    }
  }

  getIsJsonChanged(): boolean {
    if (this.payloadData.jsonPayload) {
      return this.changeCheck();
    } else {
      return false;
    }
  }
  callErrorReprocess(): void {
    this.service.errorReprocess(this.reprocessParam).pipe(takeWhile(() => this.isSubscribeFlag)).
      subscribe((data: any) => {
        if (!(Object.entries(data).length === 0)) {
          this.messageService.add({
            severity: 'info',
            summary: '',
            detail: 'Error submitted to queue for reprocessing.'
          });
          this.router.navigateByUrl('/messagereprocessing');
        }
      });
  }

  onClickReprocess() {
    this.checkCommentErrors();
    if (this.payloadForm.valid) {
      this.createParam('REPROCESS', this.getIsJsonChanged());
      if (this.reprocessParam.isJsonChanged) {
        this.reprocessParam.jsonPayload.headers = (this.isJson(this.payloadForm.get('header').value.trim())) ?
          JSON.parse(this.payloadForm.get('header').value.trim()) : this.payloadForm.get('header').value.trim();
        this.reprocessParam.jsonPayload.body = (this.isJson(this.payloadForm.get('payload').value.trim())) ?
          JSON.parse(this.payloadForm.get('payload').value.trim()) : this.payloadForm.get('payload').value.trim();
      }
      this.callErrorReprocess();
    } else {
      this.payloadForm.controls['header'].markAsTouched();
      this.payloadForm.controls['header'].updateValueAndValidity();
      this.payloadForm.controls['payload'].markAsTouched();
      this.payloadForm.controls['payload'].updateValueAndValidity();
      if (this.payloadForm.get('payload').invalid || this.payloadForm.get('header').invalid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Message',
          detail: 'Please enter a valid JSON in Header and Payload.'
        });
      }
    }
  }

  checkCommentErrors() {
    const commentField = this.payloadForm.controls['comment'];
    if (commentField.value.trim().length === 0) {
      commentField.setErrors(null);
    }
  }

  onClickDelete() {
    this.payloadForm.controls['comment'].setValidators
      ([this.validateEmptyField, Validators.required,
      Validators.maxLength(500)]);
    this.payloadForm.controls['comment'].markAsTouched();
    this.payloadForm.controls['comment'].updateValueAndValidity();
    if (this.payloadForm.valid) {
      this.confirmationService.confirm({
        message: 'Do you want to delete the error without processing?',
        accept: () => {
          this.createParam('CANCELLED', false);
          this.service.errorReprocess(this.reprocessParam).pipe(takeWhile(() => this.isSubscribeFlag))
            .subscribe((data: any) => {
              if (!(Object.entries(data).length === 0)) {
                this.messageService.add({
                  severity: 'info',
                  summary: '',
                  detail: 'Error has been deleted.'
                });
                this.router.navigateByUrl('/messagereprocessing');
              }
            });
        }
      });
    }
  }
  onClickCancel() {
    if (this.getIsJsonChanged() || this.payloadForm.get('comment').value.trim().length > 0) {
      this.confirmationService.confirm({
        message: 'Clicking on cancel will not make any updates to the data. All the updates will be lost.',
        accept: () => {
          this.router.navigateByUrl('/messagereprocessing');
        }
      });
    } else {
      this.router.navigateByUrl('/messagereprocessing');
    }
  }
}
