import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementsPaneComponent } from './elements-pane.component';

describe('ElementsPaneComponent', () => {
  let component: ElementsPaneComponent;
  let fixture: ComponentFixture<ElementsPaneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElementsPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementsPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
