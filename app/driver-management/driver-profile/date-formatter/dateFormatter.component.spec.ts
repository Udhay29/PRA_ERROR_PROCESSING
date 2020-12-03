import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import * as moment from 'moment';
import { AppRoutingModule } from '../../../app-routing.module';
import { ErrorComponent } from '../../../error/error.component';
import { DateFormatterComponent } from './dateFormatter.component';

describe('DateFormatterComponent', () => {
  let component: DateFormatterComponent;
  let fixture: ComponentFixture<DateFormatterComponent>;
  const mockNow: moment.Moment = moment('2019/03/04');

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ErrorComponent, DateFormatterComponent],
      imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateFormatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should check formatted expiration date ', () => {
    const expirationMock = [
      {
        ExpiryDate: '05/20/2027',
        busUnit: 'JBT'
      }
    ];
    const expiredMock = [
      {
        ExpiryDate: '2014/02/04',
        busUnit: 'JBT'
      }
    ];
    const expiringSoonMock = [
      {
        ExpiryDate: '2019/04/23',
        busUnit: 'JBT'
      }
    ];
    const expirationDate = expirationMock[0].ExpiryDate;
    const expiredDate = expiredMock[0].ExpiryDate;
    const expiringSoon = expiringSoonMock[0].ExpiryDate;
    expect(
      component.formatExpirationDate(expirationDate, expirationMock[0].busUnit, mockNow)
    ).toEqual('Expires in 98 Months 16 Days');
    expect(
      component.formatExpirationDate(expiredDate, expiredMock[0].busUnit, mockNow)
    ).toEqual('Expired on 02/04/2014');
    expect(
      component.formatExpirationDate(expiringSoon, expiringSoonMock[0].busUnit, mockNow)
    ).toEqual('04/23/2019 (50 Days)');
  });

  it('should return string value for icons', () => {
    expect(component.loadWarningIcons('2019/04/05', mockNow)).toEqual(
      'icon-Warning_Triangle_Solid icon-orange'
    );
    expect(component.loadWarningIcons('2019/03/03', mockNow)).toEqual(
      'icon-Circle_Warning_Solid icon-red'
    );
  });
});
