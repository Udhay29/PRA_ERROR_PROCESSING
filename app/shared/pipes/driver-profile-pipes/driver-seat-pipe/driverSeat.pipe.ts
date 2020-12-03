import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'driverSeat'
})
export class DriverSeatPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case '1':
        return '1st';
      case '2':
        return '2nd';
      case '3':
        return 'Co-Driver';
      case '4':
        return 'Local';
      case '5':
        return 'Trainee';
      default:
        return '';
    }
  }
}
