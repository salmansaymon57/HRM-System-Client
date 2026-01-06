import { TestBed } from '@angular/core/testing';

import { CompanySetup } from './company-setup';

describe('CompanySetup', () => {
  let service: CompanySetup;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanySetup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
