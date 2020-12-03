import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Accordion } from 'primeng/accordion';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import {
  DeliveryMethods,
  NotificationCategory,
  NotificationCriterion,
  NotificationPerson,
  NotificationSubcategory,
  NotificationSubscription,
  NotificationType,
  SubscriptionCriteria
} from '../notifications.model';
import { NotificationsService } from '../notifications.service';
import * as fromNotification from '../state';
import * as notificationActions from '../state/notification.actions';
import {
  NotificationCriteriaType,
  notificationCriteriaTypes
} from './notification-criteria-types';
import { notificationSubcategoryTypes } from './notification-subcategory-types';

@Component({
  selector: 'admin-notification-add-edit',
  templateUrl: './notification-add-edit.component.html',
  styleUrls: ['./notification-add-edit.component.scss']
})
export class NotificationAddEditComponent implements OnInit, OnDestroy {
  readonly EDIT_CHANGE_TEXT =
    'Updating Notification Category or Notification Subcategory ' +
    'will reset all the Notification Types and Notification Criteria.' +
    ' Do you wish to proceed?';
  editing: boolean;
  loading: boolean;
  loading$: Subscription;
  suggestions: string[] = [];
  categories: NotificationCategory[];
  categorySuggestions: NotificationCategory[];
  selectedCategory: NotificationCategory;
  subcategories: NotificationSubcategory[];
  subcategorySuggestions: NotificationSubcategory[];
  selectedSubcategory: NotificationSubcategory;
  types: NotificationType[];
  typeSuggestions: NotificationType[];
  criteria: NotificationCriterion[];
  contactSuggestions: NotificationPerson[][] = [];
  contacts$: Subject<any>[] = [];
  notification: NotificationSubscription;
  selectedNotification$: Subscription;
  @ViewChild('accordion') accordion: Accordion;

  formNotification: FormGroup = this.fb.group({
    category: ['', Validators.required],
    subcategory: ['', Validators.required],
    types: [[], Validators.required],
    criteria: this.fb.group({}),
    contacts: this.fb.array([])
  });
  criteriaValues: any[] = [];

  get formTypes(): NotificationType[] {
    return this.formNotification.get('types').value as NotificationType[];
  }
  set formTypes(types: NotificationType[]) {
    this.formNotification.get('types').setValue(types);
  }

  get formCriteria(): FormGroup {
    return this.formNotification.get('criteria') as FormGroup;
  }

  set formCriteria(criteria: FormGroup) {
    this.formNotification.setControl('criteria', criteria);
  }

  get formContacts(): FormArray {
    return this.formNotification.get('contacts') as FormArray;
  }

  set formContacts(contacts: FormArray) {
    this.formNotification.setControl('contacts', contacts);
  }
  addContact(contact: FormGroup) {
    this.formContacts.push(contact);
  }
  newContact() {
    this.touchThings('category', 'subcategory', 'types');
    if (this.isTouchedAndInvalid('types')) {
      return;
    }
    this.addContact(
      this.fb.group({
        contactType: ['', Validators.required],
        contact: ['', Validators.required],
        inApp: [false],
        email: [false],
        mobile: [false]
      })
    );
    this.contacts$.push(new Subject<any>());
  }
  buildNewContact(
    type: string,
    contact: NotificationPerson,
    inApp: boolean,
    email: boolean,
    mobile: boolean
  ) {
    this.addContact(
      this.fb.group({
        contactType: [type, Validators.required],
        contact: [contact, Validators.required],
        inApp: inApp,
        email: [email],
        mobile: [mobile]
      })
    );
  }

  constructor(
    private notificationService: NotificationsService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private appService: AppService,
    private store: Store<any>
  ) {}

  ngOnInit() {
    this.loading$ = this.store
      .pipe(select(fromNotification.getLoading))
      .subscribe((value: boolean) => {
        this.loading = value;
      });

    this.notificationService.getCategories().subscribe(categories => {
      this.categories = categories;
    });

    this.route.paramMap.subscribe(params => {
      if (params.has('id')) {
        this.setBreadcrumbs(params.get('id'));
        this.editing = true;
        this.store.dispatch(
          new notificationActions.LoadSelectedNotificaiton(+params.get('id'))
        );
        this.selectedNotification$ = this.store
          .pipe(select(fromNotification.getSelectedNotification))
          .subscribe((notificationDetail: NotificationSubscription) => {
            if (notificationDetail) {
              this.notification = notificationDetail;
              this.initEdit();
            }
          });
      }
    });
  }

