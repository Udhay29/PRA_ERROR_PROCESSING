import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleFormComponent } from './schedule-form.component';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmationService } from 'primeng/api';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ScheduleFormComponent', () => {
  let component: ScheduleFormComponent;
  let fixture: ComponentFixture<ScheduleFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleFormComponent],
      imports: [
        DialogModule,
        TableModule,
        DropdownModule,
        FormsModule,
        MessageModule,
        CalendarModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        ConfirmationService,
        MessageService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
