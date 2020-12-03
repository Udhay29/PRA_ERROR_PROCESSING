import { TestBed, async, inject } from '@angular/core/testing';

import { CanDeactivateGuard } from './can-deactivate.guard';
import { of } from 'rxjs';

describe('CanDeactivateGuard', () => {
  let canDeactivateGuard: CanDeactivateGuard;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [CanDeactivateGuard]
    });
  });

  beforeEach(() => {
    canDeactivateGuard = TestBed.get(CanDeactivateGuard);
  });

  it('should ...', inject([CanDeactivateGuard], (guard: CanDeactivateGuard) => {
    expect(guard).toBeTruthy();
  }));

  it('should return false as canDeactivate is false', () => {
    expect(
      canDeactivateGuard.canDeactivate({ canDeactivate: () => false })
    ).toBeFalsy();
  });

  it('should return true as canDeactivate is null', () => {
    expect(
      canDeactivateGuard.canDeactivate({ canDeactivate: null })
    ).toBeTruthy();
  });
});
