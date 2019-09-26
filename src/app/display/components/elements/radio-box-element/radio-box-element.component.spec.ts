import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioBoxElementComponent } from './radio-box-element.component';

describe('RadioBoxElementComponent', () => {
  let component: RadioBoxElementComponent;
  let fixture: ComponentFixture<RadioBoxElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadioBoxElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioBoxElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
