import {StatusPipe} from './status.pipe';

describe('StatusPipe', () => {
    const pipe = new StatusPipe();
    it ('should transform abbr value to fully spelled out value', () => {
        expect(pipe.transform('A')).toBe('Available for Dispatch');
        expect(pipe.transform('L')).toBe('Not Available');
    });
});