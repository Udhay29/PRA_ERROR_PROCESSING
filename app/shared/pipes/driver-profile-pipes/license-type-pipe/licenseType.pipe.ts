import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'licenseType'
})
export class LicenseTypePipe implements PipeTransform {
     transform(value: string): string {
        if (!value) {
            return '';
        }
            switch (value.toUpperCase()) {
                case 'CA':
                    return 'Commercial Driver (CA)';
                case 'CB':
                    return 'Commercial Driver (CB)';
                case 'CC':
                    return 'Commercial Driver (CC)';
                case 'CH':
                    return 'Chauffeur (CH)';
                case 'M':
                    return 'Motorcycle (M)';
                case 'T':
                    return 'Truck (T)';
                case 'CDL':
                    return 'CDL (CDL)';
                case 'D':
                    return 'Type D (D)';
                case 'NCDL':
                    return 'Non-Commercial Driver`s License (NCDL)';
                default:
                    return '';
            }
        }
    }