import {WorkTypePipe} from './workType.pipe';

describe('WorkTypePipe', () => {
    const pipe = new WorkTypePipe();
    it ('should transform singular letter value to fully-spelled out value', () => {
        expect(pipe.transform('F')).toBe('Full Time');
        expect(pipe.transform('P')).toBe('Part Time');
        expect(pipe.transform('')).toBe('');
    });
});