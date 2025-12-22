import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Unverified } from './unverified';

describe('Unverified', () => {
  let component: Unverified;
  let fixture: ComponentFixture<Unverified>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Unverified]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Unverified);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
