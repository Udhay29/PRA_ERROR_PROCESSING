import {LicenseTypePipe} from './licenseType.pipe';

describe('LicenseTypePipe', () => {
    const pipe = new LicenseTypePipe();
    it ('should transform license abbr to fully spelled out value', () => {
        expect(pipe.transform('CA')).toBe('Commercial Driver (CA)');
        expect(pipe.transform('CB')).toBe('Commercial Driver (CB)');
        expect(pipe.transform('CC')).toBe('Commercial Driver (CC)');
        expect(pipe.transform('CH')).toBe('Chauffeur (CH)');
        expect(pipe.transform('M')).toBe('Motorcycle (M)');
        expect(pipe.transform('T')).toBe('Truck (T)');
        expect(pipe.transform('CDL')).toBe('CDL (CDL)');
        expect(pipe.transform('D')).toBe('Type D (D)');
        expect(pipe.transform('NCDL')).toBe('Non-Commercial Driver`s License (NCDL)');
        expect(pipe.transform('')).toBe('');

    });
});