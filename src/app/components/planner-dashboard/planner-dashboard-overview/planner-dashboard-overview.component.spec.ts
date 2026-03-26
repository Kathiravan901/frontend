import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlannerDashboardOverviewComponent } from './planner-dashboard-overview.component';

describe('PlannerDashboardOverviewComponent', () => {
  let component: PlannerDashboardOverviewComponent;
  let fixture: ComponentFixture<PlannerDashboardOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlannerDashboardOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlannerDashboardOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
