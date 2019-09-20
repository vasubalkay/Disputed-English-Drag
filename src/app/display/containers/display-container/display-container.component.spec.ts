import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayContainerComponent } from './display-container.component';

describe('DownlinkContainerComponent', () => {
  let component: DisplayContainerComponent;
  let fixture: ComponentFixture<DisplayContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
