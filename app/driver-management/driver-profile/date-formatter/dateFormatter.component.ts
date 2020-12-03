import * as moment from 'moment';
import { Component, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
@Component({
  template: '<ng-content></ng-content>'
})
export class DateFormatterComponent {
  formatExpirationDate(date: any, busUnit: string, now: moment.Moment = moment()) {
    const dayDiff = moment(date).diff(now, 'days');
    const monthDiff = moment(date).diff(now, 'months');
    const daysLeftOver = dayDiff - (moment(now).add(monthDiff, 'months').diff(now, 'days'));
    if (busUnit === 'JBT' && dayDiff <= 90 && dayDiff > 0) {
      return moment(date).format('MM/DD/YYYY') + ' (' + dayDiff + ' Days)';
    }
    if (dayDiff <= 60 && dayDiff > 0) {
      return moment(date).format('MM/DD/YYYY') + ' (' + dayDiff + ' Days)';
    } else if (dayDiff <= 0) {
      return 'Expired on ' + moment(date).format('MM/DD/YYYY');
    } else {
      return this.convertDaysToMonthsAndDays(monthDiff, daysLeftOver);
    }
  }
  loadWarningIcons(date: any, now: moment.Moment = moment()) {
    const dayDiff = moment(date).diff(now, 'days');
    if (dayDiff <= 45 && dayDiff >= 30) {
      return 'icon-Warning_Triangle_Solid icon-orange';
    } else if (dayDiff < 30 && dayDiff >= -30) {
      return 'icon-Circle_Warning_Solid icon-red';
    } else {
      return;
    }
  }
  convertDaysToMonthsAndDays(monthDiff: number, daysLeftOverAfterFullMonthDifferenceCalculated: number) {
    if (daysLeftOverAfterFullMonthDifferenceCalculated > 0) {
      if (daysLeftOverAfterFullMonthDifferenceCalculated === 1) {
        return 'Expires in ' + monthDiff + ' Months ' + daysLeftOverAfterFullMonthDifferenceCalculated + ' Day';
      }
      return 'Expires in ' + monthDiff + ' Months ' + daysLeftOverAfterFullMonthDifferenceCalculated + ' Days';
    } else {
      return 'Expires in ' + monthDiff + ' Months';
    }
  }
}
