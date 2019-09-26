import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertiesChangeDialogComponent } from './properties-change-dialog.component';

describe('PropertiesChangeDialogComponent', () => {
  let component: PropertiesChangeDialogComponent;
  let fixture: ComponentFixture<PropertiesChangeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertiesChangeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
