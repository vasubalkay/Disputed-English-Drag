import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VerticalLineElementComponent } from './vertical-line-element.component';

describe('VerticalLineElementComponent', () => {
  let component: VerticalLineElementComponent;
  let fixture: ComponentFixture<VerticalLineElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerticalLineElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerticalLineElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
