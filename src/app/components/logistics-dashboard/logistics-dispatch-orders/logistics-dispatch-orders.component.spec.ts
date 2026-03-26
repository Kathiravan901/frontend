import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogisticsDispatchOrdersComponent } from './logistics-dispatch-orders.component';

describe('LogisticsDispatchOrdersComponent', () => {
  let component: LogisticsDispatchOrdersComponent;
  let fixture: ComponentFixture<LogisticsDispatchOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogisticsDispatchOrdersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogisticsDispatchOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
