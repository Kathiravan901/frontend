import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlannerManageResolutionActionsComponent } from './planner-manage-resolution-actions.component';

describe('PlannerManageResolutionActionsComponent', () => {
  let component: PlannerManageResolutionActionsComponent;
  let fixture: ComponentFixture<PlannerManageResolutionActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlannerManageResolutionActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlannerManageResolutionActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
