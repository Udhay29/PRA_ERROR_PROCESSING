import {} from 'jasmine';

import { CheckboxFilter, ElasticFilter, Filter } from './filter.model';
import { EventEmitter } from '@angular/core';
import { Checkbox } from 'primeng/checkbox';

class MockAutocomplete {
    inputEL = { nativeElement: { value: 1 }};
    value = 1;
}

describe('CheckboxFilterModel', () => {
    let model: CheckboxFilter;
    const filterModel = ['activeTeamsOnly'];
    const defaultOption = {label: 'Active', value: 'activeTeamsOnly', indexOf: '0'};

    beforeEach(() => {
        model = new CheckboxFilter('testFilter', 'test', 'Active', null,
        [defaultOption], filterModel);
    });

    it('should create an instance', () => {
        expect(model).toBeTruthy();
        expect(model.isActive()).toEqual(true);
    });

    it('should reset all filters', () => {
        model.reset();
        expect(model.searchText).toEqual('');
        expect(model.model).toEqual(['activeTeamsOnly']);
    });

    it('should reset all filters with no defaultOptionLabel', () => {
        const basicModel: CheckboxFilter = new CheckboxFilter('testFilter', 'test');
        basicModel.reset();
        expect(basicModel.searchText).toEqual('');
        expect(basicModel.model).toEqual([]);
        expect(basicModel.isActive()).toEqual(false);
    });

    it('should search for selected', () => {
        model.searchSelected('test', new EventEmitter<Filter>());
        expect(model.selectedSearches).toEqual(['test']);
        expect(model.model).toEqual(['activeTeamsOnly', 'test']);
        expect(model.searchText).toEqual('');
    });

    it('should filter values', () => {
        expect(model.filterValues(['test'])).toEqual([]);
    });

});

describe('ElasticFilterModel', () => {
    let model: ElasticFilter;

    beforeEach(() => {
       model = new ElasticFilter('testFilter', 'test', null);
    });

    it('should create an instance', () => {
        expect(model).toBeTruthy();
    });

    it('should reset', () => {
        model.reset();
        expect(model.model).toEqual([]);
        expect(model.selectedSearches).toEqual([]);
        expect(model.searchText).toEqual(null);
        expect(model.isActive()).toEqual(false);
    });

    it('should remove parentheses', () => {
        const term = '(hello)';
        const parsedTerm = '\\(hello\\)';
        expect(model.parsedParenthesis(term)).toEqual(parsedTerm);
    });

    it('should add a filter', () => {
        const mockAuto: MockAutocomplete = new MockAutocomplete();
        model.searchSelected('test', new EventEmitter<Filter>(), mockAuto);
        expect(model.selectedSearches).toEqual(['test']);
        expect(model.model).toEqual(['test']);
    });

    it('should not duplicate a filter', () => {
        model.selectedSearches = ['test'];
        model.model = ['test'];
        const mockAuto: MockAutocomplete = new MockAutocomplete();
        model.searchSelected('test', new EventEmitter<Filter>(), mockAuto);
        expect(model.selectedSearches).toEqual(['test']);
        expect(model.model).toEqual(['test']);
    });
});
