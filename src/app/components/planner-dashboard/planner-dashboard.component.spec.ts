import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlannerDashboardComponent } from './planner-dashboard.component';

describe('PlannerDashboardComponent', () => {
  let component: PlannerDashboardComponent;
  let fixture: ComponentFixture<PlannerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlannerDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlannerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
