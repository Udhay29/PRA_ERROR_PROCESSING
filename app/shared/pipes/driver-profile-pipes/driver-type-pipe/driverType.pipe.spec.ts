import {DriverTypePipe} from './driverType.pipe';

describe('DriverTypePipe', () => {
    const pipe = new DriverTypePipe();
    it ('should transform singular letter value to fully-spelled out value', () => {
        expect(pipe.transform('LOC')).toBe('Local');
        expect(pipe.transform('REG')).toBe('Regional');
        expect(pipe.transform('OTR')).toBe('Over the Road');
        expect(pipe.transform('')).toBe('');
    });
});