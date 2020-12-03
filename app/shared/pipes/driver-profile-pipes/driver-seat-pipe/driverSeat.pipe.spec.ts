import {DriverSeatPipe} from './driverSeat.pipe';

describe('DriverSeatPipe', () => {
    const pipe = new DriverSeatPipe();
    it ('should transform numeric value to string', () => {
        expect(pipe.transform('1')).toBe('1st');
        expect(pipe.transform('2')).toBe('2nd');
        expect(pipe.transform('3')).toBe('Co-Driver');
        expect(pipe.transform('4')).toBe('Local');
        expect(pipe.transform('5')).toBe('Trainee');
        expect(pipe.transform('')).toBe('');
    });
});