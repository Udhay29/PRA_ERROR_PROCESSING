import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'driverType'
})
export class DriverTypePipe implements PipeTransform {
    transform(value: string): string {
        if (!value) {
            return '';
        }
        switch (value.toUpperCase()) {
            case 'LOC':
                return 'Local';
            case 'REG':
                return 'Regional';
            case 'OTR':
                return 'Over the Road';
            default:
                return '';
        }
    }
}