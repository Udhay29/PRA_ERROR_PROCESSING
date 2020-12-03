import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'status'
})
export class StatusPipe implements PipeTransform {
    transform(value: string): string {
        if (value === 'A') {
            return 'Available for Dispatch';
        } else {
            return 'Not Available';
        }
    }
}