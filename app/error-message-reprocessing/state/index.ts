import { createSelector, createFeatureSelector } from '@ngrx/store';

const getErrorManagementFeatureState = createFeatureSelector<any>('errorManagementState');

export const getErrorDetails = createSelector(
    getErrorManagementFeatureState,
    state => state.errorDetails
);