  ngOnDestroy() {
    if (this.selectedNotification$) {
      this.selectedNotification$.unsubscribe();
    }
  }

  checkIfEditing(message: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.editing) {
        resolve();
        return;
      }
      this.confirmationService.confirm({
        message: message,
        accept: resolve,
        reject: reject
      });
    });
  }

  initEdit(): void {
    forkJoin(
      this.notificationService.getSubcategories(this.notification.category),
      this.notificationService.getTypes(
        this.notification.category,
        this.notification.subcategory
      ),
      this.notificationService.getCriteria(
        this.notification.category,
        this.notification.subcategory
      )
    ).subscribe(results => {
      this.subcategories = results[0];
      this.types = results[1];
      this.criteria = results[2];
      this.populateForm();
    });
  }

  populateForm() {
    this.selectedCategory = this.categories.find(
      cat => cat.description === this.notification.category
    );
    this.formNotification.get('category').setValue(this.selectedCategory);
    this.selectedSubcategory = this.subcategories.find(
      subcat => subcat.description === this.notification.subcategory
    );
    this.formNotification.get('subcategory').setValue(this.selectedSubcategory);
    this.sortCriteria();
    if (this.notification.criteria) {
      this.initCriteria(this.notification.criteria);
    }
    this.formTypes = this.notification.types.map(typeString =>
      this.types.find(type => type.name === typeString)
    );
    this.typeSelected();
    this.notification.subscribers.forEach(
      subscriber =>
        this.buildNewContact(
          subscriber.person.type,
          subscriber.person,
          subscriber.deliveryMethods.includes(DeliveryMethods.IN_APP),
          subscriber.deliveryMethods.includes(DeliveryMethods.EMAIL),
          false
        ) // TODO: Change this to be like the others when it's possible.
    );
    this.loading = false;
  }

  setBreadcrumbs(id: string): void {
    const breadcrumbs: MenuItem[] = [
      { label: 'Notification Management', routerLink: '/notifications' },
      { label: 'Detail', routerLink: '/notifications/' + id },
      { label: 'Edit' }
    ];
    this.appService.breadcrumbs = breadcrumbs;
  }

  get contactDropdownOptions(): string[] {
    const list = ['Internal'];
    if (!this.someSelectedTypesAreInternalOnly()) {
      list.push('External');
    }
    return list;
  }

  isTouchedAndInvalid(key: string | Array<string | number>): boolean {
    return (
      this.formNotification.get(key).touched &&
      this.formNotification.get(key).invalid
    );
  }

  touchThings(...keys: string[]) {
    keys.forEach(key => {
      this.formNotification.get(key).markAsTouched();
    });
  }

  touchAllCriteriaFields(): void {
    this.criteria.forEach(criterion => {
      this.formCriteria
        .get(criterion.classification)
        .get(criterion.description)
        .markAsTouched();
    });
  }

  resetFormThings(...keys: string[]) {
    const resetMap = {
      subcategory: this.fb.control('', Validators.required),
      types: this.fb.control([], Validators.required),
      criteria: this.fb.group({}),
      contacts: this.fb.array([], Validators.required)
    };
    for (const key of keys) {
      if (this.formNotification.get(key)) {
        this.formNotification.setControl(key, resetMap[key]);
      }
    }
  }

  suggestCategories(event: any) {
    this.categorySuggestions = this.categories.filter(cat =>
      cat.description.toLowerCase().includes(event.query.toLowerCase())
    );
  }

  categorySelected() {
    this.checkIfEditing(this.EDIT_CHANGE_TEXT).then(
      () => {
        this.resetFormThings('subcategory', 'types', 'criteria', 'contacts');
        const cat: NotificationCategory = this.formNotification.get('category')
          .value;
        this.notificationService
          .getSubcategories(cat.description)
          .subscribe(results => {
            this.subcategories = results;
          });
      },
      () => {
        this.formNotification.get('category').setValue(this.selectedCategory);
      }
    );
  }

  suggestSubcategories(event: any) {
    this.formNotification.get('category').markAsTouched();
    if (this.isTouchedAndInvalid('category')) {
      this.subcategorySuggestions = [];
      return;
    }
    this.subcategorySuggestions = this.subcategories.filter(subcat =>
      subcat.description.toLowerCase().includes(event.query.toLowerCase())
    );
  }

  subcategorySelected() {
    this.checkIfEditing(this.EDIT_CHANGE_TEXT).then(
      () => {
        this.resetFormThings('types', 'criteria', 'contacts');
        const cat: NotificationCategory = this.formNotification.get('category')
          .value;
        const subcat: NotificationSubcategory = this.formNotification.get(
          'subcategory'
        ).value;
        this.notificationService
          .getTypes(cat.description, subcat.description)
          .subscribe(types => {
            this.types = types;
          });
        this.notificationService
          .getCriteria(cat.description, subcat.description)
          .subscribe(criteria => {
            this.criteria = criteria;
            this.sortCriteria();
            this.setCriteriaValidators();
          });
      },
      () => {
        this.formNotification
          .get('subcategory')
          .setValue(this.selectedSubcategory);
      }
    );
  }

  setCriteriaValidators(): void {
    this.criteria.forEach(criterion => {
      const criterionType = this.getCriteriaType(criterion.description);
      const validatorObjs = criterionType && criterionType.validators
        ? criterionType.validators
        : null;
      if (validatorObjs) {
        const validators = validatorObjs.map(
          validatorObj => validatorObj.validator
        );
        const formElement = this.formCriteria
          .get(criterion.classification)
          .get(criterion.description);
        formElement.setValidators(Validators.compose(validators));
      }
    });
  }

  resetCriteriaValidators(event: any): void {
    if (notificationSubcategoryTypes[event.name]) {
      const requiredCriteria: string[] =
        notificationSubcategoryTypes[event.name].required;
      const requiredFields: Set<string> = this.getRequiredFields();
      const intersection = new Set(
        requiredCriteria.filter(value => requiredFields.has(value))
      );
      if (intersection.size === 0) {
        requiredCriteria.forEach(name => {
          const validators = this.getCriteriaTypeValidators(name);
          const classification = this.criteria.find(
            criterion => criterion.description === name
          ).classification;
          const formElement = this.formCriteria.get(classification).get(name);
          formElement.clearValidators();
          formElement.setValidators(Validators.compose(validators));
          formElement.updateValueAndValidity();
        });
      }
    }
  }

  getCriteriaType(name: string): NotificationCriteriaType {
    return notificationCriteriaTypes.find(type => name === type.name);
  }

  getRequiredFields(): Set<string> {
    const result: string[] = [];
    return new Set(
      result.concat.apply(
        [],
        this.formTypes.map(
          type => notificationSubcategoryTypes[type.name].required
        )
      )
    );
  }

  suggestTypes(event: any) {
    this.formNotification.get('category').markAsTouched();
    this.formNotification.get('subcategory').markAsTouched();
    if (
      this.isTouchedAndInvalid('category') ||
      this.isTouchedAndInvalid('category')
    ) {
      this.typeSuggestions = [];
      return;
    }
    this.typeSuggestions = this.types.filter(
      subcat =>
        !this.formTypes.includes(subcat) &&
        subcat.name.toLowerCase().includes(event.query.toLowerCase())
    );
  }

  typeSelected(event?: any) {
    if (this.someSelectedTypesAreInternalOnly()) {
      this.formContacts = this.fb.array(
        this.formContacts.controls.filter(
          control => control.get('contactType').value === 'Internal'
        )
      );
    }
    if (!!event && notificationSubcategoryTypes[event.name]) {
      notificationSubcategoryTypes[event.name].required.forEach(required => {
        const classification: string = this.criteria.find(
          criterion => criterion.description === required
        ).classification;
        const criteriaValidators = this.getCriteriaTypeValidators(required);
        const formElement = this.formCriteria.get(classification).get(required);
        criteriaValidators.push(Validators.required);
        formElement.setValidators(Validators.compose(criteriaValidators));
        formElement.updateValueAndValidity();
      });
    }
  }

  someSelectedTypesAreInternalOnly(): boolean {
    return this.formTypes.some(type => {
      if (type) {
        return type.internalOnly;
      }
    });
  }

  sortCriteria() {
    this.formCriteria = this.fb.group({});
    for (const criterion of this.criteria) {
      if (!criterion.classification) {
        continue;
      }
      if (!this.formCriteria.contains(criterion.classification)) {
        this.formCriteria.registerControl(
          criterion.classification,
          this.fb.group({})
        );
      }
      (this.formCriteria.get(
        criterion.classification
      ) as FormGroup).registerControl(
        criterion.description,
        this.fb.control('')
      );
    }
  }

  initCriteria(criteria: SubscriptionCriteria[]): void {
    criteria.forEach(criterion => {
      const criterionType = this.getCriteriaType(criterion.code);
      const classification = this.criteria.find(
        criterionObj => criterionObj.description === criterion.code
      ).classification;
      const formControl = this.formCriteria
        .get(classification)
        .get(criterion.code);
      if (criterionType.multivalue) {
        formControl.setValue(
          criterion.values.map(value => criterionType.mapFormValue(value))
        );
      } else {
        formControl.setValue(criterionType.mapFormValue(criterion.values));
      }
      formControl.setValidators(this.getCriteriaTypeValidators(criterion.code));
      formControl.updateValueAndValidity();
    });
  }

  getCriteriaTypeValidators(name: string): any[] {
    return this.getCriteriaType(name).validators
      ? this.getCriteriaType(name).validators.map(
          validator => validator.validator
        )
      : [];
  }

  getKeys(thing: any): string[] {
    return Object.keys(thing);
  }

  getControls(group: FormGroup): { [key: string]: AbstractControl } {
    return group.controls;
  }

  contactTypeChange(event: any, row: number) {
    if (this.contacts$[row] && this.contacts$[row].observers.length > 0) {
      this.contacts$[row].observers.forEach(observer => {
        observer.complete();
      });
    }
    if (event === 'Internal') {
      this.formContacts
        .at(row)
        .get('inApp')
        .enable();
      this.formContacts
        .at(row)
        .get('inApp')
        .setValue(true);
      this.formContacts
        .at(row)
        .get('email')
        .setValue(false);
      this.formContacts
        .at(row)
        .get('mobile')
        .disable();
    } else {
      this.formContacts
        .at(row)
        .get('inApp')
        .disable();
      this.formContacts
        .at(row)
        .get('mobile')
        .disable();
      this.formContacts
        .at(row)
        .get('email')
        .setValue(true);
    }
    this.contacts$[row] = new Subject<any>();
    this.contacts$[row]
      .pipe(
        switchMap((input: string) =>
          event === 'Internal'
            ? this.notificationService.getInternalContacts(input)
            : this.notificationService.getExternalContacts(input)
        )
      )
      .subscribe((suggestions: NotificationPerson[]) => {
        this.contactSuggestions[row] = suggestions;
      });
  }

  suggestContacts(event: any, row: number) {
    this.contacts$[row].next(event.query);
  }

  saveForm() {
    if (this.formNotification.valid) {
      const saveObj = this.formNotification.value;
      if (this.editing) {
        saveObj.id = this.notification.id;
        saveObj.status = this.notification.status;
      }
      this.notificationService
        .sendNotificationRequest(saveObj, this.criteria, this.editing)
        .subscribe(
          (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Notification Created',
              detail: 'Subscribed Successfully'
            });
            this.formNotification.markAsPristine();
            this.store.dispatch(
              new notificationActions.ClearSelectedNotification()
            );
            this.router.navigateByUrl(`/notifications/${response.userNotificationSubscriptionID}`);
          },
          (err: HttpErrorResponse) => {
            this.handleHttpError(err);
          }
        );
    } else {
      if (this.criteria) {
        this.touchAllCriteriaFields();
      }
      this.openInvalidAccordionTabs();
      this.touchThings(
        'category',
        'subcategory',
        'types',
        'criteria',
        'contacts'
      );
      this.generateInvalidFormErrorMessage();
    }
  }

  private handleHttpError(err: HttpErrorResponse) {
    let detailErrorString = err.statusText;
    if (err.error && err.error.errors) {
      const detailErrorName = [];
      err.error.errors.forEach(e => {
        if (e.errorMessage.indexOf('SQL') !== -1) {
          detailErrorString =
            'Notification cannot be subscribed to the database.';
        }
        return detailErrorName.push(e.errorMessage);
      });
      if (detailErrorName.length) {
        detailErrorString = detailErrorName.join(', ');
      }
    } else {
      detailErrorString =
        'Notification Subscription service is currently unavailable';
    }
    this.messageService.add({
      severity: 'error',
      summary: 'Error Saving Notifications',
      detail: detailErrorString
    });
  }

  private generateInvalidFormErrorMessage() {
    if (this.formNotification.pristine) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Changes',
        detail: 'Nothing has been changed that needs saving.'
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Form',
        detail: this.getValidationErrorDetail()
      });
    }
  }

  private getValidationErrorDetail(): string {
    return this.getFormValidationErrors()
      .map((error: ValidationError) => {
        return FieldNames[error.field] + ErrorMessages[error.error];
      })
      .join(', ');
  }

  getFormValidationErrors(): ValidationError[] {
    const errors: ValidationError[] = [];
    Object.keys(this.formNotification.controls).forEach(key => {
      const controlErrors: ValidationErrors = this.formNotification.get(key)
        .errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError: string) => {
          errors.push({ field: key, error: keyError });
        });
      }
    });
    if (this.formCriteria.invalid) {
      errors.push({ field: 'NotificationCriteria', error: 'required' });
    }
    return errors;
  }

  onCancel(): void {
    if (this.editing) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.formNotification.dirty) {
      this.confirmationService.confirm({
        message: 'Any changes will be lost, do you want to continue?',
        accept: () => {
          this.formNotification.reset();
          this.onCancel();
          return true;
        }
      });
    } else {
      this.formNotification.reset();
      return true;
    }
  }

  suggestCriteriaValues(event: any, key: string) {
    const criteriaType = this.getCriteriaType(key);
    if (criteriaType.service) {
      this.notificationService
        .fetchCriteriaValues(
          criteriaType.service,
          event.query,
          this.formNotification.get('criteria')
        )
        .subscribe(resp => {
          this.suggestions[`${criteriaType.name}`] = resp.map(response => {
            return criteriaType.mapLabelValue(response);
          });
        });
    }
  }

  isMultiValue(key: string): boolean {
    return this.getCriteriaType(key) && this.getCriteriaType(key).multivalue
      ? this.getCriteriaType(key).multivalue
      : false;
  }

  isATypeahead(key: string): boolean {
    return this.getCriteriaType(key) && this.getCriteriaType(key).typeahead
      ? this.getCriteriaType(key).typeahead
      : false;
  }

  isADropdown(key: string): boolean {
    return this.getCriteriaType(key) &&
      this.getCriteriaType(key).dropdown !== undefined
      ? this.getCriteriaType(key).dropdown
      : true;
  }

  getErrorsArray(key: string, classification: string): string[] {
    let errors: ValidationErrors;
    if (
      this.formCriteria.get(classification).get(key).errors &&
      this.formCriteria.get(classification).get(key).touched
    ) {
      errors = this.formCriteria.get(classification).get(key).errors;
    }
    if (errors) {
      return Object.keys(errors);
    }
  }

  openInvalidAccordionTabs(): void {
    this.accordion.tabs.forEach(tab => {
      if (this.formCriteria.get(tab.header.toLowerCase()).invalid) {
        tab.selected = true;
      }
    });
  }
}

interface ValidationError {
  field: string;
  error: string;
}

enum FieldNames {
  category = 'Notification Category',
  subcategory = 'Notification Subcategory',
  types = 'Notification type',
  contacts = 'Subscribed Contacts',
  criterias = 'Notification Criteria'
}

enum ErrorMessages {
  maxlength = ' is too long',
  required = ' is required'
}
