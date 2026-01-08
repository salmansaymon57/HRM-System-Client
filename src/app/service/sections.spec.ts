import { TestBed } from '@angular/core/testing';

import { sectionService } from './sections';

describe('sectionService', () => {
  let service: sectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(sectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
