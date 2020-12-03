import { PipeTransform, Pipe } from '@angular/core';
import { notificationCriteriaTypes } from 'src/app/notifications/notification-add-edit/notification-criteria-types';

@Pipe({ name: 'errorMessage' })
export class CriteriaErrorMessagePipe implements PipeTransform {
  transform(value: string, validatorType: string) {
    const criteriaType = notificationCriteriaTypes.find(
      type => type.name === value
    );
    const validatorObject = criteriaType.validators.find(
      validator => validatorType === validator.type
    );
    return validatorObject
      ? validatorObject.message
      : `${value} field is required`;
  }
}
