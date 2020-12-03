import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ErrorMessageReprocessingComponent } from './error-message-reprocessing.component';
import { ErrorMessageReprocessingDetailsComponent
} from './error-message-reprocessing-details/error-message-reprocessing-details.component';
import { ErrorMessageReprocessingPayloadComponent
 } from './error-message-reprocessing-payload/error-message-reprocessing-payload.component';

const routes: Routes = [
  {
    path: '',
    component: ErrorMessageReprocessingComponent
  },
  {
    path: 'details/:id',
    component: ErrorMessageReprocessingDetailsComponent
  },
  {
    path: 'payload/:id',
    component: ErrorMessageReprocessingPayloadComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ErrorMessageReprocessingRoutingModule { }
