import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExecutiveKpiTrendsComponent } from './executive-kpi-trends.component';

describe('ExecutiveKpiTrendsComponent', () => {
  let component: ExecutiveKpiTrendsComponent;
  let fixture: ComponentFixture<ExecutiveKpiTrendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutiveKpiTrendsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExecutiveKpiTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
