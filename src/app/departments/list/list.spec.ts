import { ComponentFixture, TestBed } from '@angular/core/testing';

import { d_List } from './list';

describe('List', () => {
  let component: d_List;
  let fixture: ComponentFixture<d_List>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [d_List]
    })
    .compileComponents();

    fixture = TestBed.createComponent(d_List);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
