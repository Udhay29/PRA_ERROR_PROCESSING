import { Component, OnInit } from '@angular/core';
import { takeWhile } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { AppService } from '../../app.service';
import { ErrorMessageReprocessingDetailsService } from './error-message-reprocessing-details.service';
import {ConfirmationService} from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { Store } from '@ngrx/store';
import * as ErrorResponseAction from '../state/error-reprocessing.actions';
import { ErrDetails, DeleteResponse } from '../error-reprocessing.model';

@Component({
  selector: 'admin-error-message-reprocessing-details',
  templateUrl: './error-message-reprocessing-details.component.html',
  styleUrls: ['./error-message-reprocessing-details.component.scss']
})

export class ErrorMessageReprocessingDetailsComponent implements OnInit {
    data: ErrDetails;
    isSubscribeFlag: boolean;
    errMsg: string;
    errorId: number;
    detailsId: number[];

  constructor(private readonly service: ErrorMessageReprocessingDetailsService,
     private readonly route: Router,
     private readonly router: ActivatedRoute,
     private store: Store<any>,
     private readonly appService: AppService,
     private readonly confirmationService: ConfirmationService,
     private messageService: MessageService
      ) {
        this.isSubscribeFlag = true;
        this.errMsg = '';
        this.detailsId = [];
        this.router.params.subscribe((params: any) => {
          this.errorId = +params['id'];
        });
        this.setBreadcrumbs(this.errorId);
  }

  ngOnInit() {
    this.getErrorDetails(this.errorId);
  }
  setBreadcrumbs(id?: number) {
    const breadcrumbs: MenuItem[] = [
      { label: 'Error Reprocessing', routerLink: '/messagereprocessing' }
    ];
    if (id) {
      breadcrumbs.push({
        label: 'Exception Detail',
        routerLink: `/messagereprocessing/details/${id}`
      });
      this.detailsId.push(id);
    }
    this.appService.breadcrumbs = breadcrumbs;
  }
  getErrorDetails(errorID: number) {
    this.service.errorProcessDetails(errorID)
    .pipe(takeWhile(() => this.isSubscribeFlag))
    .subscribe((data: ErrDetails) => {
      this.data = data;
    });
  }
  onClickHome() {
    this.route.navigate(['/messagereprocessing']);
  }
  onClickNext() {
    this.store.dispatch(new ErrorResponseAction.LoadErrorDetails(this.data));
    this.route.navigate(['/messagereprocessing/payload', this.errorId]);
  }
  onClickDelete() {
    this.confirmationService.confirm({
      message: 'Do you want to delete the error without processing?',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Error has been deleted successfully.'
        });
        this.service.onDelete(this.detailsId, this.data).pipe(takeWhile(() => this.isSubscribeFlag))
        .subscribe((value: DeleteResponse[]) => {
          this.route.navigate(['/messagereprocessing']);
        });
      }
  });
  }
}
