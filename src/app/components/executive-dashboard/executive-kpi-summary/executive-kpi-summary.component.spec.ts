import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExecutiveKpiSummaryComponent } from './executive-kpi-summary.component';

describe('ExecutiveKpiSummaryComponent', () => {
  let component: ExecutiveKpiSummaryComponent;
  let fixture: ComponentFixture<ExecutiveKpiSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutiveKpiSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExecutiveKpiSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
