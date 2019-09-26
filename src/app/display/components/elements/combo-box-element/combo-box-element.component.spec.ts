import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ComboBoxElementComponent } from './combo-box-element.component';

describe('ComboBoxElementComponent', () => {
  let component: ComboBoxElementComponent;
  let fixture: ComponentFixture<ComboBoxElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComboBoxElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComboBoxElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
