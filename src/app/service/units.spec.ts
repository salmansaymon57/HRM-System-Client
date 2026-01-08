import { TestBed } from '@angular/core/testing';

import { unitService } from './units';

describe('unitService', () => {
  let service: unitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(unitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
