import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlannerManageExceptionEventsComponent } from './planner-manage-exception-events.component';

describe('PlannerManageExceptionEventsComponent', () => {
  let component: PlannerManageExceptionEventsComponent;
  let fixture: ComponentFixture<PlannerManageExceptionEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlannerManageExceptionEventsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlannerManageExceptionEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
