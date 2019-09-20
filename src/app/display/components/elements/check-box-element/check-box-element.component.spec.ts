import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckBoxElementComponent } from './check-box-element.component';

describe('CheckBoxElementComponent', () => {
  let component: CheckBoxElementComponent;
  let fixture: ComponentFixture<CheckBoxElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckBoxElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckBoxElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
