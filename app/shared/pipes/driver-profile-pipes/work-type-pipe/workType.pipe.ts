import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'workType'
})
export class WorkTypePipe implements PipeTransform {
    transform(value: string): string {
        if (!value) {
            return '';
        }
        switch (value.toUpperCase()) {
            case 'F':
                return 'Full Time';
            case 'P':
                return 'Part Time';
            default:
                return '';
        }
    }
}