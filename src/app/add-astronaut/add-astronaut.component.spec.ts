import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAstronautComponent } from './add-astronaut.component';

describe('AddAstronautComponent', () => {
  let component: AddAstronautComponent;
  let fixture: ComponentFixture<AddAstronautComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAstronautComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAstronautComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
